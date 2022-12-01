import useSecureLocalStorage, { getExistingSecureStorageValue } from "../secure-local-storage/useSecureLocalStorage";

import { KeyValueObj } from "../../types";
import React from "react";

export const AUTH_KEY = "csat";

const useAuth = () => {
  const initialValue = getExistingSecureStorageValue<KeyValueObj>(AUTH_KEY);
  const [auth, setAuth] = useSecureLocalStorage<KeyValueObj>(AUTH_KEY, initialValue);

  return {
    auth: (auth as KeyValueObj) || null,
    setAuth,
    isValid:
      auth &&
      auth.access_token &&
      auth.refresh_token &&
      auth.expires_at &&
      Date.now() < new Date(auth.expires_at).getTime(),
    canRefresh:
      !(
        auth &&
        auth.access_token &&
        auth.refresh_token &&
        auth.expires_at &&
        Date.now() < new Date(auth.expires_at).getTime()
      ) &&
      auth &&
      auth.refresh_token,
  };
};

export default useAuth;
