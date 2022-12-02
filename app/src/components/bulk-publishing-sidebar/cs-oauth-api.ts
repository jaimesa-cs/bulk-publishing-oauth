import { ASSET_REGEXP, IEnvironmentConfig, ILocaleConfig, IReference, OPERATIONS, REF_REGEXP } from "./models/models";
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  MAX_BULK_PUBLISHING_REQUESTS,
  MAX_ENTRIES_ADDED_AT_ONCE,
  MAX_ITEMS_PER_RELEASE,
  MAX_RELEASE_NAME_LENGTH,
} from "./constants";
import { addLogErrorAtom, addLogInfoAtom, currentEntryAtom, operationInProgressAtom } from "./store";

import React from "react";
import { sleep } from "../../utils";
import { useAtom } from "jotai";
import useContentstackAxios from "../../hooks/oauth/useContetstackAxios";
import useMessageWithDetails from "../../hooks/oauth/useMessageWithDetails";

export interface IPublishInstruction {
  entries?: {
    uid: string;
    content_type?: string;
    locale: string;
  }[];
  assets?: { uid: string }[];
  locales?: string[];
  environments?: string[];
}

export interface IRelease {
  name: string;
  locale: string;
  entries: IReference[];
}

export interface IEntryMap {
  [key: string]: IReference[];
}

interface SdkResult {
  axios: (query: string, options?: AxiosRequestConfig) => AxiosPromise;
  getAsset: (uid: string, options?: AxiosRequestConfig) => AxiosPromise;
  getEntry: (contentTypeUid: string, uid: string, locale: string, options?: AxiosRequestConfig) => AxiosPromise;
  getEntryLanguages: (contentTypeUid: string, uid: string, options?: AxiosRequestConfig) => AxiosPromise;
  getLocales: (options?: AxiosRequestConfig) => AxiosPromise;
  getEnvironments: (options?: AxiosRequestConfig) => AxiosPromise;
  getEntryReferences: (
    contentTypeUid: string,
    uid: string,
    locales: string[],
    references: IReference[],
    options?: AxiosRequestConfig
  ) => any;
  publishAsRelease: (
    entry: any,
    references: IReference[],
    locales: ILocaleConfig[],
    environments: IEnvironmentConfig[],
    deployReleases: boolean,
    options?: AxiosRequestConfig<any>
  ) => Promise<void>;
  publish: (
    references: IReference[],
    locales: ILocaleConfig[],
    environments: IEnvironmentConfig[],
    options?: AxiosRequestConfig<any>
  ) => Promise<void>;
}

/**
 * Custom hook that exposes useful methods to interact with the OAuth Contentstack API
 * @param endpoint, the OAuth Contentstack API endpoint
 * @returns
 */
