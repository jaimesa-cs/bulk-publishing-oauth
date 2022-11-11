import { AUTH_KEY } from "./useAuth";
import { KeyValueObj } from "../../types";

export const isValidToken = (auth: KeyValueObj | undefined): boolean => {
  if (auth === undefined) {
    return false;
  }
  return (
    localStorage.getItem(AUTH_KEY) &&
    auth &&
    auth.access_token &&
    auth.refresh_token &&
    auth.expires_at &&
    Date.now() < new Date(auth.expires_at).getTime()
  );
};

export const getInitialTokenValue = (): KeyValueObj => {
  return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}");
};
