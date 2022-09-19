import { join as pJoin } from "path";
import { readFileSync as fsReadFileSync, writeFileSync as fsWriteFileSync } from "fs";

import { fileExists, isError } from "../util/helpers";
import { IArgs } from "../types/args";
import { errorAndExit, verbose } from "../util/format";

/**
 * TODO
 * Not all possible configs are supported
 * In  change getLegacy settings to support all
 */


// Consider using editorconfig/parsing how prettier does it
function getLegacySettings(cwd: string): string | Error{
    let settingsFile: string, settings: string;
    const possibleJsonConfigs = [".prettier.json", ".prettierrc"];

    for (const configFile of possibleJsonConfigs) {
        if(fileExists(cwd, configFile)) {
            settingsFile = pJoin(cwd, configFile);
            const settingsText =  fsReadFileSync(settingsFile);
            settings = settingsText.toString();
        }
    }

    if(!settingsFile) {
        if(fileExists(cwd, "package.json")) {
            const packageJson = fsReadFileSync(pJoin(cwd, "package.json"));
            const packageJsonObj = JSON.parse(packageJson.toString());
            if(packageJsonObj.hasOwnProperty("prettier")) {
                settings = JSON.stringify(packageJsonObj.prettier);
            }
        }
    }

    return settings || new Error("Old prettier settings could not be found");
}

function copySettingsToPackages(cwd: string, settings: {[key: string]: any}, packages: string[], isVerbose: boolean): boolean | Error {
    try {
        packages.forEach(packageRoot => {
            fsWriteFileSync(pJoin(packageRoot, ".prettierrc"), JSON.stringify(settings))
            isVerbose && verbose(`Copied .prettierrc to ${packageRoot}`);
        });
        return true
    } catch (error) {
        return new Error(error.message);
    }
}

export function managedCopySettings(args: IArgs, packages: string[]) {
    const settings = getLegacySettings(args.path)
    isError(settings) && errorAndExit((<Error>settings).message, 1);
    const parsedSettings = JSON.parse(<string>settings);
    const didCopy = copySettingsToPackages(args.path, parsedSettings, packages, args.verbose);
    isError(didCopy) && errorAndExit((<Error>didCopy).message, 1);
}
