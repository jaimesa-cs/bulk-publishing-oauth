import { getInitialTokenValue, isValidToken } from "./utils";
import { logAtom, showLogAtom } from "../../components/bulk-publishing-sidebar/store";
import { showErrorWithDetails, showSuccessWithDetails } from "../../utils/notifications";

import { KeyValueObj } from "../../types";
import React from "react";
import { useAtom } from "jotai";

export const AUTH_KEY = "csat";

const useMessageWithDetails = () => {
  const [, setShowLog] = useAtom(showLogAtom);
  const [, setLog] = useAtom(logAtom);

  return {
    showSuccess: (msg: string, description?: string) => {
      setLog((log) => {
        showSuccessWithDetails(
          msg,
          () => {
            setShowLog(true);
          },
          description
        );
        return [
          ...log,
          {
            type: "info",
            message: msg,
          },
        ];
      });
    },
    showError: (msg: string) => {
      setLog((log) => {
        showErrorWithDetails(msg, () => {
          setShowLog(true);
        });
        return [
          ...log,
          {
            type: "info",
            message: msg,
          },
        ];
      });
    },
  };
};

export default useMessageWithDetails;
