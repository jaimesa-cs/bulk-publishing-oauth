import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { isEmpty } from "lodash";
import { useAppLocation } from "./useAppLocation";

type InstallationData = {
  configuration: { [key: string]: any };
  serverConfiguration: { [key: string]: any };
};

export const installationDataAtom = atom<InstallationData>({ configuration: {}, serverConfiguration: {} });

/**
 * Getter & Setter for installation data
 */
export const useInstallationData = (): [InstallationData, Function, boolean] => {
  const [loading, setLoading] = useState<boolean>(false);
  const { location } = useAppLocation();
  const [installationData, setInstallation] = useAtom(installationDataAtom);

  useEffect(() => {
    // console.log("useEffect useInstallationData");
    if (!isEmpty(installationData)) return;
    setLoading(true);
    location.installation
      .getInstallationData()
      .then((data: InstallationData) => {
        setInstallation(data);
      })
      .catch((err: any) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [installationData, location, setLoading, setInstallation]);

  const setInstallationData = useCallback(
    async (data: { [key: string]: any }) => {
      setLoading(true);
      const newInstallationData: InstallationData = {
        configuration: { ...installationData.configuration, ...data },
        serverConfiguration: installationData.serverConfiguration,
      };
      await location.installation.setInstallationData(newInstallationData);
      setInstallation(newInstallationData);
      setLoading(false);
    },
    [location, setInstallation, setLoading]
  );

  return [installationData, setInstallationData, loading];
};
