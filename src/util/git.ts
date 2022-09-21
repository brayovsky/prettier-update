import * as childprocess from "child_process";
import { IArgs } from "../types/args";
import { info, positive, error } from "./format";

export default function git(argvs: IArgs, ...args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    argvs.verbose && info(`Calling: git ${args.join(" ")}`);
    const gitProcess = childprocess.spawn("git", args, { cwd: process.cwd() });
    let processData = "";
    gitProcess.stdout.on("data", (data) => {
      processData += data.toString();
    });

    gitProcess.stderr.on("data", (data) => {
      processData += data.toString();
    });

    gitProcess.on("exit", (code) => {
      if (code !== 0) {
        error(`git ${args.join(" ")}:\n${processData ? processData : "error"}`);
        reject(processData);
      } else {
        argvs.verbose &&
          positive(
            `git ${args.join(" ")}:\n${processData ? processData : "done"}`
          );
        resolve(processData);
      }
    });
  });
}
