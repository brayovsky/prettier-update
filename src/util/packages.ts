import { getWorkspaces } from "workspace-tools";

export function getPackages(cwd: string): string[] {
    return getWorkspaces(cwd).map(workspace => workspace.path);
}
