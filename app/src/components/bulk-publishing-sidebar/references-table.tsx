import {
  ASSET_REGEXP,
  IDataStatus,
  IDictionary,
  IEnvironmentConfig,
  ILocaleConfig,
  IProcessedItem,
  IReference,
  OPERATIONS,
  REF_REGEXP,
} from "./models/models";
import {
  Accordion,
  Button,
  Checkbox,
  InfiniteScrollTable,
  InstructionText,
  Tooltip,
} from "@contentstack/venus-components";
import {
  canRefreshAtom,
  clearDataStatusAtom,
  dataStatusAtom,
  environmentsAtom,
  loadingAtom,
  localesAtom,
  operationInProgressAtom,
  reloadOnChangeLocalesAtom,
  setDataStatusAtom,
  showWarningMessageAtom,
  warningMessageAtom,
} from "./store";

import LogDetails from "./log-details";
import React from "react";
import { showError } from "../../utils/notifications";
import { useAppSdk } from "../../hooks/useAppSdk";
import { useAtom } from "jotai";
import { useEntry } from "../../hooks/useEntry";
import { useOauthCsApi } from "./cs-oauth-api";

export const SAVE_MESSAGE: string = "You need to save the entry, and reload the extension to update the references.";
export const SAVED_MESSAGE: string = "Entry saved, you need to reload the extension to update the references.";

