import { resolve as pResolve } from "path";

import { managedCopySettings as copySettings } from "./copySettings";
import { managedParse as parseConfig } from "./parseConfig";
import { getPackages } from "../util/packages";

export default function start(args): void {
  args.path =
    args.path === process.cwd()
      ? args.path
      : pResolve(process.cwd(), args.path);
  const packages = getPackages(args.path);
  const config = parseConfig(args);
  copySettings(args, packages, config);
}
