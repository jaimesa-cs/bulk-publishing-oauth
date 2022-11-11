import { KeyValueObj } from "../types";
import { atom } from "jotai";

export const appConfigAtom = atom<KeyValueObj>({});
