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
    // console.log("useEffect useEntry");
    if (!isEmpty(entryData) || isNull(location) || isNull(location)) return;

    setLoading(true);
    const data = location.entry.getData();
    const entry: { [key: string]: any } = {
      ...data,
      content_type: { title: location.entry.content_type.title, uid: location.entry.content_type.uid },
    };

    location.entry.onChange(onChange);
    location.entry.onSave(onSave);
    setContentTypeUid(location.entry.content_type.uid);
    setEntry(entry);

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryData, location]);

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
