import { IEnvironmentConfig, ILocaleConfig } from "../components/bulk-publishing-sidebar/models/models";
import {
  allEnvironmentsCheckedAtom,
  allLocalesCheckedAtom,
  environmentsAtom,
  localesAtom,
  reloadOnChangeLocalesAtom,
} from "../components/bulk-publishing-sidebar/store";
import useSecureLocalStorage, { getExistingSecureStorageValue } from "./secure-local-storage/useSecureLocalStorage";

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

const useUserSelections = () => {
  const [selections, setSelections] = useSecureLocalStorage<IUserSelections>(
    SELECTIONS_KEY,
    getExistingSecureStorageValue<IUserSelections>(SELECTIONS_KEY)
  );
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
