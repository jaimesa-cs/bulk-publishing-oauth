import { canRefreshAtom, warningMessageAtom } from "./store";

import { Button } from "@contentstack/venus-components";
import { useAtom } from "jotai";

function ShowWarning({ reload }: { reload: () => void }) {
  const [warningMessage] = useAtom(warningMessageAtom);
  const [canRefresh] = useAtom(canRefreshAtom);
  return (
    <>
      <p>
        <strong>Note: </strong>
        {warningMessage}
      </p>

      <br />
      <Button
        isFullWidth={true}
        disabled={!canRefresh}
        icon={"Refresh"}
        buttonType="secondary"
        onClick={() => {
          reload();
        }}
      >
        Reload
      </Button>
    </>
  );
}

export default ShowWarning;
