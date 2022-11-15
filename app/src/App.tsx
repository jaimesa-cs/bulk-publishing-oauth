import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { Provider as BulkPublishingProvider } from "jotai";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { MarketplaceAppWrapper } from "./MarketplaceAppProvider";
import { OAuthCallback } from "./hooks/oauth/useOAuth2Token";
import RequireOAuthToken from "./routes/oauth/RequireOAuthToken";

/**
 * All the routes are Lazy loaded.
 * This will ensure the bundle contains only the core code and respective route bundle
 */
const CustomFieldExtension = React.lazy(() => import("./routes/CustomField"));
// const EntrySidebarExtension = React.lazy(() => import("./routes/EntrySidebar"));
const AppConfigurationExtension = React.lazy(() => import("./routes/AppConfiguration"));
const AssetSidebarExtension = React.lazy(() => import("./routes/AssetSidebar"));
const StackDashboardExtension = React.lazy(() => import("./routes/StackDashboard"));
const BulkPublishingSidebarExtension = React.lazy(() => import("./routes/BulkPublishingSidebar"));

function App() {
  return (
    <ErrorBoundary>
      <BulkPublishingProvider>
        <MarketplaceAppWrapper ignoreRoutes={["/callback", "/ping"]}>
          <Routes>
            <Route path="/" element={<div>Nothing to show here</div>} />
            <Route path="/callback" element={<OAuthCallback />} />
            <Route path="/ping" element={<p>Pong!</p>} />
            <Route
              path="/custom-field"
              element={
                <Suspense>
                  <CustomFieldExtension />
                </Suspense>
              }
            />
            <Route element={<Layout />}>
              <Route element={<RequireOAuthToken />}>
                <Route
                  path="/bulk-publish"
                  element={
                    <Suspense>
                      <BulkPublishingSidebarExtension />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
            <Route
              path="/app-configuration"
              element={
                <Suspense>
                  <AppConfigurationExtension />
                </Suspense>
              }
            />
            <Route
              path="/asset-sidebar"
              element={
                <Suspense>
                  <AssetSidebarExtension />
                </Suspense>
              }
            />
            <Route
              path="/stack-dashboard"
              element={
                <Suspense>
                  <StackDashboardExtension />
                </Suspense>
              }
            />
          </Routes>
        </MarketplaceAppWrapper>
      </BulkPublishingProvider>
    </ErrorBoundary>
  );
}

export default App;
