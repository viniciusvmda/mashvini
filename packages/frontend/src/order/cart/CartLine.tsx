import type { Dispatch } from "react";
import { StockBadge } from "@/catalog/catalog-item/StockBadge";
import { formatPrice } from "@/catalog/currency";
import { QuantityStepper } from "@/order/QuantityStepper";
import type { CartAction, CartLine as CartLineData } from "./cartReducer";

type CartLineProps = {
  line: CartLineData;
  dispatch: Dispatch<CartAction>;
};

function CartLine({ line, dispatch }: CartLineProps) {
  const { item, quantity } = line;
  const isInStock = item.stock > 0;

  return (
    <li className="flex items-center gap-3">
      <img
        alt={item.name}
        src={item.image_url}
        className="size-12 shrink-0 rounded object-contain"
      />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-base font-medium">{item.name}</p>
        {isInStock ? (
          <p className="text-lg font-semibold">{formatPrice(item.price)}</p>
        ) : (
          <StockBadge />
        )}
      </div>
      {isInStock && (
        <QuantityStepper
          itemName={item.name}
          quantity={quantity}
          max={item.stock}
          onIncrement={() =>
            dispatch({
              type: "setQuantity",
              itemId: item.id,
              quantity: quantity + 1,
            })
          }
          onDecrement={() =>
            dispatch({
              type: "setQuantity",
              itemId: item.id,
              quantity: quantity - 1,
            })
          }
        />
      )}
    </li>
  );
}

export { CartLine };
