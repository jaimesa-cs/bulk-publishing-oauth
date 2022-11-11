import { canRefreshAtom, errorAtom, showWarningMessageAtom } from "../components/bulk-publishing-sidebar/store";

import Options from "../components/bulk-publishing-sidebar/options";
import ReferencesTable from "../components/bulk-publishing-sidebar/references-table";
import ShowWarning from "../components/bulk-publishing-sidebar/show-warning"; // import axios from "../utils/axios";
import { useAtom } from "jotai";

function Error({ error }: { error: string }) {
  return <>Error...: {JSON.stringify(error)}</>;
}

const BulkPublishingSidebarExtension = () => {
  const [error] = useAtom(errorAtom);
  const [showWarning] = useAtom(showWarningMessageAtom);
  const [, setCanRefresh] = useAtom(canRefreshAtom);

  const reload = () => {
    setCanRefresh(() => {
      window.location.reload();
      return false;
    });
  };

  return (
    <>
      {error && <Error error={error} />}
      {showWarning && <ShowWarning reload={reload} />}
      {!showWarning && !error && <Options />}
      {!showWarning && !error && <ReferencesTable />}
    </>
  );
};

export default BulkPublishingSidebarExtension;
