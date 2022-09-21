import { join as pJoin } from "path";
import {
  readFileSync as fsReadFileSync,
  writeFileSync as fsWriteFileSync,
} from "fs";

import { fileExists, isError } from "../util/helpers";
import { IArgs } from "../types/args";
import { errorAndExit, info, positive } from "../util/format";
import { branch, clean, push } from "../util/git";
import { IPrettierUpdateConfig } from "../types/prettierUpdateConfig";
import { stageAndCommit } from "workspace-tools";
import { createADOPullRequest } from "../util/api";
import { writeProgress } from "../tracker";

/**
 * TODO
 * Not all possible configs are supported
 * In  change getLegacy settings to support all
 */

// Consider using editorconfig/parsing how prettier does it
function getLegacySettings(cwd: string): string | Error {
  let settingsFile: string, settings: string;
  const possibleJsonConfigs = [".prettier.json", ".prettierrc"];

  for (const configFile of possibleJsonConfigs) {
    if (fileExists(cwd, configFile)) {
      settingsFile = pJoin(cwd, configFile);
      const settingsText = fsReadFileSync(settingsFile);
      settings = settingsText.toString();
    }
  }

  if (!settingsFile) {
    if (fileExists(cwd, "package.json")) {
      const packageJson = fsReadFileSync(pJoin(cwd, "package.json"));
      const packageJsonObj = JSON.parse(packageJson.toString());
      if (packageJsonObj.hasOwnProperty("prettier")) {
        settings = JSON.stringify(packageJsonObj.prettier);
      }
    }
  }

  return settings || new Error("Old prettier settings could not be found");
}

function mergeSettings(mainSettings, localSettings) {
  // Local settings take precedence
}

// TODO: Merge settings if package has prettierrc
function copySettingsToPackages(
  settings: { [key: string]: any },
  packages: string[],
  isVerbose: boolean
): boolean | Error {
  try {
    packages.forEach((packageRoot) => {
      fsWriteFileSync(
        pJoin(packageRoot, ".prettierrc"),
        JSON.stringify(settings)
      );
      isVerbose && info(`Copied .prettierrc to ${packageRoot}`);
    });
    return true;
  } catch (error) {
    return new Error(error.message);
  }
}

// Running prettier --write at the end of this stage should lead to nothing
export async function managedCopySettings(
  args: IArgs,
  packages: string[],
  config: IPrettierUpdateConfig
) {
  const branchName = `user/prettier-updater/copy-legacy-settings-${Math.floor(
    Math.random() * 10e6
  )}`;
  const didBranch = branch(branchName, args);
  isError(didBranch) && errorAndExit((<Error>didBranch).message);

  const settings = getLegacySettings(args.path);
  isError(settings) && errorAndExit((<Error>settings).message, 1);
  const parsedSettings = JSON.parse(<string>settings);
  const didCopy = copySettingsToPackages(
    parsedSettings,
    packages,
    args.verbose
  );
  isError(didCopy) && errorAndExit((<Error>didCopy).message, 1);

  push(branchName, args);
  const response = await createADOPullRequest(branchName, config, {
    stageNumber: 1,
    stageDescription: "Add root settings to packages",
  });

  if (response.status === 200) {
    positive(`Created pull request ${response.data.url}`);
    const didWrite = writeProgress(
      {
        currentStage: 1,
        branches: [
          {
            name: branchName,
            pullRequestID: response.data.pullRequestID,
            pullRequestStatus: response.data.status,
          },
        ],
      },
      args
    );
    if (isError(didWrite)) {
      clean(args);
      errorAndExit((<Error>didWrite).message);
    }
    stageAndCommit(
      [`.`],
      "Prettier Updater - Copy legacy settings to all packages",
      args.path
    );
    push(branchName, args);
  } else {
    clean(args);
    errorAndExit("Failed to create Pull Request");
  }
}
