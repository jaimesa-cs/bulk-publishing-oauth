import { AxiosPromise, AxiosRequestConfig } from "axios";

import useContenstackAxios from "../../hooks/oauth/useContetstackAxios";

export interface IPublishInstruction {
  [key: string]: any;
}

interface SdkResult {
  axios: (query: string, options?: AxiosRequestConfig) => AxiosPromise;
  getLocales: (options?: AxiosRequestConfig) => AxiosPromise;
  getEnvironments: (options?: AxiosRequestConfig) => AxiosPromise;
  publish: (instruction: IPublishInstruction, options?: AxiosRequestConfig) => AxiosPromise;
}

/**
 * Custom hook that exposes useful methods to interact with the OAuth Contentstack API
 * @param endpoint, the OAuth Contentstack API endpoint
 * @returns
 */
export const useOauthCsApi = (): SdkResult => {
  const axios = useContenstackAxios();
  return {
    axios: (query: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`${query}`, options);
    },

    getLocales: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(`/v3/locales`, options);
    },
    getEnvironments: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      const url = `/v3/environments`;
      return axios(url, options);
    },
    publish: (instructions: IPublishInstruction, options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios("");
    },
  };
};
