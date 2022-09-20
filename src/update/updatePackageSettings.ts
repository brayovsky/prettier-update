import { join as pJoin } from "path";
import { writeFileSync as fsWriteFileSync } from "fs";
import { render } from "mustache";
import { AxiosResponse } from "axios";

import * as prTemplates from "../util/templates/pr";
import { IPrettierUpdateStage } from "../types/prettierUpdateStage";
import { createADOPullRequest } from "../util/api";
import { IArgs } from "../types/args";
import { IPrettierUpdateConfig } from "../types/prettierUpdateConfig";
import { isError } from "../util/helpers";
import { errorAndExit } from "../util/format";

function copySettingsToPackage(
  settings: IPrettierUpdateConfig,
  packages: string[]
): boolean | Error {
  try {
    const config = settings.prettierConfig;
    packages.forEach((packageRoot) => {
      const prettierrcFile = pJoin(packageRoot, ".prettierrc");
      fsWriteFileSync(prettierrcFile, JSON.stringify(config));
    });
    return true;
  } catch (error) {
    return error;
  }
}

async function createBranch(): Promise<string> {
  return "";
}

function commit(): string {
  return "";
}

export async function createPullRequest(
  config: IPrettierUpdateConfig
): Promise<AxiosResponse<any, any> | Error> {
  const view: IPrettierUpdateStage = {
    stageNumber: 1,
    stageDescription: "Add root settings to packages",
  };
  const title = render(prTemplates.title, view);
  const description = render(prTemplates.body, view);
  const target = `refs/heads/${config.mainBranch}`;
  const source = await createBranch();
  const response = await createADOPullRequest(
    title,
    description,
    source,
    target
  );
  return response;
}

export function managedUpdatePackageSettings(
  args: IArgs,
  config: IPrettierUpdateConfig,
  packages: string[]
) {
  const didCopy = copySettingsToPackage(config, packages);
  isError(didCopy) && errorAndExit((<Error>didCopy).message);
  // createbranch
  // commit
  // pr
}
