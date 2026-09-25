import type { MutationFunction, QueryFunction } from "@tanstack/react-query";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Catalog } from "@/catalog/Catalog";
import type { CatalogPage } from "@/catalog/catalogItem";
import { ApiError } from "@/config/apiError";
import { renderWithClient } from "@/test/renderWithClient";
import { Footer } from "./Footer";

function FooterHarness() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Footer isCartOpen={isCartOpen} onOpenCart={() => setIsCartOpen(true)} />
  );
}

function buildPage(stockByItemId: Record<number, number>): CatalogPage {
  return {
    page: 0,
    size: 12,
    total: 2,
    data: [
      {
        id: 1,
        name: "Voss water",
        price: 9,
        stock: stockByItemId[1],
        image_url: "https://example.com/voss.png",
      },
      {
        id: 2,
        name: "Halls",
        price: 3,
        stock: stockByItemId[2],
        image_url: "https://example.com/halls.png",
      },
    ],
  };
}

function renderOrderView(opts: {
  queryFn: QueryFunction;
  mutationFn?: MutationFunction;
}) {
  return renderWithClient(
    <Routes>
      <Route
        path="/catalog"
        element={
          <>
            <Catalog />
            <FooterHarness />
          </>
        }
      />
      <Route path="/payment" element={<p>Payment screen</p>} />
    </Routes>,
    {
      queryFn: opts.queryFn,
      mutationKey: ["orders", "create"],
      mutationFn: opts.mutationFn,
      initialEntries: ["/catalog"],
    },
  );
}

async function addItemToCart(name: string) {
  const user = userEvent.setup();
  const card = screen.getByText(name).closest("article") as HTMLElement;
  await user.click(within(card).getByText("Add"));
}

async function openCartFromFooter() {
  const user = userEvent.setup();
  await user.click(await screen.findByText("Review order"));
}

describe("Footer", () => {
  it("is hidden when the cart is empty", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage({ 1: 5, 2: 5 })));
    renderOrderView({ queryFn });

    await screen.findByText("Voss water");

    expect(screen.queryByText("Review order")).not.toBeInTheDocument();
    expect(screen.queryByText("Finalize order")).not.toBeInTheDocument();
  });

  it("shows Review order once an item is added while the cart is closed, and stays fixed to the bottom", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage({ 1: 5, 2: 5 })));
    renderOrderView({ queryFn });
    await screen.findByText("Voss water");

    await addItemToCart("Voss water");

    const reviewButton = await screen.findByText("Review order");
    expect(reviewButton.closest("footer")).toHaveClass("fixed", "bottom-0");
  });

  it("switches from Review order to Finalize order once the cart is opened", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage({ 1: 5, 2: 5 })));
    renderOrderView({ queryFn });
    await screen.findByText("Voss water");
    await addItemToCart("Voss water");

    await openCartFromFooter();

    expect(screen.queryByText("Review order")).not.toBeInTheDocument();
    expect(screen.getByText("Finalize order")).toBeInTheDocument();
  });

  it("gives Review order and Finalize order the same width", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage({ 1: 5, 2: 5 })));
    renderOrderView({ queryFn });
    await screen.findByText("Voss water");
    await addItemToCart("Voss water");

    const extractWidthClass = (element: HTMLElement) =>
      element.className.match(/\bw-\S+/)?.[0];
    const reviewWidthClass = extractWidthClass(
      screen.getByText("Review order"),
    );

    await openCartFromFooter();

    const finalizeWidthClass = extractWidthClass(
      screen.getByText("Finalize order"),
    );
    expect(finalizeWidthClass).toBe(reviewWidthClass);
    expect(finalizeWidthClass).toBeDefined();
  });

  it("navigates to the payment screen and keeps the cart on a successful finalize", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage({ 1: 5, 2: 5 })));
    const mutationFn = vi.fn().mockResolvedValue({
      id: 1,
      created_at: "2026-09-24T00:00:00Z",
      status: "pending",
      expires_at: "2026-09-24T00:05:00Z",
      total: 9,
      lines: [{ item_id: 1, quantity: 1, price: 9 }],
    });
    renderOrderView({ queryFn, mutationFn });
    await screen.findByText("Voss water");
    await addItemToCart("Voss water");
    await openCartFromFooter();

    await user.click(await screen.findByText("Finalize order"));

    expect(await screen.findByText("Payment screen")).toBeInTheDocument();
  });

  it("toasts, refreshes stock, and preserves the rest of the cart on a 409 conflict", async () => {
    const user = userEvent.setup();
    const queryFn = vi
      .fn()
      .mockResolvedValueOnce(buildPage({ 1: 5, 2: 5 }))
      .mockResolvedValue(buildPage({ 1: 5, 2: 0 }));
    const mutationFn = vi
      .fn()
      .mockRejectedValue(new ApiError("Halls is sold out", 409));
    renderOrderView({ queryFn, mutationFn });
    await screen.findByText("Voss water");
    await addItemToCart("Voss water");
    await addItemToCart("Halls");
    await openCartFromFooter();

    await user.click(await screen.findByText("Finalize order"));

    expect(await screen.findByText("Halls is sold out")).toBeInTheDocument();
    expect(
      await screen.findByText("Not available in stock"),
    ).toBeInTheDocument();
    expect(screen.getByText("Finalize order")).toBeInTheDocument();
  });

  it("toasts a generic error and preserves the cart on other failures", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage({ 1: 5, 2: 5 })));
    const mutationFn = vi.fn().mockRejectedValue(new Error("Network error"));
    renderOrderView({ queryFn, mutationFn });
    await screen.findByText("Voss water");
    await addItemToCart("Voss water");
    await openCartFromFooter();

    await user.click(await screen.findByText("Finalize order"));

    expect(
      await screen.findByText("Could not send your order, please try again"),
    ).toBeInTheDocument();
    expect(screen.getByText("Finalize order")).toBeInTheDocument();
  });
});
