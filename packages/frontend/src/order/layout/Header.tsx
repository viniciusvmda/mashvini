import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/catalog/currency";
import { useCart } from "@/order/cart/CartContext";
import { itemCount, total } from "@/order/cart/cartSelectors";
import { Button } from "@/ui/button";

type HeaderProps = {
  isCartOpen: boolean;
  onToggleCart: () => void;
};

function Header({ isCartOpen, onToggleCart }: HeaderProps) {
  const { state } = useCart();
  const count = itemCount(state);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 bg-background px-4 py-3 ring-1 ring-foreground/10">
      <p className="font-heading text-xl font-semibold">MASHVINI</p>
      <div className="flex items-center gap-4">
        {!isCartOpen && (
          <p aria-live="polite" className="text-base font-medium">
            {count} {count === 1 ? "item" : "items"} · Total:{" "}
            {formatPrice(total(state))}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 px-4 text-base"
          onClick={onToggleCart}
        >
          <ShoppingCart className="size-5" />
          {isCartOpen ? "Close Cart" : "Open Cart"}
        </Button>
      </div>
    </header>
  );
}

export { Header };
