import {
  IBulkPublishingConfig,
  ICheckable,
  IDataStatus,
  IEnvironmentConfig,
  ILocaleConfig,
  ILog,
  OPERATIONS,
} from "./models/models";

import { atom } from "jotai";

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
export const warningMessageAtom = atom<string | undefined>(undefined);
export const showWarningMessageAtom = atom<boolean>(false);
export const contentTypeUidAtom = atom<string | undefined>(undefined);
export const showLogAtom = atom<boolean>(false);
export const reloadOnChangeLocalesAtom = atom<boolean>(false);
export const canRefreshAtom = atom<boolean>(false);
export const operationInProgressAtom = atom<OPERATIONS>(OPERATIONS.NONE);
export const loadingAtom = atom<boolean>(false);
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
export const processingTrackerAtom = atom<number>(0);

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

const noDefaultExport = "There is no default export in this module.";

export default noDefaultExport;
