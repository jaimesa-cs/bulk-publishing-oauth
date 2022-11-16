import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

import EncryptionService from "../utils/secure-storage/encryption";

const KEY_PREFIX = "@secure-storage.";

declare global {
  interface WindowEventMap {
    "local-storage": CustomEvent;
  }
}

const getSecureKey = (key: string) => `${KEY_PREFIX}${key}`;

type SetValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorage<T>(originalKey: string, initialValue: T): [T | undefined, SetValue<T | undefined>] {
  const [key] = useState(getSecureKey(originalKey));
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T | undefined => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === "undefined") {
      return undefined;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return undefined;
      }
      const encryption = new EncryptionService();
      const sValue = encryption.decrypt(item);
      return item ? (parseJSON(sValue) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T | undefined>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T | undefined> = useEventCallback((value) => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === "undefined") {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to local storage
      const encryption = new EncryptionService();
      window.localStorage.setItem(key, encryption.encrypt(JSON.stringify(newValue)));
      // Save state
      setStoredValue(newValue);

      // We dispatch a custom event so every useLocalStorage hook are notified
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  });

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return;
      }

      const newValue = readValue();
      setStoredValue(newValue);
    },
    [key, readValue]
  );

  // this only works for other documents, not the current one
  useEventListener("storage", handleStorageChange);

  // this is a custom event, triggered in writeValueToLocalStorage
  // See: useLocalStorage()
  useEventListener("local-storage", handleStorageChange);

  return [storedValue, setValue];
}

export default useLocalStorage;

// A wrapper for "JSON.parse()"" to support "undefined" value
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });
    return undefined;
  }
}

export const getExistingSecureStorageValue = <T>(originalKey: string): T => {
  const key = getSecureKey(originalKey);
  if (typeof window === "undefined") {
    return {} as T;
  }
  const value = window.localStorage.getItem(key);
  if (value === null) {
    return {} as T;
  }
  const encryption = new EncryptionService();
  const sValue = encryption.decrypt(value);
  return sValue ? (parseJSON(sValue) as T) : ({} as T);
};
