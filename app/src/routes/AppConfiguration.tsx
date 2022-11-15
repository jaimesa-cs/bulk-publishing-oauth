import { Button, FieldLabel, InstructionText } from "@contentstack/venus-components";
import { showError, showSuccess } from "../utils/notifications";

import CodeEditor from "@uiw/react-textarea-code-editor";
import { IBulkPublishingConfig } from "../components/bulk-publishing-sidebar/models/models";
import Icon from "../images/appconfig.svg";
import React from "react";
import { TypeAppSdkConfigState } from "../types";
import { useAppSdk } from "../hooks/useAppSdk";
import utils from "../utils";

const isValidJson = (json: any) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
};

const AppConfigurationExtension = () => {
  const [sdk] = useAppSdk();
  const [state, setState] = React.useState<TypeAppSdkConfigState & { bulkPublishingConfig: IBulkPublishingConfig }>({
    installationData: {
      configuration: {},
      serverConfiguration: {},
    },
    setInstallationData: (): any => {},
    appSdkInitialized: false,
    bulkPublishingConfig: {},
  });

  /** updateConfig - Function where you should update the state variable
   * Call this function whenever any field value is changed in the DOM
   * */
  const updateConfig = React.useCallback(() => {
    setLoading(true);
    const updatedConfig = state?.installationData?.configuration || {};
    delete updatedConfig.temp;
    updatedConfig.bulkPublishingConfig = state.bulkPublishingConfig;
    const updatedServerConfig = state.installationData.serverConfiguration;
    delete updatedServerConfig.temp;
    updatedServerConfig.bulkPublishingConfig = state.bulkPublishingConfig;

    if (typeof state.setInstallationData !== "undefined") {
      state
        .setInstallationData({
          ...state.installationData,
          configuration: updatedConfig,
          serverConfiguration: updatedServerConfig,
        })
        .then(() => {
          showSuccess("Configuration saved successfully");
          setLoading(false);
        })
        .catch((error: any) => {
          showError(error);
          setLoading(false);
        });
    }

    return true;
  }, [state]);

  React.useEffect(() => {
    const sdkConfigData = sdk?.location.AppConfigWidget?.installation;
    if (sdkConfigData) {
      sdkConfigData.getInstallationData().then((installationDataFromSDK) => {
        const setInstallationDataOfSDK = sdkConfigData.setInstallationData;

        setState(() => {
          setLoading(false);
          return {
            ...state,
            installationData: utils.mergeObjects(state.installationData, installationDataFromSDK),
            setInstallationData: setInstallationDataOfSDK,
            appSdkInitialized: true,
            bulkPublishingConfig: installationDataFromSDK.configuration.bulkPublishingConfig,
          };
        });
        // console.log(
        //   "🚀 ~ file: AppConfiguration.tsx ~ line 79 ~ setState ~ installationDataFromSDK.configuration.bulkPublishingConfig",
        //   installationDataFromSDK.configuration.bulkPublishingConfig
        // );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [isValid, setIsValid] = React.useState<boolean>(true);
  return (
    <div className="app-config">
      <div className="app-config-container">
        <div className="app-config-icon">
          <img src={Icon} alt="icon" />
        </div>
        <div className="app-component-content">
          <FieldLabel required htmlFor="advancedPublishingConfig" error={!isValid}>
            JSON Configuration
          </FieldLabel>

          {loading ? (
            <>Loading...</>
          ) : (
            <>
              {!isValid && <InstructionText style={{ color: "red" }}>Invalid JSON</InstructionText>}
              <div
                style={{
                  border: !isValid ? "1px solid red" : "",
                }}
              >
                <CodeEditor
                  key="advancedPublishingConfig"
                  value={state.appSdkInitialized ? JSON.stringify(state.bulkPublishingConfig, null, 2) : "Loading..."}
                  language="json"
                  placeholder="Please enter JSON content."
                  onChange={(e: any) => {
                    const valid = isValidJson(e.target.value);
                    setIsValid(valid);
                    if (valid) {
                      setState((s) => {
                        return { ...s, bulkPublishingConfig: JSON.parse(e.target.value) };
                      });
                    }
                  }}
                  padding={15}
                  style={{
                    fontSize: 12,
                    width: "100%",
                    backgroundColor: "#f5f5f5",
                    fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                />
              </div>
            </>
          )}
          <br />
          <Button
            isLoading={loading}
            buttonType="primary"
            disabled={!isValid}
            onClick={() => {
              updateConfig();
            }}
          >
            Update Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppConfigurationExtension;
