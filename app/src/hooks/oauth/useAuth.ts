import useSecureLocalStorage, { getExistingSecureStorageValue } from "../secure-local-storage/useSecureLocalStorage";

import { KeyValueObj } from "../../types";
import React from "react";

export const AUTH_KEY = "csat";

const useAuth = () => {
  const initialValue = getExistingSecureStorageValue<KeyValueObj>(AUTH_KEY);
  const [auth, setAuth] = useSecureLocalStorage<KeyValueObj>(AUTH_KEY, initialValue);

  const isValidToken = React.useCallback(() => {
    // console.log("useAuthEffect", auth);
    return (
      auth &&
      auth.access_token &&
      auth.refresh_token &&
      auth.expires_at &&
      Date.now() < new Date(auth.expires_at).getTime()
    );
  }, [auth]);

  const canRefresh = React.useCallback(() => {
    const can = auth && auth.refresh_token && !isValidToken();
    return can || false;
  }, [auth, isValidToken]);

  return {
    auth: (auth as KeyValueObj) || null,
    setAuth,
    isValid: isValidToken(),
    canRefresh: canRefresh(),
  };
};

export default useAuth;
