import {
  readFileSync as fsReadFileSync,
  writeFileSync as fsWriteFileSync,
  existsSync as fsExistsSync,
} from "fs";
import { join as pJoin } from "path";

import { IProgress } from "../types/tracker";
import { isError } from "../util/helpers";
import { IArgs } from "../types/args";
import { info } from "../util/format";

function getBanner(): string {
  return `THIS IS AN AUTOGENERATED FILE BY PRETTIER UPDATER. DO NOT EDIT THIS FILE DIRECTLY.\n`;
}

function createUpdaterLockFile(args: IArgs): boolean | Error {
  args.verbose && info("Creating prettier-updater.lock file");
  try {
    fsWriteFileSync(pJoin(args.path, "prettier-updater.lock"), getBanner());
    return true;
  } catch (error) {
    return new Error("Failed to create prettier lock file");
  }
}

export function writeProgress(
  progressToUpdate: Partial<IProgress>,
  args: IArgs
): boolean | Error {
  try {
    let progress: Partial<IProgress> = {};
    const updaterLockFile = pJoin(args.path, "prettier-updater.lock");
    if (!fsExistsSync(updaterLockFile)) {
      const didCreate = createUpdaterLockFile(args);
      if (isError(didCreate)) throw didCreate;
    } else {
      progress = <IProgress>readProgress(args.path);
    }
    if (isError(progress)) throw <Error>progress;
    const progressToWrite = {
      ...progress,
      ...progressToUpdate,
    };
    let progressData: string = getBanner();
    progressData += Buffer.from(JSON.stringify(progressToWrite)).toString(
      "base64"
    );
    console.log("---------------->", progressData);
    fsWriteFileSync(updaterLockFile, progressData);
    return true;
  } catch (error) {
    return new Error("Failed to write to prettier lock file");
  }
}

export function readProgress(cwd: string): IProgress | Error {
  try {
    const progress = fsReadFileSync(
      pJoin(cwd, "prettier-updater.lock"),
      "utf-8"
    );
    let progressData = progress.slice(getBanner().length);
    progressData = Buffer.from(progressData, "base64").toString("utf-8");
    const progressJSON = JSON.parse(progressData);
    return <IProgress>progressJSON;
  } catch (error) {
    return new Error("Could not read prettier-updater.lock file");
  }
}
