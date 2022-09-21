import * as childprocess from "child_process";
import { IArgs } from "../types/args";
import { info } from "./format";

export default function git(argvs: IArgs, ...args: string[]): string | Error {
  info(`Calling: git ${args.join(" ")}`);
  const gitProcess = childprocess.spawnSync("git", args, { cwd: argvs.path });

  if (gitProcess.status !== 0) {
    return new Error(gitProcess.stderr.toString());
  }
  return gitProcess.stdout.toString();
}

export function branch(branchName: string, args: IArgs) {
  return git(args, `branch -b ${branchName}`);
}

export function push(branchName: string, args: IArgs) {
  const remote = git(args, "remote");
  return git(args, `push -f --set-upstream ${remote} ${branchName}`);
}

export function clean(args: IArgs) {
  return git(args, "clean -fdx");
}
