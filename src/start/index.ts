import { resolve as pResolve, join as pJoin, parse } from "path";

import { managedCopySettings as copySettings } from "./copySettings";
import { getPackages } from "../util/packages";
import { readProgress, writeProgress } from "../tracker";

export default function start(args): void {
  args.path =
    args.path === process.cwd()
      ? args.path
      : pResolve(process.cwd(), args.path);
  // const packages = getPackages(args.path);
  // copySettings(args, packages);
  writeProgress({ currentStage: 1, allStages: 4 }, args);
  console.log(readProgress(args.path));
}
