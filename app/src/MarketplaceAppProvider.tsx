import React, { useEffect, useState } from "react";

import { AppFailed } from "./components/AppFailed";
import { Button } from "@contentstack/venus-components";
import ContentstackAppSDK from "@contentstack/app-sdk";
import Extension from "@contentstack/app-sdk/dist/src/extension";
import { KeyValueObj } from "./types";
import LoadingButton from "./components/bulk-publishing-sidebar/loading-button";
import { isNull } from "lodash";
import { useAppConfig } from "./hooks/useAppConfig";
import { useAppSdk } from "./hooks/useAppSdk";
import { useLocation } from "react-router-dom";

type ProviderProps = {
  children?: React.ReactNode;
  ignoreRoutes?: string[];
};

/**
 * Marketplace App Provider
 * @param children: React.ReactNode
 */
export const MarketplaceAppWrapper: React.FC<ProviderProps> = ({ children, ignoreRoutes }) => {
  const [failed, setFailed] = useState<boolean>(false);
  const [appSdk, setAppSdk] = useAppSdk();
  const [appConfig, setConfig] = useAppConfig();
  const location = useLocation();

  // Initialize the SDK and track analytics event
  useEffect(() => {
    if (ignoreRoutes === undefined || ignoreRoutes.indexOf(location.pathname) === -1) {
      ContentstackAppSDK.init()
        .then((appSdk: Extension) => {
          appSdk
            .getConfig()
            .then((appConfig: KeyValueObj) => {
              setAppSdk(appSdk);
              // console.log("🚀 ~ file: MarketplaceAppProvider.tsx ~ line 56 ~ .then ~ appSdk", appSdk);
              setConfig(appConfig);
              // console.log("🚀 ~ file: MarketplaceAppProvider.tsx ~ line 57 ~ .then ~ appConfig", appConfig);
            })
            .catch(() => {
              setFailed(true);
            });
        })
        .catch(() => {
          setFailed(true);
        });
    }
  }, [setFailed, setAppSdk, setConfig, ignoreRoutes, location.pathname]);

  // wait until the SDK is initialized. This will ensure the values are set
  // correctly for appSdk atom.
  if (ignoreRoutes && ignoreRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }
  if (!failed && (isNull(appSdk) || isNull(appConfig))) {
    return (
      <div className="entry-sidebar">
        <div className="entry-sidebar-container">
          <div className="app-component-content">
            <LoadingButton />
          </div>
        </div>
      </div>
    );
  }

  if (failed) {
    return <AppFailed />;
  }

  return <>{children}</>;
};
