import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";
import getBrowserFingerprint from "get-browser-fingerprint";

/**
 * EncryptionService
 */
const EncryptionService = class {
  secureKey: string = "";

  constructor() {
    const secureKey = getBrowserFingerprint().toString();
    this.secureKey = secureKey;
  }

  /**
   * Function to encrypt data
   * @param value
   * @returns
   */
  encrypt(value: string) {
    return AES.encrypt(value, this.secureKey).toString();
  }

  /**
   * Function to decrypt data
   * @param value
   * @returns
   */
  decrypt(value: string) {
    try {
      var bytes = AES.decrypt(value, this.secureKey);
      return bytes.toString(Utf8) || null;
    } catch (ex) {
      return null;
    }
  }
};

export default EncryptionService;
