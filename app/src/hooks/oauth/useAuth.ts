import useSecureLocalStorage, { getExistingSecureStorageValue } from "../useSecureLocalStorage";

import { KeyValueObj } from "../../types";
import React from "react";
import { isValidToken } from "./utils";

export const AUTH_KEY = "csat";

const useAuth = () => {
  const initialValue = getExistingSecureStorageValue<KeyValueObj>(AUTH_KEY);
  const [auth, setAuth] = useSecureLocalStorage<KeyValueObj>(AUTH_KEY, initialValue);

  const [isValid, setIsValid] = React.useState(false);

  const canRefresh = React.useCallback(() => {
    return auth && auth.refresh_token && !isValid;
  }, [auth, isValid]);

  React.useEffect(() => {
    setIsValid(isValidToken(auth));
  }, [auth]);

  return {
    auth: (auth as KeyValueObj) || null,
    setAuth,
    isValid: isValid,
    canRefresh: canRefresh(),
  };
};

export default useAuth;
