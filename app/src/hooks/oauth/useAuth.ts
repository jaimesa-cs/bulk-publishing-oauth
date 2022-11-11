import { getInitialTokenValue, isValidToken } from "./utils";

import { KeyValueObj } from "../../types";
import React from "react";
import useLocalStorage from "../useLocalStorage";

export const AUTH_KEY = "csat";

const useAuth = () => {
  const [auth, setAuth] = useLocalStorage<KeyValueObj>(AUTH_KEY, getInitialTokenValue());

  const [isValid, setIsValid] = React.useState(isValidToken(auth));

  React.useEffect(() => {
    setIsValid(isValidToken(auth));
  }, [auth]);

  return {
    auth,
    setAuth,
    isValid,
    canRefresh: !isValid && auth?.refresh_token,
  };
};

export default useAuth;
