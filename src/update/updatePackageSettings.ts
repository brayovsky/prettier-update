import { join as pJoin, basename as pBasename } from "path";
import { writeFileSync as fsWriteFileSync } from "fs";
import { IArgs } from "../types/args";
import { IPrettierUpdateConfig } from "../types/prettierUpdateConfig";
import { isError } from "../util/helpers";
import { errorAndExit } from "../util/format";
import { git } from "workspace-tools";
import { branch } from "../util/git";

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

function managedPackageProcess(packageRoot, newPrettierConffig) {
  const branchName = `user/prettier-updater/update--${pBasename(
    packageRoot
  )}-${Math.floor(Math.random() * 10e8)}`;
  // branch()
  const prettierrcFile = pJoin(packageRoot, ".prettierrc");
  fsWriteFileSync(prettierrcFile, JSON.stringify(newPrettierConffig));
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
