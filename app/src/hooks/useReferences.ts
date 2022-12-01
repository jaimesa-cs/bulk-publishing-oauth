import {
  IEnvironmentConfig,
  ILocaleConfig,
  IReference,
  OPERATIONS,
} from "../components/bulk-publishing-sidebar/models/models";
/**
 * useAppSdk
 * @return the appSdk instance after initialization
 */
import { atom, useAtom } from "jotai";
import {
  clearDataStatusAtom,
  dataStatusAtom,
  deployReleasesAtom,
  environmentsAtom,
  loadingReferencesAtom,
  localesAtom,
  operationInProgressAtom,
  reloadOnChangeLocalesAtom,
  resetProgressAtom,
  setDataStatusAtom,
  updateReferencesAtom,
} from "../components/bulk-publishing-sidebar/store";

import Extension from "@contentstack/app-sdk/dist/src/extension";
import React from "react";
import { showError } from "../utils/notifications";
import { useEntryChange } from "./useEntryChange";
import { useOauthCsApi } from "../components/bulk-publishing-sidebar/cs-oauth-api";

export const appSdkRefAtom = atom<Extension | null>(null);

/**
 * Getter and setter for appSdk instance.
 * To be used during Sdk initialisation
 */
export const useReferences = (): any => {
  const [dataStatus] = useAtom(dataStatusAtom);
  const [environments] = useAtom(environmentsAtom);
  const [locales] = useAtom(localesAtom);
  const [reloadOnChangeLocales] = useAtom(reloadOnChangeLocalesAtom);

  const [, clearDataStatus] = useAtom(clearDataStatusAtom);
  const [, updateReferences] = useAtom(updateReferencesAtom);

  const [, setLoadingReferences] = useAtom(loadingReferencesAtom);
  const [, setDataStatusPartial] = useAtom(setDataStatusAtom);
  const [operationInProgress, setOperationInProgress] = useAtom(operationInProgressAtom);

  const [deployReleases] = useAtom(deployReleasesAtom);

  const { entry, contentTypeUid } = useEntryChange();

  const { publish, publishAsRelease, getEntryReferences } = useOauthCsApi();

  const publishEntries = React.useCallback(() => {
    const selectedKeys = Object.keys(dataStatus.selectedReferences);

    const references: IReference[] = Object.values(dataStatus.allEntries).filter(
      (r) => selectedKeys.indexOf(r.uniqueKey) > -1
    );

    publish(
      references,
      locales.filter((l) => l.checked),
      environments.filter((e) => e.checked)
    );
  }, [dataStatus.allEntries, dataStatus.selectedReferences, publish, locales, environments]);

  const publishEntriesAsRelease = React.useCallback(() => {
    const selectedKeys = Object.keys(dataStatus.selectedReferences);
    const references: IReference[] = Object.values(dataStatus.allEntries).filter(
      (r) => selectedKeys.indexOf(r.uniqueKey) > -1
    );

    if (entry) {
      publishAsRelease(
        entry,
        references,
        locales.filter((l) => l.checked),
        environments.filter((e) => e.checked),
        deployReleases
      );
    } else {
      showError("Unable to deploy as release. Please save the entry first.");
      setOperationInProgress(OPERATIONS.NONE);
    }
  }, [
    dataStatus.selectedReferences,
    dataStatus.allEntries,
    entry,
    publishAsRelease,
    locales,
    environments,
    deployReleases,
    setOperationInProgress,
  ]);

  React.useEffect(() => {
    async function getReferences() {
      if (reloadOnChangeLocales && entry !== null) {
        const localesArray = locales.filter((l) => l.checked).map((l) => l.code);
        setOperationInProgress(OPERATIONS.LOADING_REFERENCES);
        setLoadingReferences(true);
        clearDataStatus();
        const references = await getEntryReferences(contentTypeUid, entry.uid, localesArray, []);
        updateReferences(references);
        setOperationInProgress(OPERATIONS.NONE);
        setLoadingReferences(false);
      }
    }
    getReferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, locales, reloadOnChangeLocales]);

  return {
    dataStatus,
    setDataStatusPartial,
    publishEntries,
    publishEntriesAsRelease,
    publishDisabled:
      !(dataStatus && dataStatus.selectedReferences && Object.keys(dataStatus.selectedReferences).length > 0) ||
      (environments?.filter((e: IEnvironmentConfig) => e.checked) || []).length === 0 ||
      (locales?.filter((l: ILocaleConfig) => l.checked) || []).length === 0 ||
      (operationInProgress !== OPERATIONS.NONE && operationInProgress !== OPERATIONS.PUBLISHING),
  };
};
