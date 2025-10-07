import axios, { AxiosResponse, AxiosError } from 'axios';
import { PaginatedResult } from '../models/common';
import { exploreApiClient } from "./exploreApiClient";
import { listApiClient } from "./listsApiClient";
import { mutatePostApiClient } from "./mutatePostApiClient";
import { postApiClient } from "./postApiClient";
import { notificationApiClient } from "./notificationApiClient";
import { userApiClient } from "./userApiClient";
import { communityApiClient } from "./communityApiClient";
import { messageApiClient } from "./messageApiClient";
import { commentApiClient } from "./commentApiClient";

export const extractQryParams = (request: any, paramsToExtract: string[]): (string | null)[] => {
  const qryParams = new URL(request.url!).searchParams;

  let results = (paramsToExtract ?? []).map((p: string) => {

    let valToReturn: string | null = '';
    if (p === 'currentPage')
      valToReturn = qryParams.get(p) ?? '1'
    else if (p === 'itemsPerPage')
      valToReturn = qryParams.get(p) ?? '25'
    else
      valToReturn = qryParams.get(p);

    return valToReturn;
  });

  return results;
}

export const axiosResponseBody = (res: AxiosResponse) => res.data;

export const axiosRequests = {
  get: <T>(url: string) => axios.get<T>(url).then(axiosResponseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(axiosResponseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(axiosResponseBody),
  patch: <T>(url: string, body: {}) => axios.patch<T>(url, body).then(axiosResponseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(axiosResponseBody),
};

axios.interceptors.response.use(
  async (response) => {
    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = new PaginatedResult(
        response.data,
        JSON.parse(pagination)
      );
      return response as AxiosResponse<PaginatedResult<any>>;
    }
    return response;
  },
  (error: AxiosError) => {
    const myResponse = error.response as AxiosResponse;
    const modalStateErrors = [];
    if (!myResponse?.status) {
      return Promise.reject("Error");
    }

    switch (myResponse.status) {
      case 400:
        if (
          myResponse.config.method === "get" &&
          myResponse.data.errors.hasOwnProperty("id")
        ) {
          console.log("Not found")
        }
        if (myResponse.data.errors) {
          for (const key in myResponse.data.errors) {
            if (myResponse.data.errors[key]) {
              modalStateErrors.push(
                'Errors'
              );
            }
          }
          throw modalStateErrors.flat();
        } else {

        }
      case 401:

        if (myResponse.data === "invalid_token") {

        } else {

        }
        break;
      case 403:

        break;
      case 404:

        break;
      case 413:

      case 418:  //I am a teapot!

        break;
      case 500:

        break;
      default:

        break;
    }

    return Promise.reject(error);
  }
);


const agent = {
  commentApiClient,
  communityApiClient,
  exploreApiClient,
  listApiClient,
  postApiClient,
  messageApiClient,
  mutatePostApiClient,
  notificationApiClient,
  userApiClient
};

export function leadingDebounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // alert(timeoutId)
  if (!timeoutId) {
    func();
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    timeoutId = null;
  }, delay);
}

export default agent;