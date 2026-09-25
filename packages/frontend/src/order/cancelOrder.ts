import { ApiError, extractErrorMessage } from "@/config/apiError";
import { env } from "@/config/env";
import type { Order } from "@/order/createOrder";

async function cancelOrder(orderId: Order["id"]): Promise<Order> {
  const path = `orders/${orderId}/cancel`;
  const response = await fetch(`${env.apiUrl}/${path}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new ApiError(
      await extractErrorMessage(response, path),
      response.status,
    );
  }

  return response.json();
}

export { cancelOrder };
