import {
  Accordion,
  Button,
  Checkbox,
  InfiniteScrollTable,
  InstructionText,
  Tooltip,
} from "@contentstack/venus-components";
import { IReference, OPERATIONS } from "./models/models";
import {
  deployReleasesAtom,
  loadingReferencesAtom,
  localesAtom,
  operationInProgressAtom,
  reloadOnChangeLocalesAtom,
  uiReadyAtom,
} from "./store";

import LogDetails from "./log-details";
import React from "react";
import { useAtom } from "jotai";
import { useReferences } from "../../hooks/useReferences";

export const SAVE_MESSAGE: string = "You need to save the entry, and reload the extension to update the references.";
export const SAVED_MESSAGE: string = "Entry saved, you need to reload the extension to update the references.";

function ReferencesTable() {
  const [locales] = useAtom(localesAtom);
  const [deployReleases] = useAtom(deployReleasesAtom);
  const [operationInProgress] = useAtom(operationInProgressAtom);
  const [uiReady] = useAtom(uiReadyAtom);
  const [viewBy, updateViewBy] = React.useState("Comfortable");
  const [, setDeployReleases] = useAtom(deployReleasesAtom);
  const [reloadOnChangeLocales] = useAtom(reloadOnChangeLocalesAtom);
  const [loading] = useAtom(loadingReferencesAtom);

  const getSelectedRow = (singleSelectedRowIds: any) => {
    let selectedObj: any = {};
    singleSelectedRowIds.forEach((refUid: any) => {
      selectedObj[refUid] = true;
    });
    setDataStatusPartial({ selectedReferences: { ...selectedObj } });
  };

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
                <Tooltip content={data.entry?.title} position="top" showArrow={false}>
                  <strong>{data.entry?.title}</strong>
                </Tooltip>
              </div>
              {viewBy === "Comfortable" && <InstructionText style={{ textAlign: "left" }}>{data.uid}</InstructionText>}
            </div>
          );
        },
        default: true,
        columnWidthMultiplier: 1.75,
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
      {
        Header: "Depth",
        id: "depth",
        accessor: (data: IReference) => {
          return (
            <div className="title-container">
              <div className="content-title">
                <strong>{data.depth}</strong>
              </div>
            </div>
          );
        },
        columnWidthMultiplier: 0.75,
      },
    ];
  }, [viewBy]);
  const { dataStatus, setDataStatusPartial, publishEntries, publishEntriesAsRelease, publishDisabled } =
    useReferences();
  return (
    <div style={{ display: uiReady ? undefined : "none" }}>
      <Accordion title={"References"} renderExpanded className="bp-accordion">
        <div style={{ paddingLeft: 5 }}>
          <InfiniteScrollTable
            canRefresh={!reloadOnChangeLocales}
            loading={loading}
            initialSelectedRowIds={dataStatus.initiallySelected}
            disabled={operationInProgress !== OPERATIONS.NONE}
            canSearch={false}
            totalCounts={dataStatus.data.length}
            data={dataStatus.data}
            isLoading={operationInProgress !== OPERATIONS.NONE}
            fetchTableData={() => {
              // reload();
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
      <br />
      <Button
        disabled={publishDisabled}
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
        disabled={publishDisabled}
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
      <hr className="separator-bar" />
      <Checkbox
        onClick={() => {
          setDeployReleases((dr) => !dr);
        }}
        label={"Deploy Release"}
        checked={deployReleases}
        disabled={publishDisabled}
        isButton={false}
        isLabelFullWidth={false}
      />
      <LogDetails />
    </div>
  );
}

export default ReferencesTable;
