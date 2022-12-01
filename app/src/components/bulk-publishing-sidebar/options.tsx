import Environments from "./environments";
import Locales from "./locales";
import { useAtom } from "jotai";

function Options() {
  return (
    <>
      <Locales />
      <Environments />
    </>
  );
}
export default Options;
