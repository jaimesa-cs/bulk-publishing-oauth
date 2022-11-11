import { Button } from "@contentstack/venus-components";
import { useAppConfig } from "../hooks/useAppConfig";
import { useOAuth2Token } from "../hooks/oauth/useOAuth2Token";

const AuthorizeButton = () => {
  const [config] = useAppConfig();
  const loadUserCode = useOAuth2Token(config?.bulkPublishingConfig?.oauth);
  return (
    <Button
      buttonType="secondary"
      onClick={() => {
        loadUserCode();
      }}
      icon="SCIMActiveSmall"
    >
      Authorize
    </Button>
  );
};

export default AuthorizeButton;
