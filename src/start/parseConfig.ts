import { resolve as pResolve, join as pJoin, parse } from "path";
import { readFileSync as fsReadFileSync} from "fs";

import { errorAndExit } from "../util/format";
import { isError, fileExists } from "../util/helpers";
import { IArgs } from "../types/args";

function getConfigFile(cwd: string): string | Error {   
    if(!fileExists(cwd, "prettier-update.json")) {
        return new Error("Could not find prettier-update.json file");
    }
    return pJoin(cwd, "prettier-update.json");
}

function parseConfigFile(file: string): string | Error {
    const configText = fsReadFileSync(file).toString();
    let configJson, errorMessage = "Invalid config json";

    try {
        configJson = JSON.parse(configText);
        const requisiteProperties = ["prettierConfig", "version"];
        const missingProps = requisiteProperties.reduce((allMissing, currentProp) => {
            if(!configJson.hasOwnProperty(currentProp)) allMissing += ` ${currentProp}`;
            return allMissing;
        }, "");
        if(missingProps !== "") {
            errorMessage += `\n Missing properties: ${missingProps}`
            throw new Error();
        }
    } catch (error) {
        return new Error(errorMessage);
    }
    return configJson;
}

export function managedParse(args: IArgs): string {
    const configFile = getConfigFile(args.path);
    isError(configFile) && errorAndExit((<Error>configFile).message, 1);
    const config = parseConfigFile(<string>configFile);
    isError(config) && errorAndExit((<Error>config).message, 1);
    return <string>config;
}
