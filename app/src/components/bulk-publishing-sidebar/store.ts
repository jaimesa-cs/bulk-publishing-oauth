import {
  IBulkPublishingConfig,
  ICheckable,
  IDataStatus,
  IEnvironmentConfig,
  ILocaleConfig,
  ILog,
  IProgress,
  IReference,
  OPERATIONS,
} from "./models/models";

import { atom } from "jotai";

const updateEntries = (ds: IDataStatus, entries: IReference[]): IDataStatus => {
  const newData = { ...ds };
  // console.log("DS", ds);
  // console.log("ENTRIES", entries);
  entries.forEach((e, index) => {
    const key = `${e.uid}${e.isAsset ? `` : `_${e.locale}`}`;
    if (!newData.allEntries[key]) {
      newData.allEntries[key] = e;
      newData.data.push(e);
      newData.initiallySelected[key] = true;
      newData.statuses[index] = "loaded";
    }
  });
  // console.log("newData >> ", newData);
  return newData;
};

const updateProgress = (p: IProgress, progress: Partial<IProgress>): IProgress => {
  const t = progress.total || p.total;
  const c = progress.current || p.current;
  const calculatedPercentage = parseFloat(Math.round((c / t) * 100).toFixed(2));

  return {
    total: t,
    current: c,
    percentage: calculatedPercentage,
    label: progress.label || p.label,
  };
};

const toggleAll = <T extends ICheckable>(items: T[], checked: boolean): T[] => {
  return items.map((it) => ({
    ...it,
    checked: checked,
  }));
};
const toggleAt = <T extends ICheckable>(items: T[], index: number): T[] => {
  return items.map((it, i) => ({
    ...it,
    checked: i === index ? !it.checked : it.checked,
  }));
};
const addLog = (log: ILog[], msg: string, type: "info" | "error"): ILog[] => {
  return [...log, { message: msg, type: type }];
};

//Jotai Atoms
export const environmentsAtom = atom<IEnvironmentConfig[]>([]);
export const localesAtom = atom<ILocaleConfig[]>([]);
export const errorAtom = atom<string | undefined>(undefined);
export const showErrorAtom = atom<boolean>(false);
export const deployReleasesAtom = atom<boolean>(false);
export const uiReadyAtom = atom<boolean>(false);

export const warningMessageAtom = atom<string | undefined>(undefined);
export const showWarningMessageAtom = atom<boolean>(false);
export const progressAtom = atom<IProgress>({
  percentage: 0,
  current: 0,
  total: 0,
});

export const contentTypeUidAtom = atom<string | undefined>(undefined);
export const currentEntryAtom = atom<string | undefined>(undefined);
export const showLogAtom = atom<boolean>(false);
export const reloadOnChangeLocalesAtom = atom<boolean>(false);
export const canRefreshAtom = atom<boolean>(false);
export const operationInProgressAtom = atom<OPERATIONS>(OPERATIONS.NONE);
export const loadingAtom = atom<boolean>(false);
export const loadingReferencesAtom = atom<boolean>(false);
export const entryAtom = atom<any | null>(null);
export const allLocalesCheckedAtom = atom<boolean>(false);
export const allEnvironmentsCheckedAtom = atom<boolean>(false);

export const dataStatusAtom = atom<IDataStatus>({
  allEntries: {},
  data: [],
  statuses: {},
  initiallySelected: {},
  selectedReferences: {},
});

export const configAtom = atom<IBulkPublishingConfig | undefined>(undefined);
export const logAtom = atom<ILog[]>([]);

export const addLogInfoAtom = atom(
  () => "",
  (get, set, msg: string) => {
    set(logAtom, addLog(get(logAtom), msg, "info"));
  }
);
export const addLogErrorAtom = atom(
  () => "",
  (get, set, msg: string) => {
    set(logAtom, addLog(get(logAtom), msg, "error"));
  }
);
export const setDataStatusAtom = atom(
  () => "",
  (get, set, status: Partial<IDataStatus>) => {
    set(dataStatusAtom, { ...get(dataStatusAtom), ...status });
  }
);

export const clearDataStatusAtom = atom(
  () => "",
  (get, set) => {
    set(dataStatusAtom, {
      allEntries: {},
      data: [],
      statuses: {},
      initiallySelected: {},
      selectedReferences: {},
    });
  }
);
export const toggleEnvironmentAtom = atom(
  () => "",
  (get, set, index: number) => {
    set(environmentsAtom, toggleAt<IEnvironmentConfig>(get(environmentsAtom), index));
  }
);
export const toggleAllEnvironmentAtom = atom(
  () => "",
  (get, set, checked: boolean) => {
    set(environmentsAtom, toggleAll<IEnvironmentConfig>(get(environmentsAtom), checked));
  }
);
export const toggleLocaleAtom = atom(
  () => "",
  (get, set, index: number) => {
    set(localesAtom, toggleAt<ILocaleConfig>(get(localesAtom), index));
  }
);
export const toggleAllLocalesAtom = atom(
  () => "",
  (get, set, checked: boolean) => {
    set(localesAtom, toggleAll<ILocaleConfig>(get(localesAtom), checked));
  }
);

export const updateReferencesAtom = atom(
  () => "",
  (get, set, entries: IReference[]) => {
    set(dataStatusAtom, updateEntries(get(dataStatusAtom), entries));
  }
);

export const updateProgressAtom = atom(
  () => "",
  (get, set, progress: Partial<IProgress>) => {
    set(progressAtom, updateProgress(get(progressAtom), progress));
  }
);
export const resetProgressAtom = atom(
  () => "",
  (get, set, progress: Partial<IProgress> | undefined) => {
    set(progressAtom, {
      percentage: progress?.percentage || 0,
      current: progress?.current || 0,
      total: progress?.total || 0,
    });
  }
);

const noDefaultExport = "There is no default export in this module.";

export default noDefaultExport;
