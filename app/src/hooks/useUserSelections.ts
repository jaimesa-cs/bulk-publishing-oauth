import { IEnvironmentConfig, ILocaleConfig } from "../components/bulk-publishing-sidebar/models/models";
import {
  allEnvironmentsCheckedAtom,
  allLocalesCheckedAtom,
  environmentsAtom,
  localesAtom,
  reloadOnChangeLocalesAtom,
} from "../components/bulk-publishing-sidebar/store";

import React from "react";
import secureLocalStorage from "react-secure-storage";
import { useAtom } from "jotai";
import useLocalStorage from "./useLocalStorage";

export const SELECTIONS_KEY = "csselections";

export interface IUserSelections {
  environments: IEnvironmentConfig[];
  locales: ILocaleConfig[];
  allLocalesChecked: boolean;
  allEnvironmentsChecked: boolean;
  reloadOnChangeLocales: boolean;
}

export const getLocalStorageValue = <T>(): T => {
  return secureLocalStorage.getItem(SELECTIONS_KEY) as T;
};

const useUserSelections = () => {
  const [selections, setSelections] = useLocalStorage(SELECTIONS_KEY, getLocalStorageValue<IUserSelections>());
  const [allLocalesChecked] = useAtom(allLocalesCheckedAtom);
  const [allEnvironmentsChecked] = useAtom(allEnvironmentsCheckedAtom);
  const [environments] = useAtom(environmentsAtom);
  const [locales] = useAtom(localesAtom);
  const [reloadOnChangeLocales] = useAtom(reloadOnChangeLocalesAtom);

  React.useEffect(() => {
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
  };
};

export default useUserSelections;
