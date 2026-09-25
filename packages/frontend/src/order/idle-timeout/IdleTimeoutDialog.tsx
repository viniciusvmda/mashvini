import { useNavigate } from "react-router";
import { useCart } from "@/order/cart/CartContext";
import { useCountdown } from "@/order/useCountdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { useIdleTimeout } from "./useIdleTimeout";

const IDLE_TIMEOUT_MS = 90_000;
const IDLE_DIALOG_COUNTDOWN_SECONDS = 10;

type IdleCountdownMessageProps = {
  onZero: () => void;
};

function IdleCountdownMessage({ onZero }: IdleCountdownMessageProps) {
  const { remaining } = useCountdown(IDLE_DIALOG_COUNTDOWN_SECONDS, onZero);

  return <>Returning to the start page in {remaining} seconds</>;
}

type IdleTimeoutDialogProps = {
  onTimeout?: () => void;
  enabled?: boolean;
};

function IdleTimeoutDialog({
  onTimeout,
  enabled = true,
}: IdleTimeoutDialogProps = {}) {
  const { isIdle, reset } = useIdleTimeout(IDLE_TIMEOUT_MS, enabled);
  const navigate = useNavigate();
  const { dispatch } = useCart();

  function handleTimeoutReached() {
    if (onTimeout) {
      onTimeout();
      return;
    }

    dispatch({ type: "clear" });
    navigate("/");
  }

  return (
    <AlertDialog
      open={isIdle}
      onOpenChange={(open) => {
        if (!open) {
          reset();
        }
      }}
    >
      <AlertDialogContent className="gap-5 p-6 data-[size=default]:max-w-md data-[size=default]:sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold">
            Still there?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {isIdle && <IdleCountdownMessage onZero={handleTimeoutReached} />}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            type="button"
            className="h-12 px-6 text-base"
            onClick={reset}
          >
            I'm still here
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { IdleTimeoutDialog };
