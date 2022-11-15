import "./layout.css";

import LoadingButton from "./bulk-publishing-sidebar/loading-button";
import { Outlet } from "react-router-dom";
import { loadingAtom } from "./bulk-publishing-sidebar/store";
import { useAtom } from "jotai";

const Layout = () => {
  const [loading] = useAtom(loadingAtom);
  return (
    <div className="entry-sidebar">
      <div className="entry-sidebar-container">
        <div className="app-component-content">
          {loading ? <LoadingButton /> : <h6>References</h6>}
          <br />
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;
