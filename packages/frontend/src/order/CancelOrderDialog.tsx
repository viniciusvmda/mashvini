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
            variant="outline"
            className="h-12 px-6 text-base"
            disabled={disabled}
          />
        }
      >
        Cancel order
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            Your cart will be cleared and you will return to the start screen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep shopping</AlertDialogCancel>
          <AlertDialogAction type="button" onClick={handleConfirm}>
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { CancelOrderDialog };
