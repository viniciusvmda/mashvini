import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "./queryClient";

describe("queryClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: "ok" }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the url from string path segments", async () => {
    const queryClient = createQueryClient();

    await queryClient.query({ queryKey: ["health"], retry: false });

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/health`,
    );
  });

  it("builds query string params from a trailing object segment and pageParam", async () => {
    const queryClient = createQueryClient();

    await queryClient.infiniteQuery({
      queryKey: ["items", { size: 12 }],
      initialPageParam: 1,
      getNextPageParam: () => undefined,
      retry: false,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/items?size=12&page=1`,
    );
  });

  it("throws the detail field from the error response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Failed to retrieve items" }),
      }),
    );
    const queryClient = createQueryClient();

    await expect(
      queryClient.query({ queryKey: ["items"], retry: false }),
    ).rejects.toThrow("Failed to retrieve items");
  });

  it("falls back to a generic message when there is no detail field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("invalid json")),
      }),
    );
    const queryClient = createQueryClient();

    await expect(
      queryClient.query({ queryKey: ["items"], retry: false }),
    ).rejects.toThrow("Request to items failed with status 500");
  });
});
