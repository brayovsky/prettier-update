import { getWorkspaces } from "workspace-tools";

export function getPackages(cwd: string) {
    return getWorkspaces(cwd).map(workspace => workspace.path);
}
