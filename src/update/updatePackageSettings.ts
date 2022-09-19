import { join as pJoin } from 'path';
import { writeFileSync as fsWriteFileSync } from 'fs';

import { IArgs } from '../types/args';
import { IPrettierUpdateConfig } from '../types/prettierUpdateConfig';
import { isError } from '../util/helpers';
import { errorAndExit } from '../util/format';

function copySettingsToPackage(settings: IPrettierUpdateConfig, packages: string[]): boolean | Error {
    try {
        const config = settings.prettierConfig;
        packages.forEach(packageRoot => {
            const prettierrcFile = pJoin(packageRoot, ".prettierrc");
            fsWriteFileSync(prettierrcFile, JSON.stringify(config));
        })
        return true;
    } catch (error) {
        return error;
    }
}

export function managedUpdatePackageSettings(args: IArgs, config: IPrettierUpdateConfig, packages: string[]) {
   const didCopy = copySettingsToPackage(config, packages);
   isError(didCopy) && errorAndExit((<Error>didCopy).message)
}