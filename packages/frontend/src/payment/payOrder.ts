import { ApiError, extractErrorMessage } from "@/config/apiError";
import { env } from "@/config/env";
import type { Order } from "@/order/createOrder";

type PaymentMethod = "card" | "wallet";

type SimulatedOutcome = "approved" | "declined" | "gateway_error";

type PayOrderInput = {
  orderId: Order["id"];
  method: PaymentMethod;
  simulatedOutcome?: SimulatedOutcome;
  idempotencyKey: string;
};

type Payment = {
  id: number;
  order_id: number;
  amount: number;
  method: PaymentMethod;
  status: string;
};

const SIMULATOR_PROCESSING_DELAY_MS = 3000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function payOrder({
  orderId,
  method,
  simulatedOutcome,
  idempotencyKey,
}: PayOrderInput): Promise<Payment> {
  const path = `orders/${orderId}/payment`;
  const body: { method: PaymentMethod; simulated_outcome?: SimulatedOutcome } =
    { method };

  if (simulatedOutcome !== undefined) {
    body.simulated_outcome = simulatedOutcome;
  }

  const responsePromise = fetch(`${env.apiUrl}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  // The simulator panel resolves the machine step instantly, so without this
  // the "Processing payment…" phase would flash by too fast to see. A real
  // machine attempt already spent 5s waiting, so it skips the extra delay.
  const response =
    simulatedOutcome !== undefined
      ? (
          await Promise.all([
            responsePromise,
            wait(SIMULATOR_PROCESSING_DELAY_MS),
          ])
        )[0]
      : await responsePromise;

  if (!response.ok) {
    throw new ApiError(
      await extractErrorMessage(response, path),
      response.status,
    );
  }

  return response.json();
}

export type { Payment, PaymentMethod, PayOrderInput, SimulatedOutcome };
export { payOrder, SIMULATOR_PROCESSING_DELAY_MS };
