import { existsSync as fsExistsSync } from "fs";
import { join as pJoin } from "path";

export function isError(err: any): boolean {
    return err instanceof Error;
}

export function fileExists(path: string, file: string): boolean {
    return fsExistsSync(pJoin(path, file));
}
