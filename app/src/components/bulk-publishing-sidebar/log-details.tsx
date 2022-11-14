import { Accordion, Icon, Tooltip } from "@contentstack/venus-components";
import { logAtom, showLogAtom } from "./store";

import { ILog } from "./models/models";
import { useAtom } from "jotai";

export default function LogDetails() {
  const [showLog] = useAtom(showLogAtom);
  const [log, setLog] = useAtom(logAtom);
  return (
    <>
      {showLog && log && log.length > 0 && (
        <Accordion
          title={`Details ${log.some((l: ILog) => l.type === "error") ? "(Errors)" : "(Success)"}`}
          accordionDataCount={log.length}
          actions={[
            {
              _component: (
                <Tooltip content="Clear" position="top" showArrow={false}>
                  <Icon icon="Delete" />
                </Tooltip>
              ),
              get component() {
                return this._component;
              },
              set component(value) {
                this._component = value;
              },
              onClick: () => {
                setLog([]);
              },
              actionClassName: "font-color-tertiary",
            },
          ]}
        >
          <ol>
            {log.map((l: any, index: number) => {
              return (
                <li key={`log-icon-${index}`}>
                  <div className="icon-spacing" style={{ width: "100%" }}>
                    <Icon icon={l.type === "info" ? "Success" : "Error"} />

                    {` ${l.message}`}
                  </div>
                </li>
              );
            })}
          </ol>
        </Accordion>
      )}
    </>
  );
}
