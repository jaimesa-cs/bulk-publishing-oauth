import "./layout.css";

import {
  canRefreshAtom,
  currentEntryAtom,
  errorAtom,
  loadingReferencesAtom,
  showWarningMessageAtom,
  uiReadyAtom,
} from "./bulk-publishing-sidebar/store";

import Options from "./bulk-publishing-sidebar/options";
import { Outlet } from "react-router-dom";
import ShowWarning from "./bulk-publishing-sidebar/show-warning";
import { useAtom } from "jotai";
import useAuth from "../hooks/oauth/useAuth";

function Error({ error }: { error: string }) {
  return <>Error...: {JSON.stringify(error)}</>;
}

const Layout = () => {
  const { isValid } = useAuth();
  const [error] = useAtom(errorAtom);
  const [, setCanRefresh] = useAtom(canRefreshAtom);
  const [loadingReferences] = useAtom(loadingReferencesAtom);
  const [showWarning] = useAtom(showWarningMessageAtom);
  const [currentEntry] = useAtom(currentEntryAtom);
  const [uiReady] = useAtom(uiReadyAtom);
  const reload = () => {
    setCanRefresh(() => {
      window.location.reload();
      return false;
    });
  };
  return (
    <div className="entry-sidebar">
      <div className="entry-sidebar-container">
        <div className="app-component-content">
          {loadingReferences && currentEntry ? (
            <>
              <h5>Loading nested references</h5>
              <hr className="separator-bar" />
              <h6>{`Processing ${currentEntry}...`}</h6>
            </>
          ) : null}
          <br />
          <div style={{ display: uiReady ? undefined : "none" }}>
            {error && <Error error={error} />}
            {isValid && showWarning && <ShowWarning reload={reload} />}
            {isValid && !showWarning && !error && <Options />}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;
