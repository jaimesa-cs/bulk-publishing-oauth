import AuthorizeButton from "../../components/AuthorizeButton";
import { Outlet } from "react-router-dom";
import React from "react";
import useAuth from "../../hooks/oauth/useAuth";
import useRefresh from "../../hooks/oauth/useRefreshToken";

const RequireOAuthToken = () => {
  const { asyncRefresh } = useRefresh();
  const { isValid } = useAuth();

  React.useEffect(() => {
    //Try to rfresh token if possible
    asyncRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isValid ? <Outlet /> : <AuthorizeButton />;
};

export default RequireOAuthToken;
