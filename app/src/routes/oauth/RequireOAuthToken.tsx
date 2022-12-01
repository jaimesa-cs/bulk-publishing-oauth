import AuthorizeButton from "../../components/AuthorizeButton";
import { Outlet } from "react-router-dom";
import React from "react";
import useAuth from "../../hooks/oauth/useAuth";
import useRefresh from "../../hooks/oauth/useRefreshToken";

const RequireOAuthToken = () => {
  const { asyncRefresh } = useRefresh();
  const { isValid, canRefresh } = useAuth();

  React.useEffect(() => {
    //Try to refresh token if possible
    // console.log("RequireOAuthToken useEffect");
    if (canRefresh) {
      console.log("Token is not valid, trying to refresh");
      asyncRefresh();
    }
  }, [asyncRefresh, canRefresh]);

  return isValid ? <Outlet /> : <AuthorizeButton />;
};

export default RequireOAuthToken;
