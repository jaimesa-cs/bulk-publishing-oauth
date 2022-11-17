import { Accordion, Checkbox, Field, InstructionText, ToggleSwitch } from "@contentstack/venus-components";
import { ILocaleConfig, OPERATIONS } from "./models/models";
import {
  allLocalesCheckedAtom,
  localesAtom,
  operationInProgressAtom,
  reloadOnChangeLocalesAtom,
  toggleAllLocalesAtom,
  toggleLocaleAtom,
} from "./store";

import React from "react";
import { useAtom } from "jotai";
import { useOauthCsApi } from "./cs-oauth-api";
import useUserSelections from "../../hooks/useUserSelections";

function Locales() {
  const [, toggleLocale] = useAtom(toggleLocaleAtom);
  const [, toggleAllLocales] = useAtom(toggleAllLocalesAtom);
  const [locales, setLocales] = useAtom(localesAtom);
  const [operationInProgress] = useAtom(operationInProgressAtom);
  const [reloadOnChangeLocales, setReloadOnChangeLocales] = useAtom(reloadOnChangeLocalesAtom);
  const [allLocalesChecked, setAllLocalesChecked] = useAtom(allLocalesCheckedAtom);
  const { getLocales } = useOauthCsApi();
  const { selections } = useUserSelections();

  React.useEffect(() => {
    setReloadOnChangeLocales(selections?.reloadOnChangeLocales || false);
    getLocales()
      .then((response) => {
        const configuredLocales = response.data.locales.map((locale: ILocaleConfig) => {
          return {
            ...locale,
            checked: selections?.locales?.some((l: any) => l.code === locale.code && l.checked) || false,
          };
        });
        setLocales(configuredLocales);
      })
      .catch((error) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Accordion title={"Locales"} className="bp-accordion">
      <Field>
        <div key="locales" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
          <div key="locale_all" className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
            <ToggleSwitch
              onClick={() => {
                const checked = allLocalesChecked || locales?.every((l: any) => l.checked);
                toggleAllLocales(!checked);
                setAllLocalesChecked(!checked);
              }}
              label={"Select All"}
              checked={allLocalesChecked || locales?.every((l: any) => l.checked)}
              disabled={operationInProgress !== OPERATIONS.NONE}
            />
            <hr className="separator" />
            <ToggleSwitch
              onClick={() => {
                setReloadOnChangeLocales((r) => !r);
              }}
              label={"Auto Reload References"}
              checked={reloadOnChangeLocales}
              disabled={operationInProgress !== OPERATIONS.NONE}
            />
          </div>
          {locales &&
            locales.length > 0 &&
            locales.map((locale: ILocaleConfig, index: number) => {
              return (
                <div key={locale.code} className="Checkbox-wrapper" style={{ paddingLeft: 20 }}>
                  <Checkbox
                    onClick={() => {
                      toggleLocale(index);
                      setAllLocalesChecked(locales?.every((l: any) => l.checked));
                    }}
                    label={locale.name}
                    checked={locale.checked || false}
                    disabled={operationInProgress !== OPERATIONS.NONE}
                    isButton={false}
                    isLabelFullWidth={false}
                  />
                </div>
              );
            })}
        </div>
        <InstructionText>The selected references will be published in these locales.</InstructionText>
      </Field>
    </Accordion>
  );
}
export default Locales;
