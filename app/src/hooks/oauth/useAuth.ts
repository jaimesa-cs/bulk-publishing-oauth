import useSecureLocalStorage, { getExistingSecureStorageValue } from "../useSecureLocalStorage";

import { KeyValueObj } from "../../types";
import React from "react";
import { isValidToken } from "./utils";

export const AUTH_KEY = "csat";

const useAuth = () => {
  const initialValue = getExistingSecureStorageValue<KeyValueObj>(AUTH_KEY);
  const [auth, setAuth] = useSecureLocalStorage<KeyValueObj>(AUTH_KEY, initialValue);

  const [isValid, setIsValid] = React.useState(false);

  React.useEffect(() => {
    setIsValid(isValidToken(auth));
  }, [auth]);

  return {
    auth: (auth as KeyValueObj) || null,
    setAuth,
    isValid: isValid,
    canRefresh: isValid && auth?.refresh_token,
  };
};

export default useAuth;
