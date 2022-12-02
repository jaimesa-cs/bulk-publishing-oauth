import { errorAtom, showWarningMessageAtom } from "../components/bulk-publishing-sidebar/store";

import React from "react";
import ReferencesTable from "../components/bulk-publishing-sidebar/references-table";
import { useAtom } from "jotai";

const BulkPublishingSidebarExtension = () => {
  const [error] = useAtom(errorAtom);
  const [showWarning] = useAtom(showWarningMessageAtom);
  return <>{!showWarning && !error && <ReferencesTable />}</>;
};

export default BulkPublishingSidebarExtension;
