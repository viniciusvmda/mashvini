import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOrder } from "./createOrder";

describe("createOrder", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            id: 1,
            created_at: "2026-09-24T00:00:00Z",
            status: "pending",
            expires_at: "2026-09-24T00:05:00Z",
            total: 18,
            lines: [{ item_id: 1, quantity: 2, price: 9 }],
          }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the lines to the orders endpoint and returns the created order", async () => {
    const order = await createOrder([{ item_id: 1, quantity: 2 }]);

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: [{ item_id: 1, quantity: 2 }] }),
      },
    );
    expect(order).toEqual({
      id: 1,
      created_at: "2026-09-24T00:00:00Z",
      status: "pending",
      expires_at: "2026-09-24T00:05:00Z",
      total: 18,
      lines: [{ item_id: 1, quantity: 2, price: 9 }],
    });
  });

  it("throws an ApiError with the response status and detail message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ detail: "Item Halls is not available" }),
      }),
    );

    await expect(
      createOrder([{ item_id: 1, quantity: 2 }]),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "Item Halls is not available",
    });
  });

  it("falls back to a generic message when the error body has no detail field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("invalid json")),
      }),
    );

    await expect(createOrder([{ item_id: 1, quantity: 2 }])).rejects.toThrow(
      "Request to orders failed with status 500",
    );
  });
});
