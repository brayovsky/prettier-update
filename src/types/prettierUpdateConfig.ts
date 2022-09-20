export interface IPrettierUpdateConfig {
  // new prettier configuration
  prettierConfig: { [key: string]: any };
  // new prettier version
  version?: string;
  // branch to create pull requests against
  mainBranch: string;
}
