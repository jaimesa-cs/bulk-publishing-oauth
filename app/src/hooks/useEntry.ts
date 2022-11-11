import { contentTypeUidAtom, entryAtom } from "../components/bulk-publishing-sidebar/store";
import { isEmpty, isNull } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { useAppLocation } from "./useAppLocation";
import { useAtom } from "jotai";

type OnChange = (a: any, b: any) => void;
type OnSave = OnChange;

/**
 * Getter and setter hook for entry data
 * @return Array of [entryData, setEntryDataFn, loadingState]
 *
 * Eg:
 * const [data, setData, loading] = useEntry();
 */
export const useEntry = ({ onChange, onSave }: { onChange?: OnChange; onSave?: OnSave }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { location, locationName } = useAppLocation();
  const [entryData, setEntry] = useAtom(entryAtom);
  const [contentTypeUid, setContentTypeUid] = useAtom(contentTypeUidAtom);

  if (locationName !== "SidebarWidget") {
    throw new Error(`useEntry hook cannot be used inside ${locationName}`);
  }

  useEffect(() => {
    (async () => {
      if (!isEmpty(entryData) || isNull(location)) return;
      setLoading(true);
      const entry: { [key: string]: any } = {
        ...(await location.entry.getData()),
        content_type: { title: location.entry.content_type.title, uid: location.entry.content_type.uid },
      };

      location.entry.onChange(onChange);
      location.entry.onSave(onSave);

      // entry.onChange((e: any, b: any) => {
      //   setShowWarning(true);
      //   setWarningMessage(SAVE_MESSAGE);
      //   setCanRefresh(false);
      // });
      // location?.SidebarWidget?.entry.onSave((e: any, b: any) => {
      //   setShowWarning(true);
      //   setWarningMessage(SAVED_MESSAGE);
      //   setCanRefresh(true);
      // });

      setContentTypeUid(location.entry.content_type.uid);
      setEntry(entry);
      setLoading(false);
    })();
  }, [entryData, location, setLoading, setEntry, setContentTypeUid]);

  const setEntryData = useCallback(
    async (entry: any) => {
      setLoading(true);
      await location.entry.setData(entry);
      setEntry(entry);
      setLoading(false);
    },
    [location, setEntry, setLoading]
  );

  return { entryData, setEntryData, loading, contentTypeUid };
};
