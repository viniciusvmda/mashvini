import { Card, CardContent } from "@/ui/card";
import type { CatalogItem } from "../catalogItem";
import { formatPrice } from "../currency";
import { StockBadge } from "./StockBadge";

type CatalogCardProps = {
  item: CatalogItem;
};

function CatalogCard({ item }: CatalogCardProps) {
  const isInStock = item.stock > 0;

  return (
    <article aria-label={item.name}>
      <Card>
        <img
          alt={item.name}
          loading="lazy"
          className="aspect-square w-full object-contain"
          src={item.image_url}
        />
        <CardContent className="flex flex-col gap-1">
          <p className="text-base font-medium">{item.name}</p>
          {isInStock ? (
            <p className="text-lg font-semibold">{formatPrice(item.price)}</p>
          ) : (
            <StockBadge />
          )}
        </CardContent>
      </Card>
    </article>
  );
}

export { CatalogCard };
