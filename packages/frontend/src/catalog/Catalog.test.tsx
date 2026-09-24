import { screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { triggerIntersection } from "@/test/setup";
import { Catalog } from "./Catalog";
import type { CatalogPage } from "./catalogItem";

function buildPage(
  page: number,
  total: number,
  itemCount: number,
): CatalogPage {
  return {
    page,
    size: 12,
    total,
    data: Array.from({ length: itemCount }, (_, index) => {
      const id = page * 12 + index + 1;
      return {
        id,
        name: `Item ${id}`,
        price: 1,
        stock: id === 2 ? 0 : 5,
        image_url: `https://example.com/${id}.png`,
      };
    }),
  };
}

describe("Catalog", () => {
  it("renders the skeleton while the first page is pending", () => {
    renderWithClient(<Catalog />, {
      queryFn: () => new Promise(() => {}),
    });

    expect(
      screen.getByRole("status", { name: "Loading catalog" }),
    ).toBeInTheDocument();
  });

  it("renders in-stock and out-of-stock items from the first page", async () => {
    renderWithClient(<Catalog />, {
      queryFn: () => Promise.resolve(buildPage(0, 12, 12)),
    });

    expect(await screen.findByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Not available in stock")).toBeInTheDocument();
  });

  it("fetches and renders the next page when the sentinel intersects", async () => {
    const queryFn = vi.fn(({ pageParam }) =>
      Promise.resolve(buildPage(pageParam as number, 24, 12)),
    );

    renderWithClient(<Catalog />, { queryFn });

    await screen.findByText("Item 1");

    act(() => {
      triggerIntersection(true);
    });

    expect(await screen.findByText("Item 13")).toBeInTheDocument();
    expect(queryFn).toHaveBeenCalledWith(
      expect.objectContaining({ pageParam: 1 }),
    );
  });

  it("makes no further request once the last page has been reached", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage(0, 12, 12)));

    renderWithClient(<Catalog />, { queryFn });

    await screen.findByText("Item 1");
    const callCountAfterFirstLoad = queryFn.mock.calls.length;

    act(() => {
      triggerIntersection(true);
    });

    await waitFor(() => {
      expect(queryFn.mock.calls.length).toBe(callCountAfterFirstLoad);
    });
  });

  it("shows an error toast with the rejection message", async () => {
    renderWithClient(<Catalog />, {
      queryFn: () => Promise.reject(new Error("Catalog unavailable")),
    });

    expect(await screen.findByText("Catalog unavailable")).toBeInTheDocument();
  });
});
