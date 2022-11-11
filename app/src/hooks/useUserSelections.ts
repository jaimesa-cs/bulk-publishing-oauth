import { IEnvironmentConfig, ILocaleConfig } from "../components/bulk-publishing-sidebar/models/models";
import {
  allEnvironmentsCheckedAtom,
  allLocalesCheckedAtom,
  environmentsAtom,
  localesAtom,
  reloadOnChangeLocalesAtom,
} from "../components/bulk-publishing-sidebar/store";
import useLocalStorage, { SetValue } from "./useLocalStorage";

import { KeyValueObj } from "../types";
import React from "react";
import { useAtom } from "jotai";

export const SELECTIONS_KEY = "csselections";

export interface IUserSelections {
  environments: IEnvironmentConfig[];
  locales: ILocaleConfig[];
  allLocalesChecked: boolean;
  allEnvironmentsChecked: boolean;
  reloadOnChangeLocales: boolean;
}

export const getLocalStorageValue = <T>(): T => {
  return JSON.parse(localStorage.getItem(SELECTIONS_KEY) || "{}") as T;
};

const useUserSelections = () => {
  const [selections, setSelections] = useLocalStorage<IUserSelections>(
    SELECTIONS_KEY,
    getLocalStorageValue<IUserSelections>()
  );
  const [allLocalesChecked] = useAtom(allLocalesCheckedAtom);
  const [allEnvironmentsChecked] = useAtom(allEnvironmentsCheckedAtom);
  const [environments] = useAtom(environmentsAtom);
  const [locales] = useAtom(localesAtom);
  const [reloadOnChangeLocales] = useAtom(reloadOnChangeLocalesAtom);

  const save = React.useCallback(() => {
    console.log("Saving selections", {
      environments,
      locales,
      allLocalesChecked,
      allEnvironmentsChecked,
      reloadOnChangeLocales,
    });
    setSelections({
      environments,
      locales,
      allLocalesChecked,
      allEnvironmentsChecked,
      reloadOnChangeLocales,
    });
  }, [allEnvironmentsChecked, allLocalesChecked, environments, locales, reloadOnChangeLocales, setSelections]);

  return {
    selections,
    setSelections,
    saveUserSelections: () => save(),
  };
};

export default useUserSelections;
