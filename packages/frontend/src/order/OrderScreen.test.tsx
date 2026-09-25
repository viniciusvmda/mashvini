import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogPage } from "@/catalog/catalogItem";
import { renderWithClient } from "@/test/renderWithClient";
import { OrderScreen } from "./OrderScreen";

function buildPage(): CatalogPage {
  return {
    page: 0,
    size: 12,
    total: 2,
    data: [
      {
        id: 1,
        name: "Voss water",
        price: 9,
        stock: 5,
        image_url: "https://example.com/voss.png",
      },
      {
        id: 2,
        name: "Sparkling water",
        price: 5,
        stock: 5,
        image_url: "https://example.com/sparkling.png",
      },
    ],
  };
}

describe("OrderScreen", () => {
  it("renders the header and the catalog grid with at least 2 columns", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });

    expect(screen.getByText("MASHVINI")).toBeInTheDocument();
    const item = await screen.findByText("Voss water");
    const grid = item.closest("article")?.parentElement;
    expect(grid).toHaveClass("grid-cols-2");
  });

  it("does not show the cart panel while the cart is empty and the toggle is closed", async () => {
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    expect(screen.queryByLabelText("Cart")).not.toBeInTheDocument();
  });

  it("shows the cart panel when the header toggle is clicked", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    await user.click(screen.getByRole("button", { name: /Cart/ }));

    expect(screen.getByLabelText("Cart")).toBeInTheDocument();
  });

  it("keeps the cart panel collapsed when an item is added", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    await user.click(screen.getAllByText("Add")[0]);

    expect(screen.queryByLabelText("Cart")).not.toBeInTheDocument();
  });

  it("hides the header's item count while the cart panel is open", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    await user.click(screen.getByRole("button", { name: /Cart/ }));

    const header = screen
      .getByText("MASHVINI")
      .closest("header") as HTMLElement;
    expect(
      within(header).queryByText(/items? · Total/),
    ).not.toBeInTheDocument();
  });

  it("keeps the footer's Finalize/Cancel actions above the cart panel when it is open", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    await user.click(screen.getAllByText("Add")[0]);
    await user.click(screen.getByRole("button", { name: /Cart/ }));

    const footer = screen
      .getByRole("button", { name: "Finalize order" })
      .closest("footer") as HTMLElement;
    const extractZIndex = (element: HTMLElement) =>
      Number(element.className.match(/\bz-\[?(\d+)\]?\b/)?.[1]);

    expect(extractZIndex(footer)).toBeGreaterThan(
      extractZIndex(screen.getByLabelText("Cart")),
    );
  });

  it("allows adding another item from the catalog while the cart panel is open", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");
    await screen.findByText("Sparkling water");

    await user.click(screen.getByRole("button", { name: /Cart/ }));
    const cart = screen.getByLabelText("Cart");
    await user.click(screen.getAllByText("Add")[0]);
    await user.click(screen.getAllByText("Add")[0]);

    expect(within(cart).getByText("Voss water")).toBeInTheDocument();
    expect(within(cart).getByText("Sparkling water")).toBeInTheDocument();
  });
});
