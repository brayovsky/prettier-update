import { join as pJoin } from "path";
import { readFileSync as fsReadFileSync, writeFileSync as fsWriteFileSync } from "fs";

import { fileExists } from "../util/helpers";
import { getPackages } from "../util/packages";
import { IArgs } from "../types/args";

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

function transFormPathSettings() {
    // utility fn to resolve if paths in .gitignore should change
}

function copySettingsToPackages(args: IArgs, settings: {[key: string]: any}) {
    const packages = getPackages(args.path);

    packages.forEach(packageRoot => {
        // transform
        fsWriteFileSync(pJoin(packageRoot, ".prettierrc"), JSON.stringify(settings))
    });
}

function getPrettierIgnore(args: IArgs) {
    const prettierIgnoreFile = pJoin(args.path, )
}

function transformIgnorePaths() {
    // utility fn to resolve if paths in .gitignore should change
}

function copyGitIgnoreToPackages() {

}
