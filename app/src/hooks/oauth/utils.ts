import { AUTH_KEY } from "./useAuth";
import { KeyValueObj } from "../../types";

export const isValidToken = (authObject: KeyValueObj | undefined): boolean => {
  if (authObject === undefined || authObject === null || Object.keys(authObject).length === 0) {
    return false;
  }
  const auth = authObject as KeyValueObj;
  return (
    auth &&
    auth.access_token &&
    auth.refresh_token &&
    auth.expires_at &&
    Date.now() < new Date(auth.expires_at).getTime()
  );
};
