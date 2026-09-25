import type { CatalogItem } from "@/catalog/catalogItem";
import { ApiError, extractErrorMessage } from "@/config/apiError";
import { env } from "@/config/env";

type OrderLineInput = {
  item_id: number;
  quantity: number;
};

type OrderLine = {
  item_id: CatalogItem["id"];
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  expires_at: string;
  total: number;
  lines: OrderLine[];
};

async function createOrder(lines: OrderLineInput[]): Promise<Order> {
  const path = "orders";
  const response = await fetch(`${env.apiUrl}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });

  if (!response.ok) {
    throw new ApiError(
      await extractErrorMessage(response, path),
      response.status,
    );
  }

  return response.json();
}

export type { Order, OrderLine, OrderLineInput };
export { createOrder };
