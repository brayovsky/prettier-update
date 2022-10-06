import { AxiosRequestConfig, AxiosResponse, default as axios } from "axios";
import { render } from "mustache";

import * as prTemplates from "../util/templates/pr";
import { IPrettierUpdateStage } from "../types/prettierUpdateStage";
import { IPrettierUpdateConfig } from "../types/prettierUpdateConfig";
import { error as logError, info } from "./format";

export async function createRequest(
  url: string,
  method: string,
  accessToken: string,
  options: AxiosRequestConfig = {},
  retry: number = 5,
  verbose = false
): Promise<AxiosResponse<any, any> | Error> {
  const xhrOptions: AxiosRequestConfig = {
    method,
    url,
    transformResponse: [
      function (data) {
        let jsonData = data;
        try {
          jsonData = JSON.parse(data);
        } catch (error) {
          return data;
        }
        return jsonData;
      },
    ],
    headers: {
      Authorization:
        "Basic " + Buffer.from(":" + accessToken).toString("base64"),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...options,
  };

  let res;
  try {
    verbose && info(`Requesting ${url}`);
    const res = await axios(url, xhrOptions);
    return res;
  } catch (error) {
    retry--;
    verbose && info("Retrying request");
    if (retry === -1) {
      // TODO: Log subset / relevant info only
      logError(error);
      return new Error(error.message);
    }
    return createRequest(url, method, accessToken, options, retry);
  }
}

// TODO: Add reviewers from  ownership.json
export async function createADOPullRequest(
  sourceBranch: string,
  config: IPrettierUpdateConfig,
  view: IPrettierUpdateStage
): Promise<AxiosResponse<any, any> | Error> {
  /**
   * Add to env:
   * - access token $(System.AccessToken)
   * - collection uri $(System.CollectionUri)
   * - build repository id $(Build.Repository.ID)
   */

  const title = render(prTemplates.title, view);
  const description = render(prTemplates.body, view);
  const target = `refs/heads/${config.mainBranch}`;
  const source = `refs/heads/${sourceBranch}`;
  const response = await createRequest(
    `${process.env.SYSTEM_COLLECTIONURI}/_apis/git/repositories/${process.env.BUILD_REPOSITORYID}/pullrequests?api-version=7.0`,
    "POST",
    process.env.SYSTEM_ACCESSTOKEN,
    {
      data: {
        sourceRefName: source,
        targetRefName: target, // configure possibly
        status: "active",
        title,
        description,
      },
    }
  );
  return response;
}
