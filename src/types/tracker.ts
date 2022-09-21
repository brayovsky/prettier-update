export interface IProgress {
  currentStage: number;
  branches: IProgressBranch[];
}

interface IProgressBranch {
  name: string;
  pullRequestID: number;
  pullRequestStatus: string;
}
