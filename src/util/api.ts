import { AxiosRequestConfig, AxiosResponse, default as axios } from "axios";

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
      return new Error(`Could not ${method} ${url}`);
    }
    return createRequest(url, method, accessToken, options, retry);
  }
}

export function createADOPullRequest(
  title: string,
  description: string,
  source: string,
  target: string
) {
  /**
   * Add to env:
   * - access token $(System.AccessToken)
   * - collection uri $(System.CollectionUri)
   * - build repository id $(Build.Repository.ID)
   */

  // TODO: Add reviewers from  ownership.json
  return createRequest(
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
}
