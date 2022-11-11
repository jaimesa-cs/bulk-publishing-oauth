import { KeyValueObj } from "../types";
import { appConfigAtom } from "../store";
import { useAtom } from "jotai";

/**
 * Getter and setter hook for App config
 */
export const useAppConfig = (): [KeyValueObj, Function] => {
  return useAtom(appConfigAtom);
};
