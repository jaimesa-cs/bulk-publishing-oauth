import { Button } from "@contentstack/venus-components";
import ProgressBar from "@ramonak/react-progress-bar";
import { progressAtom } from "./store";
import { useAtom } from "jotai";

const LoadingButton = ({ progressBar }: { progressBar?: boolean }) => {
  const [progress] = useAtom(progressAtom);
  return progressBar ? (
    <ProgressBar completed={progress.percentage} customLabel={progress.label} animateOnRender bgColor="#6c5ce7" />
  ) : (
    <Button isLoading>...</Button>
  );
};

export default LoadingButton;
