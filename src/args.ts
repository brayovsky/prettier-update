import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import start from "./start";
import continueWrite from "./update";

yargs(hideBin(process.argv))
  .command(
    "start [path]",
    "Prepare monorepo for gradual update",
    (yargs) => {
      return yargs.positional("path", {
        describe: "Root folder for monorepo",
        default: process.cwd(),
        alias: "-p",
      });
    },
    start
  )
  .command(
    "continue [path]",
    "Proceed with the next stage of update",
    (yargs) => {
      return yargs.positional("path", {
        describe: "Root folder for monorepo",
        default: process.cwd(),
        alias: "-p",
      });
    },
    continueWrite
  )
  .option("verbose", {
    alias: "-v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();
