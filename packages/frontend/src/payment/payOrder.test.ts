import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { payOrder, SIMULATOR_PROCESSING_DELAY_MS } from "./payOrder";

describe("payOrder", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 1,
            order_id: 1,
            amount: 9,
            method: "card",
            status: "approved",
          }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the method and idempotency key header to the payment endpoint", async () => {
    await payOrder({
      orderId: 1,
      method: "card",
      idempotencyKey: "key-1",
    });

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/orders/1/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "key-1",
        },
        body: JSON.stringify({ method: "card" }),
      },
    );
  });

  it("includes the simulated outcome in the body when given", async () => {
    await payOrder({
      orderId: 1,
      method: "wallet",
      simulatedOutcome: "declined",
      idempotencyKey: "key-1",
    });

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/orders/1/payment`,
      expect.objectContaining({
        body: JSON.stringify({
          method: "wallet",
          simulated_outcome: "declined",
        }),
      }),
    );
  });

  it("resolves without an artificial delay when there is no simulated outcome", async () => {
    vi.useFakeTimers();

    const promise = payOrder({
      orderId: 1,
      method: "card",
      idempotencyKey: "key-1",
    });
    await vi.advanceTimersByTimeAsync(0);

    await expect(promise).resolves.toMatchObject({ status: "approved" });

    vi.useRealTimers();
  });

  it("waits for the simulator processing delay before resolving a simulated outcome", async () => {
    vi.useFakeTimers();

    const promise = payOrder({
      orderId: 1,
      method: "card",
      simulatedOutcome: "approved",
      idempotencyKey: "key-1",
    });

    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(SIMULATOR_PROCESSING_DELAY_MS - 1);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);

    vi.useRealTimers();
  });
});
