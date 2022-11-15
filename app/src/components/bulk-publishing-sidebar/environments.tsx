import { Accordion, Checkbox, Field, InstructionText, ToggleSwitch } from "@contentstack/venus-components";
import { IEnvironmentConfig, OPERATIONS } from "./models/models";
import {
  allEnvironmentsCheckedAtom,
  environmentsAtom,
  operationInProgressAtom,
  toggleAllEnvironmentAtom,
  toggleEnvironmentAtom,
} from "./store";

import React from "react";
import { useAtom } from "jotai";
import { useOauthCsApi } from "./cs-oauth-api";
import useUserSelections from "../../hooks/useUserSelections";

function Environments() {
  const [, toggleEnvironment] = useAtom(toggleEnvironmentAtom);
  const [, toggleAllEnvironments] = useAtom(toggleAllEnvironmentAtom);
  const [environments, setEnvironments] = useAtom(environmentsAtom);

  const [operationInProgress] = useAtom(operationInProgressAtom);

  const [allEnvironmentsChecked, setAllEnvironmentsChecked] = useAtom(allEnvironmentsCheckedAtom);

  const { getEnvironments } = useOauthCsApi();
  const { selections } = useUserSelections();

  React.useEffect(() => {
    // console.log("useEffect Environments");
    getEnvironments()
      .then((response) => {
        const configuredEnvironments = response.data.environments.map((env: IEnvironmentConfig) => {
          return {
            ...env,
            checked: selections?.environments?.some((e: any) => e.name === env.name && e.checked) || false,
          };
        });
        setEnvironments(configuredEnvironments);
      })
      .catch((error) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Accordion title={"Environments"} className="bp-accordion">
      {" "}
      <Field>
        <div key="environments" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
          <div key="environment_all" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
            <ToggleSwitch
              onClick={() => {
                const checked = allEnvironmentsChecked || environments?.every((l: any) => l.checked);
                toggleAllEnvironments(!checked);
                setAllEnvironmentsChecked(!checked);
              }}
              label={"Select All"}
              checked={allEnvironmentsChecked || environments?.every((l: any) => l.checked)}
              disabled={operationInProgress !== OPERATIONS.NONE}
            />
          </div>

          {environments &&
            environments.length > 0 &&
            environments.map((env: IEnvironmentConfig, index: number) => {
              return (
                <div key={env.name} className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
                  <Checkbox
                    onClick={() => {
                      const checked = environments?.every((e: any) => e.checked);
                      toggleEnvironment(index);
                      setAllEnvironmentsChecked(checked);
                    }}
                    label={env.name}
                    checked={env.checked || false}
                    disabled={operationInProgress !== OPERATIONS.NONE}
                    isButton={false}
                    isLabelFullWidth={false}
                  />
                </div>
              );
            })}
        </div>
        <InstructionText>The selected references will be published to these environments.</InstructionText>
      </Field>
    </Accordion>
  );
}

export default Environments;
