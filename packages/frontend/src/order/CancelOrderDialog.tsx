import { useNavigate } from "react-router";
import { useCart } from "@/order/cart/CartContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";

type CancelOrderDialogProps = {
  onConfirm?: () => void;
  disabled?: boolean;
};

function CancelOrderDialog({
  onConfirm,
  disabled = false,
}: CancelOrderDialogProps = {}) {
  const { dispatch } = useCart();
  const navigate = useNavigate();

  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
      return;
    }

    dispatch({ type: "clear" });
    navigate("/");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            className="h-12 px-6 text-base"
            disabled={disabled}
          />
        }
      >
        Cancel order
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-5 p-6 data-[size=default]:max-w-md data-[size=default]:sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold">
            Cancel this order?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            Your cart will be cleared and you will return to the start screen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-12 px-6 text-base">
            Keep shopping
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            className="h-12 px-6 text-base"
            onClick={handleConfirm}
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { CancelOrderDialog };
