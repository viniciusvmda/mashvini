import { CancelOrderDialog } from "@/order/CancelOrderDialog";
import { useCart } from "@/order/cart/CartContext";
import { itemCount } from "@/order/cart/cartSelectors";
import { useFinalizeOrder } from "@/order/useFinalizeOrder";
import { Button } from "@/ui/button";

type FooterProps = {
  isCartOpen: boolean;
  onOpenCart: () => void;
};

function Footer({ isCartOpen, onOpenCart }: FooterProps) {
  const { state } = useCart();
  const { finalize, isPending } = useFinalizeOrder();

  if (itemCount(state) === 0) {
    return null;
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-end gap-3 bg-background px-4 py-3 ring-1 ring-foreground/10">
      <CancelOrderDialog />
      {isCartOpen ? (
        <Button
          type="button"
          className="h-12 w-48 px-6 text-base"
          onClick={finalize}
          disabled={isPending}
        >
          Finalize order
        </Button>
      ) : (
        <Button
          type="button"
          className="h-12 w-48 px-6 text-base"
          onClick={onOpenCart}
        >
          Review order
        </Button>
      )}
    </footer>
  );
}

export { Footer };
