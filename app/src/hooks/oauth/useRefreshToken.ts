import { REFRESH_TOKEN_URL } from "./constants";
import React from "react";
import axios from "../../api/axios";
import useAuth from "./useAuth";

export default function useRefresh() {
  const { auth, setAuth, isValid, canRefresh } = useAuth();

  const asyncRefresh = React.useCallback(() => {
    if (canRefresh) {
      axios
        .post(REFRESH_TOKEN_URL, {
          refreshToken: auth?.refresh_token,
        })
        .then((response) => {
          setAuth(response.data);
        })
        .catch((err) => {
          setAuth(undefined);
        })
        .finally(() => {});
    }
  }, [auth?.refresh_token, canRefresh, setAuth]);

  const syncRefresh = React.useCallback(async () => {
    if (canRefresh) {
      try {
        const response = await axios.post(REFRESH_TOKEN_URL, {
          refreshToken: auth?.refresh_token,
        });
        return response.data;
      } catch (err) {
        return undefined;
      }
    } else {
      return undefined;
    }
  }, [auth?.refresh_token, canRefresh]);

  return { asyncRefresh, syncRefresh, needsRefreshing: auth && auth.refresh_token && !isValid };
}
