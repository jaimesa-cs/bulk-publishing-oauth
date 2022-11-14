import { contentstackAxios as axios } from "../../api/axios";
import { useAppConfig } from "../useAppConfig";
import useAuth from "./useAuth";
import { useEffect } from "react";
import useRefresh from "./useRefreshToken";

const useContentstackAxios = () => {
  const [
    {
      bulkPublishingConfig: { apiKey },
    },
  ] = useAppConfig();

  const { auth, setAuth } = useAuth();
  const { syncRefresh } = useRefresh();

  useEffect(() => {
    const requestIntercept = axios.interceptors.request.use(
      (config) => {
        if (config && config.headers) {
          if (!config.headers["authorization"]) {
            // console.log("Request Interceptor, adding auth", `Bearer ${auth?.access_token}`);
            config.headers["authorization"] = `Bearer ${auth?.access_token}`;
          }
          if (!config.headers["api_key"]) {
            // console.log("Request Interceptor, adding api_key", apiKey);
            config.headers["api_key"] = apiKey;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axios.interceptors.response.use(
      (response) => {
        // console.log("Response Interceptor", response);
        return response;
      },
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const data = await syncRefresh();
          setAuth(data);
          prevRequest.headers["authorization"] = `Bearer ${data.access_token}`;
          return axios(prevRequest);
        }
        console.log("Interceptor Error", error.response);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseIntercept);
      axios.interceptors.request.eject(requestIntercept);
    };
  }, [apiKey, auth, setAuth, syncRefresh]);

  return axios;
};

export default useContentstackAxios;
