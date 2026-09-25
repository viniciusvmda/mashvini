import { formatPrice } from "@/catalog/currency";
import { useCart } from "@/order/cart/CartContext";
import type { Order } from "@/order/createOrder";

type OrderSummaryProps = {
  order: Order;
};

function OrderSummary({ order }: OrderSummaryProps) {
  const { state } = useCart();

  return (
    <div className="flex flex-col gap-4 rounded-md border border-foreground/10 p-4">
      <h2 className="font-heading text-xl font-semibold">Order summary</h2>
      <ul className="flex flex-col gap-2">
        {order.lines.map((line) => {
          const item = state.lines.find(
            (cartLine) => cartLine.item.id === line.item_id,
          )?.item;
          const name = item?.name ?? `Item #${line.item_id}`;

          return (
            <li
              key={line.item_id}
              className="flex items-center justify-between gap-4 text-base"
            >
              <span>
                {name} × {line.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(line.price * line.quantity)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-foreground/10 pt-4 text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}

export { OrderSummary };