export const useOauthCsApi = (): SdkResult => {
  const [, setOperationInProgress] = useAtom(operationInProgressAtom);

  const [, addToLogInfo] = useAtom(addLogInfoAtom);
  const [, addToLogError] = useAtom(addLogErrorAtom);
  const [, setCurrentEntry] = useAtom(currentEntryAtom);

  const axios = useContentstackAxios();
  const { showSuccess, showError } = useMessageWithDetails();

  const getAssetReference = React.useCallback(
    async (uid: string, depth: number, options?: AxiosRequestConfig): Promise<IReference | null> => {
      try {
        const response = await axios(`/v3/assets/${uid}`, options);
        return {
          uniqueKey: `${response.data.asset.uid}`,
          uid: response.data.asset.uid,
          isAsset: true,
          content_type_uid: "_asset",
          entry: response.data.asset,
          locale: "",
          references: [],
          depth: depth,
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getEntryReference = React.useCallback(
    async (
      contentTypeUid: string,
      uid: string,
      locale: string,
      depth: number,
      options?: AxiosRequestConfig
    ): Promise<IReference | null> => {
      try {
        const response = await axios(`/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`, options);
        const languagesResponse = await axios(`/v3/content_types/${contentTypeUid}/entries/${uid}/locales`, options);

        return {
          uniqueKey: `${response.data.entry.uid}_${locale}`,
          uid: response.data.entry.uid,
          isAsset: false,
          content_type_uid: contentTypeUid,
          entry: response.data.entry,
          references: [],
          locale: locale,
          locales: languagesResponse.data.locales,
          depth: depth,
        };
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getRegexEntryReferences = React.useCallback(
    async (entry: any, locale: string, depth: number): Promise<IReference[]> => {
      const references: IReference[] = [];
      let refs: string[] = [];
      const sJson = JSON.stringify(entry, null, 2);

      const refMatches = sJson.matchAll(REF_REGEXP);
      for (const rMatch of refMatches) {
        const refUid = rMatch[1] as string;
        const refCtUid = rMatch[2] as string;
        if (!refs.includes(refUid)) {
          const entryRef = await getEntryReference(refCtUid, refUid, locale, depth);
          if (entryRef !== null) {
            references.push(entryRef);
          }
          refs.push(refUid);
        }
      }
      return references;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getRegexAssetReferences = React.useCallback(
    async (entry: any, depth: number): Promise<IReference[]> => {
      const references: IReference[] = [];
      let refs: string[] = [];
      const sJson = JSON.stringify(entry, null, 2);
      const assetMatches = sJson.matchAll(ASSET_REGEXP);
      for (const aMatch of assetMatches) {
        const refUid = aMatch[1] as string;
        if (!refs.includes(refUid)) {
          // promises.push(sdk.getAsset(refUid, ""));
          const assetRef = await getAssetReference(refUid, depth);
          if (assetRef !== null) {
            references.push(assetRef);
          }
          refs.push(refUid);
        }
      }

      return references;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getReferencesRecursively = React.useCallback(
    async (
      contentTypeUid: string,
      uid: string,
      locales: string[],
      references: IReference[],
      depth: number,
      options?: AxiosRequestConfig
    ): Promise<IReference[]> => {
      let refs: IReference[] = references && references.length > 0 ? [...references] : [];
      for (let i = 0; i < locales.length; i++) {
        const locale = locales[i];

        const uniqueKey = `${uid}_${locale}`;
        if (!refs.find((r) => r.uniqueKey === uniqueKey && r.content_type_uid === contentTypeUid)) {
          const reference = await getEntryReference(contentTypeUid, uid, locale, depth, options);
          if (reference != null) {
            setCurrentEntry(`${reference.entry.title} (${locale})`);
            const e = await getRegexEntryReferences(reference.entry, reference.locale, depth);
            const a = await getRegexAssetReferences(reference.entry, depth);
            const allRefs = [...e];
            const newAssets = [];
            for (let j = 0; j < a.length; j++) {
              // console.log("current refs2", refs, "asset ref", a[j].uniqueKey);
              if (refs.some((r) => r.uniqueKey === a[j].uniqueKey)) {
                continue;
              }
              newAssets.push(a[j]);
            }

            reference.references = allRefs.map((r) => {
              return r.uid;
            });

            refs = [...refs, reference, ...newAssets];

            const entryReferences = allRefs.filter((r) => !r.isAsset);

            for (const ref of entryReferences) {
              refs = [
                ...(await getReferencesRecursively(ref.content_type_uid!, ref.uid, [locale], refs, depth++, options)),
              ];
            }
          }
        } else {
          console.debug(`Skipping ${uniqueKey} as it is already processed`);
        }
      }
      return refs;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    axios: (query: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`${query}`, options);
    },
    getAsset: (uid: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`/v3/assets/${uid}`, options);
    },
    getEntry: (contentTypeUid: string, uid: string, locale: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`, options);
    },
    getEntryLanguages: (contentTypeUid: string, uid: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios(`/v3/content_types/${contentTypeUid}/entries/${uid}/locales`, options);
    },
    getLocales: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(`/v3/locales`, options);
    },
    getEnvironments: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios(`/v3/environments`, options);
    },
    getEntryReferences: async (
      contentTypeUid: string,
      uid: string,
      locales: string[],
      references: IReference[],
      options?: AxiosRequestConfig
    ): Promise<IReference[]> => {
      return await getReferencesRecursively(contentTypeUid, uid, locales, references, 1, options);
    },
    publishAsRelease: async (
      entry: any,
      references: IReference[],
      locales: ILocaleConfig[],
      environments: IEnvironmentConfig[],
      deployReleases: boolean,
      options?: AxiosRequestConfig<any>
    ): Promise<void> => {
      setOperationInProgress(OPERATIONS.PUBLISHING);
      const releases = getReleases(entry, references, locales, environments);
      for (let i = 0; i < releases.length; i++) {
        const release = releases[i];
        let responseRelease: AxiosResponse | undefined = undefined;
        let responseAddItemsToRelease: AxiosResponse | undefined = undefined;
        let responseDeploy: AxiosResponse | undefined = undefined;
        try {
          responseRelease = await axios(`/v3/releases`, {
            method: "POST",
            data: {
              release: {
                name: release.name,
                description: `Release Automatically Generated by UI Bulk Publishing Extension from entry: ${entry.title} [${entry.uid}] `,
              },
            },
          });
          if (responseRelease?.status === 201) {
            addToLogInfo(`Creating Release ${release.name}`);
            const releaseUid = responseRelease.data.release.uid;

            const allEntries = release.entries.map((e) => {
              return {
                uid: e.uid,
                version: e.entry._version,
                locale: release.locale,
                content_type_uid: e.isAsset ? "built_io_upload" : e.content_type_uid,
                action: "publish",
              };
            });

            while (allEntries.length > 0) {
              try {
                const maxItemsAtOnce = allEntries.splice(0, MAX_ENTRIES_ADDED_AT_ONCE);
                const data = {
                  items: maxItemsAtOnce,
                };
                responseAddItemsToRelease = await axios(`/v3/releases/${releaseUid}/items`, {
                  method: "POST",
                  data: data,
                });
                addToLogInfo(`Items added to Release: \r\n ${maxItemsAtOnce.map((e) => e.uid).join("\r\n")}`);
              } catch (e) {
                addToLogError(`Error Adding Items to Release ${release.name}`);
                showError("Error Adding Items to Release");
                console.log("Error adding items to release", responseAddItemsToRelease?.statusText);
              }
            }

            if (!deployReleases) {
              showSuccess(`Release ${release.name} created with ${release.entries.length} items.`);
            }
            if (deployReleases && responseAddItemsToRelease?.status === 200) {
              try {
                responseDeploy = await axios(`/v3/releases/${releaseUid}/deploy`, {
                  method: "POST",
                  data: {
                    release: {
                      environments: [environments.map((e) => e.uid)],
                    },
                  },
                });
                addToLogInfo(`Deploying Release to [${environments.map((e) => e.name).join(",")}]`);
                showSuccess(`Release ${release.name} successfully deployed.`);
              } catch (e) {
                addToLogError(`Error Deploying Release ${release.name}`);
                showError("Error Deploying Release");
                console.log("Error deploying release", responseDeploy?.statusText);
              }
            }
          } else {
            addToLogError(`Error Creating Release ${release.name}`);
            showError("Error Creating Release");
          }
        } catch (e) {
          addToLogError(`Error Creating Release ${release.name}`);
          showError("Error Creating Release");
          console.log("Error creating release", responseRelease?.statusText);
        }
      }
      setOperationInProgress(OPERATIONS.NONE);
    },
    publish: async (
      references: IReference[],
      locales: ILocaleConfig[],
      environments: IEnvironmentConfig[],
      options?: AxiosRequestConfig<any>
    ): Promise<void> => {
      setOperationInProgress(OPERATIONS.PUBLISHING);
      const instructions = getPublishInstructions(references, locales, environments);
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        try {
          await axios(`/v3/bulk/publish`, { method: "POST", data: instruction });
          await sleep(1000); //! ONE SECOND DELAY TO AVOID API LIMITS
          [...(instruction.entries || []), ...(instruction.assets || [])].forEach((item) => {
            addToLogInfo(`Published ${item.uid}.`);
          });
        } catch (e) {
          console.log("Bulk Publish :: error", e);
          addToLogError(`Error. ${JSON.stringify(e)}`);
          showError(`Error publishing entries`);
        }
      }
      showSuccess(`References successfully published!.`);
      setOperationInProgress(OPERATIONS.NONE);
    },
  };
};

const getReleases = (
  entry: any,
  entries: IReference[],
  locales: ILocaleConfig[],
  environments: IEnvironmentConfig[]
): IRelease[] => {
  const releases: IRelease[] = [];
  const localesMap = groupEntriesByLocale(entries, locales);
  const assets = localesMap["assets"] || [];

  Object.keys(localesMap)
    .filter((k) => k !== "assets")
    .forEach((locale) => {
      const e = [...localesMap[locale], ...assets];
      const releasesAmount = Math.ceil(e.length / MAX_ITEMS_PER_RELEASE);
      let currentReleaseNumber = 0;

      const datePortion = new Date().toUTCString();
      const counterPortion = releasesAmount > 1 ? ` ${currentReleaseNumber + 1}/${releasesAmount}` : "";
      const mandatoryText = `[${locale}] @ ${datePortion} ${counterPortion}`;
      const charsLeft = MAX_RELEASE_NAME_LENGTH - (mandatoryText.length + 1); //1 empty space after the title

      const titlePortion = entry.title.substring(0, charsLeft);

      let releaseName = `${titlePortion} ${mandatoryText}`;
      while (e.length > 0) {
        // console.log("==================================");
        const currentEntries = e.splice(0, MAX_ITEMS_PER_RELEASE);
        const release: IRelease = {
          name: releaseName,
          locale: locale,
          entries: currentEntries,
        };
        releases.push(release);
        currentReleaseNumber++;
      }
    });

  return releases;
};

const getPublishInstructions = (
  entries: IReference[],
  locales: ILocaleConfig[],
  environments: IEnvironmentConfig[]
): IPublishInstruction[] => {
  const instructions: IPublishInstruction[] = [];
  const localesMap = groupEntriesByLocale(entries, locales);
  Object.keys(localesMap).forEach((locale) => {
    const localeEntries = localesMap[locale];
    // const e = localeEntries.filter((entry) => !entry.isAsset);
    while (localeEntries.length > 0) {
      const currentEntries = localeEntries.splice(0, MAX_BULK_PUBLISHING_REQUESTS);
      const instruction: IPublishInstruction = {};
      if (currentEntries.length > 0) {
        if (locale !== "assets") {
          instruction.entries = currentEntries.map((entry) => ({
            uid: entry.uid,
            content_type: entry.content_type_uid,
            locale,
          }));
          instruction.locales = [locale];
        } else {
          instruction.assets = currentEntries.map((asset) => ({ uid: asset.uid }));
          instruction.locales = locales.map((l) => l.code);
        }
      }

      instruction.environments = environments.map((env) => env.name);
      // console.log("instruction", locale, locale !== "assets", instruction);
      instructions.push(instruction);
    }
  });

  return instructions;
};

const groupEntriesByLocale = (entries: IReference[], locales: ILocaleConfig[]): IEntryMap => {
  const entryMap: IEntryMap = {};
  console.log("Entries", entries);
  locales.forEach((locale) => {
    entryMap[locale.code] = entries.filter((entry) => entry.locale === locale.code && !entry.isAsset);
  });
  entryMap["assets"] = entries.filter((entry) => entry.isAsset);
  // console.log("entryMap", entryMap);
  return entryMap;
};
