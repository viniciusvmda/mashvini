import { useCart } from "@/order/cart/CartContext";
import { QuantityStepper } from "@/order/QuantityStepper";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import type { CatalogItem } from "../catalogItem";
import { formatPrice } from "../currency";
import { StockBadge } from "./StockBadge";

type CatalogCardProps = {
  item: CatalogItem;
};

function CatalogCard({ item }: CatalogCardProps) {
  const { state, dispatch } = useCart();
  const isInStock = item.stock > 0;
  const line = state.lines.find((cartLine) => cartLine.item.id === item.id);

  return (
    <article aria-label={item.name}>
      <Card>
        <img
          alt={item.name}
          loading="lazy"
          className="aspect-square w-full object-contain"
          src={item.image_url}
        />
        <CardContent className="flex flex-col gap-2">
          <p className="text-base font-medium">{item.name}</p>
          {isInStock ? (
            <p className="text-lg font-semibold">{formatPrice(item.price)}</p>
          ) : (
            <StockBadge />
          )}
          {isInStock &&
            (line ? (
              <QuantityStepper
                itemName={item.name}
                quantity={line.quantity}
                max={item.stock}
                onIncrement={() =>
                  dispatch({
                    type: "setQuantity",
                    itemId: item.id,
                    quantity: line.quantity + 1,
                  })
                }
                onDecrement={() =>
                  dispatch({
                    type: "setQuantity",
                    itemId: item.id,
                    quantity: line.quantity - 1,
                  })
                }
              />
            ) : (
              <Button
                type="button"
                onClick={() => dispatch({ type: "add", item })}
              >
                Add
              </Button>
            ))}
        </CardContent>
      </Card>
    </article>
  );
}

export { CatalogCard };
