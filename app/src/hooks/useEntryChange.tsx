import { SAVED_MESSAGE, SAVE_MESSAGE } from "../components/bulk-publishing-sidebar/references-table";
import {
  canRefreshAtom,
  showWarningMessageAtom,
  warningMessageAtom,
} from "../components/bulk-publishing-sidebar/store";

import { useAtom } from "jotai";
import { useEntry } from "./useEntry";

/**
 * useSdkDataByPath
 * This is a generic hook which can return the value at the given path;
 * @param path
 * @param defaultValue
 *
 * eg:
 * const contentTypeUuid = useSdkDataByPath('location.SidebarWidget.entry.content_type.uid', '')
 * const stackKey =  useSdkDataByPath('stack._data.api_key', '');
 */
export const useEntryChange = (): any => {
  const [, setShowWarning] = useAtom(showWarningMessageAtom);
  const [, setWarningMessage] = useAtom(warningMessageAtom);
  const [, setCanRefresh] = useAtom(canRefreshAtom);

  const { entryData: entry, contentTypeUid } = useEntry({
    onChange: () => {
      setShowWarning(true);
      setWarningMessage(SAVE_MESSAGE);
      setCanRefresh(false);
    },
    onSave: () => {
      setShowWarning(true);
      setWarningMessage(SAVED_MESSAGE);
      setCanRefresh(true);
    },
  });
  return { entry, contentTypeUid };
};
