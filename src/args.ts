import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import start from "./start";

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
  .option("verbose", {
    alias: "-v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();
