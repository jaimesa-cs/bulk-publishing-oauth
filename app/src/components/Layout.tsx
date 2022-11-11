import "./layout.css";

import { Outlet } from "react-router-dom";
import { loadingAtom } from "./bulk-publishing-sidebar/store";
import { useAtom } from "jotai";

const Layout = () => {
  const [loading] = useAtom(loadingAtom);
  return (
    <div className="entry-sidebar">
      <div className="entry-sidebar-container">
        <div className="app-component-content">
          <h6>{loading ? "Loading..." : "Bulk Publishing"}</h6>
          <br />
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;
