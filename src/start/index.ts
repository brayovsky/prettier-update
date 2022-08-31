import { managedParse as parseConfig} from "./parseConfig";
import { getPackages } from "../util/packages";
// import copysettings

export default function start (args): void {
    // const config = parseConfig(args);
    console.log(getPackages(args.path))
    // copysettings
}
