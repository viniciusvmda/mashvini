import { formatPrice } from "@/catalog/currency";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { useCart } from "./CartContext";
import { CartLine } from "./CartLine";
import { itemCount, total } from "./cartSelectors";

type CartPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CartPanel({ open, onOpenChange }: CartPanelProps) {
  const { state, dispatch } = useCart();
  const count = itemCount(state);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      disablePointerDismissal
    >
      <SheetContent
        aria-label="Cart"
        showOverlay={false}
        className="w-full sm:max-w-sm"
      >
        <SheetHeader>
          <SheetTitle className="text-lg">Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {state.lines.length === 0 ? (
            <p className="text-base text-muted-foreground">
              Your cart is empty
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {state.lines.map((line) => (
                <CartLine key={line.item.id} line={line} dispatch={dispatch} />
              ))}
            </ul>
          )}
        </div>
        <SheetFooter>
          <p aria-live="polite" className="text-base font-medium">
            {count} {count === 1 ? "item" : "items"} · Total:{" "}
            {formatPrice(total(state))}
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { CartPanel };