function ReferencesTable() {
  const [dataStatus, setDataStatus] = useAtom(dataStatusAtom);
  const [environments] = useAtom(environmentsAtom);
  const [locales] = useAtom(localesAtom);

  const [, setDataStatusPartial] = useAtom(setDataStatusAtom);
  const [, clearDataStatus] = useAtom(clearDataStatusAtom);
  const [operationInProgress, setOperationInProgress] = useAtom(operationInProgressAtom);
  const [processingTracker, setProcessingTracker] = React.useState(0);
  const [reloadOnChangeLocales] = useAtom(reloadOnChangeLocalesAtom);

  const [loading, setLoading] = useAtom(loadingAtom);
  const [, setShowWarning] = useAtom(showWarningMessageAtom);
  const [, setWarningMessage] = useAtom(warningMessageAtom);
  const [, setCanRefresh] = useAtom(canRefreshAtom);

  const [appSdk] = useAppSdk();
  const { entryData: entry, contentTypeUid } = useEntry({
    onChange: () => {
      setShowWarning(true);
      setWarningMessage(SAVE_MESSAGE);
      setCanRefresh(false);
    },
    onSave: () => {
      setShowWarning(true);
      setWarningMessage(SAVED_MESSAGE);
      setCanRefresh(true);
    },
  });

  const { publish, publishAsRelease } = useOauthCsApi();

  const [viewBy, updateViewBy] = React.useState("Comfortable");
  const [deployReleases, setDeployReleases] = React.useState(false);
  const processedItems = React.useRef<IProcessedItem[]>([]);

  const getSelectedRow = (singleSelectedRowIds: any) => {
    let selectedObj: any = {};
    singleSelectedRowIds.forEach((refUid: any) => {
      selectedObj[refUid] = true;
    });
    setDataStatusPartial({ selectedReferences: { ...selectedObj } });
  };

  const showData = React.useCallback(
    (data?: IReference[]) => {
      if (dataStatus.allEntries && Object.keys(dataStatus.allEntries).length > 0) {
        const d = data || Object.values(dataStatus.allEntries);
        const statusMap: any = {};
        const initiallySelectedMap: any = [];
        d.forEach((_: any, index: number) => {
          statusMap[index] = "loaded";
        });
        d.forEach((item: any) => {
          initiallySelectedMap[item.uniqueKey] = true;
        });
        setLoading(false);
        setProcessingTracker(0);
        setOperationInProgress(OPERATIONS.NONE);
        setDataStatusPartial({ data: d, statuses: statusMap, initiallySelected: initiallySelectedMap });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataStatus.allEntries]
  );

  const getColumns = React.useCallback((): any => {
    return [
      {
        Header: "Key",
        id: "uniqueKey",
        accessor: (data: any) => (
          <div className="title-container">
            <div className="content-title">{data.uniqueKey}</div>
          </div>
        ),
        columnWidthMultiplier: 2,
      },
      {
        Header: "Title",
        id: "title",
        accessor: (data: IReference) => {
          return (
            <div className="title-container">
              <div className="content-title">
                <strong>{data.entry?.title}</strong>
              </div>
              {viewBy === "Comfortable" && <InstructionText style={{ textAlign: "left" }}>{data.uid}</InstructionText>}
            </div>
          );
        },
        default: true,
        columnWidthMultiplier: 2,
      },
      {
        Header: "Locales",
        id: "uid",
        accessor: (data: any) => {
          const isLocalized = data.locales && data.locales.some((locale: any) => locale.localized);
          const tooltipContent = data.isAsset
            ? `n/a`
            : `${
                isLocalized
                  ? `Localized in: ${data.locales
                      .filter((l: any) => l.localized)
                      .map((l: any) => l.code)
                      .join(", ")}`
                  : `Not Localized`
              }`;

          return (
            <Tooltip content={tooltipContent} position="top" showArrow={false}>
              <>
                <div className="title-container">
                  <div className="content-title">{data.locale || `n/a (asset)`}</div>
                </div>
                {viewBy === "Comfortable" && (
                  <InstructionText style={{ textAlign: "left" }}>
                    {isLocalized ? "Localized" : "Not Localized"}
                  </InstructionText>
                )}
              </>
            </Tooltip>
          );
        },
        columnWidthMultiplier: 1,
      },
    ];
  }, [viewBy]);

  const publishEntries = React.useCallback(() => {
    const selectedKeys = Object.keys(dataStatus.selectedReferences);

    const references: IReference[] = Object.values(dataStatus.allEntries).filter(
      (r) => selectedKeys.indexOf(r.uniqueKey) > -1
    );

    publish(
      references,
      locales.filter((l) => l.checked),
      environments.filter((e) => e.checked)
    );
  }, [dataStatus.allEntries, dataStatus.selectedReferences, publish, locales, environments]);

  const publishEntriesAsRelease = React.useCallback(() => {
    const selectedKeys = Object.keys(dataStatus.selectedReferences);
    const references: IReference[] = Object.values(dataStatus.allEntries).filter(
      (r) => selectedKeys.indexOf(r.uniqueKey) > -1
    );

    if (entry) {
      publishAsRelease(
        entry,
        references,
        locales.filter((l) => l.checked),
        environments.filter((e) => e.checked),
        deployReleases
      );
    } else {
      showError("Unable to deploy as release. Please save the entry first.");
      setOperationInProgress(OPERATIONS.NONE);
    }
  }, [
    dataStatus.selectedReferences,
    dataStatus.allEntries,
    entry,
    publishAsRelease,
    locales,
    environments,
    deployReleases,
    setOperationInProgress,
  ]);

  const clearStatus = React.useCallback(
    (clearTracker: boolean = false) => {
      if (clearTracker) {
        processedItems.current = [];
      }
      clearDataStatus();
    },
    [clearDataStatus]
  );

  const pushItem = React.useCallback((item: IReference, completed: boolean = false): void => {
    let idx = -1;
    if (item.isAsset) {
      idx = processedItems.current.findIndex((i) => i.id === item.uid);
    } else {
      idx = processedItems.current.findIndex((i) => i.id === item.uid && i.locale === item.locale);
    }

    if (idx <= -1) {
      const theItem = {
        id: item.uid,
        locale: item.locale,
        completed: completed,
      };

      processedItems.current.push(theItem);
    }
  }, []);

  const getAsset = React.useCallback(
    async (uid: string): Promise<IReference> => {
      const response = await appSdk?.location?.SidebarWidget?.stack.Asset(uid).fetch();
      return {
        uniqueKey: `${response.asset.uid}`,
        uid: response.asset.uid,
        isAsset: true,
        content_type_uid: "_asset",
        entry: response.asset,
        locale: "",
        references: [],
      };
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const addEntry = React.useCallback(
    (entry: IReference) => {
      setDataStatus((ds: IDataStatus) => {
        let all: IDictionary<IReference> = {};
        const key = `${entry.uid}${entry.isAsset ? `` : `_${entry.locale}`}`;
        if (ds.allEntries[key]) {
          return { ...ds };
        } else {
          all = {
            ...ds.allEntries,
            [key]: entry,
          };
        }

        return { ...ds, allEntries: all };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getEntry = React.useCallback(
    async (uid: string, content_type_uid: string, locale: string): Promise<IReference> => {
      const response = await appSdk?.location?.SidebarWidget?.stack
        .ContentType(content_type_uid)
        .Entry(uid)
        .language(locale)
        .fetch();
      const languagesResponse = await appSdk?.location?.SidebarWidget?.stack
        .ContentType(content_type_uid)
        .Entry(uid)
        .getLanguages();
      // console.log("Getting entry", uid, content_type_uid, locale, response.entry);
      return {
        uniqueKey: `${response.entry.uid}_${locale}`,
        uid: response.entry.uid,
        isAsset: false,
        content_type_uid: content_type_uid,
        entry: response.entry,
        references: [],
        locale: locale,
        locales: languagesResponse.locales,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getEntryPromises = React.useCallback(
    (entry: any, locale: string): Promise<any>[] => {
      const promises: Promise<any>[] = [];
      let refs: string[] = [];
      const sJson = JSON.stringify(entry, null, 2);

      const refMatches = sJson.matchAll(REF_REGEXP);
      for (const rMatch of refMatches) {
        const refUid = rMatch[1] as string;
        const refCtUid = rMatch[2] as string;
        if (!refs.includes(refUid)) {
          promises.push(getEntry(refUid, refCtUid, locale));
          refs.push(refUid);
        }
      }
      return promises;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getAssetPromises = React.useCallback(
    (entry: any): Promise<any>[] => {
      const promises: Promise<any>[] = [];
      let refs: string[] = [];
      const sJson = JSON.stringify(entry, null, 2);
      const assetMatches = sJson.matchAll(ASSET_REGEXP);
      for (const aMatch of assetMatches) {
        const refUid = aMatch[1] as string;
        if (!refs.includes(refUid)) {
          // promises.push(sdk.getAsset(refUid, ""));
          promises.push(getAsset(refUid));
          refs.push(refUid);
        }
      }

      return promises;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const processItem = React.useCallback((item: IReference): void => {
    let idx = -1;
    if (item.isAsset) {
      idx = processedItems.current.findIndex((i) => i.id === item.uid);
    } else {
      idx = processedItems.current.findIndex((i) => i.id === item.uid && i.locale === item.locale);
    }

    if (idx > -1) {
      processedItems.current[idx].completed = true;
    }
  }, []);

  /**
   * Get all references (recursively) for an entry.
   * Once the recursion for an entry is completed, the function calls: processItem and updates the trackerObserver,
   * so it can determine whether all items have been processed.
   *
   * By updating the trackerObserver, the useEffect with its dependency will be triggered again,
   * and the app will check whether the recursion is completed, so the data can be displayed.
   *
   */
  const loadReferences = React.useCallback(
    (reference: IReference): void => {
      // console.log("Loading references for", reference.entry.title, reference.uid, reference);

      let promises = [...getEntryPromises(reference.entry, reference.locale), ...getAssetPromises(reference.entry)];
      Promise.all(promises)
        .then((results) => {
          for (const ref of results) {
            if (reference.references && !reference.references.includes(ref.uid)) {
              reference.references.push(ref.uid);
              addEntry(ref);
              if (processedItems.current.some((t: any) => t.id === ref.uid && t.locale === ref.locale)) {
                continue;
              }

              if (ref.isAsset) {
                // console.log("Asset processed", ref.uid, ref.locale);
                pushItem(ref, true);
                continue;
              }
              // console.log("Entry processed", ref.uid, ref.locale);
              pushItem(ref);
              loadReferences(ref);
            }
          }

          addEntry(reference);

          setProcessingTracker((n) => {
            processItem(reference);
            return n + 1;
          });
          setProcessingTracker((n) => n + 1);
        })
        .catch((error) => {
          console.log("Loading References Error", error);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const reload = React.useCallback(() => {
    setOperationInProgress(OPERATIONS.LOADING_REFERENCES);
    setLoading(true);
    clearStatus(true);
    locales
      .filter((l) => l.checked)
      .forEach((locale: ILocaleConfig) => {
        appSdk?.location?.SidebarWidget?.stack
          .ContentType(contentTypeUid)
          .Entry(entry.uid)
          .language(locale.code)
          .fetch()
          .then((entryResponse: any) => {
            appSdk.location?.SidebarWidget?.stack
              .ContentType(contentTypeUid)
              .Entry(entry.uid)
              .getLanguages()
              .then((response: any) => {
                const localeTopRef: IReference = {
                  uniqueKey: `${entry.uid}_${locale.code}`,
                  uid: entry.uid,
                  isAsset: false,
                  content_type_uid: contentTypeUid,
                  entry: entryResponse.entry,
                  references: [],
                  locales: response.locales,
                  locale: locale.code,
                };
                pushItem(localeTopRef);
                loadReferences(localeTopRef);
              })
              .catch((error: any) => {
                showError("Error Getting Languages");
                console.log("Error Getting Languages", error);
              });
          })
          .catch((error: any) => {
            showError("Error Getting Entry");
            console.log("Error Getting Entry", error);
          });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locales, entry, contentTypeUid]);

  React.useEffect(() => {
    if (
      processingTracker > 0 &&
      loading &&
      processedItems.current.length > 0 &&
      processedItems.current.every((c) => c.completed)
    ) {
      showData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingTracker]);

  React.useEffect(() => {
    if (entry && locales && locales.some((l) => l.checked)) {
      if (reloadOnChangeLocales) {
        reload();
      }
    } else {
      setProcessingTracker((to) => to + 1);
      clearDataStatus();
      setLoading(false);
      setOperationInProgress(OPERATIONS.NONE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locales, entry, contentTypeUid, reloadOnChangeLocales]);

  // React.useEffect(() => {
  //   const handleAppClose = (event: any) => {
  //     event.preventDefault();
  //     saveUserSelections();
  //   };

  //   window.addEventListener("unload", handleAppClose);

  //   return () => {
  //     window.removeEventListener("unload", handleAppClose);
  //   };
  // }, [saveUserSelections]);

  return (
    <>
      <Accordion title={"References"} renderExpanded className="bp-accordion">
        <div style={{ paddingLeft: 5 }}>
          <InfiniteScrollTable
            canRefresh={!reloadOnChangeLocales}
            loading={loading}
            initialSelectedRowIds={dataStatus.initiallySelected}
            disabled={operationInProgress !== OPERATIONS.NONE}
            canSearch={false}
            totalCounts={dataStatus.data.length}
            // data={operationInProgress === OPERATIONS.NONE ? dataStatus.data : []}
            data={dataStatus.data}
            isLoading={operationInProgress !== OPERATIONS.NONE}
            fetchTableData={() => {
              reload();
            }}
            loadMoreItems={() => {}}
            itemStatusMap={dataStatus.statuses}
            columns={getColumns()}
            uniqueKey={"uniqueKey"}
            hiddenColumns={["uniqueKey"]}
            isRowSelect
            getSelectedRow={getSelectedRow}
            getViewByValue={(selectedViewBy: any) => {
              updateViewBy(selectedViewBy);
            }}
            emptyHeading={"No references"}
            emptyDescription={
              locales.some((l) => l.checked) ? undefined : "Please, select at least one locale to load the references."
            }
            viewSelector={true}
            columnSelector={false}
            tableHeight={400}
          />
        </div>
      </Accordion>

      <>
        <br />
        <div>
          <Button
            disabled={
              !(dataStatus && dataStatus.selectedReferences && Object.keys(dataStatus.selectedReferences).length > 0) ||
              (environments?.filter((e: IEnvironmentConfig) => e.checked) || []).length === 0 ||
              (locales?.filter((l: ILocaleConfig) => l.checked) || []).length === 0 ||
              (operationInProgress !== OPERATIONS.NONE && operationInProgress !== OPERATIONS.PUBLISHING)
            }
            onClick={() => {
              if (dataStatus && dataStatus.selectedReferences && locales) {
                publishEntries();
              }
            }}
            isLoading={operationInProgress === OPERATIONS.PUBLISHING}
            icon={"PublishWhite"}
            buttonType="primary"
          >
            Publish
          </Button>
          &nbsp;
          <Button
            disabled={
              !(dataStatus && dataStatus.selectedReferences && Object.keys(dataStatus.selectedReferences).length > 0) ||
              (environments?.filter((e: IEnvironmentConfig) => e.checked) || []).length === 0 ||
              (locales?.filter((l: ILocaleConfig) => l.checked) || []).length === 0 ||
              (operationInProgress !== OPERATIONS.NONE && operationInProgress !== OPERATIONS.PUBLISHING)
            }
            onClick={() => {
              if (dataStatus && dataStatus.selectedReferences && locales) {
                publishEntriesAsRelease();
              }
            }}
            isLoading={operationInProgress === OPERATIONS.PUBLISHING}
            icon={"DeployOutline"}
            buttonType="primary"
          >
            Release
          </Button>
          <hr />
          <Checkbox
            onClick={() => {
              setDeployReleases((dr) => !dr);
            }}
            label={"Deploy Release"}
            checked={deployReleases}
            disabled={operationInProgress !== OPERATIONS.NONE}
            isButton={false}
            isLabelFullWidth={false}
          />
        </div>
      </>
      <LogDetails />
    </>
  );
}

export default ReferencesTable;
