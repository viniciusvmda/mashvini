import { useCart } from "./CartContext";
import { CartLine } from "./CartLine";

function CartPanel() {
  const { state, dispatch } = useCart();

  return (
    <aside
      aria-label="Cart"
      className="flex w-full max-w-xs shrink-0 flex-col gap-4 rounded-lg bg-card p-4 ring-1 ring-foreground/10"
    >
      <h2 className="font-heading text-lg font-semibold">Cart</h2>
      {state.lines.length === 0 ? (
        <p className="text-base text-muted-foreground">Your cart is empty</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {state.lines.map((line) => (
            <CartLine key={line.item.id} line={line} dispatch={dispatch} />
          ))}
        </ul>
      )}
    </aside>
  );
}

export { CartPanel };
