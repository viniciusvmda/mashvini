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
    total: 1,
    data: [
      {
        id: 1,
        name: "Voss water",
        price: 9,
        stock: 5,
        image_url: "https://example.com/voss.png",
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

    await user.click(screen.getByLabelText("Toggle cart"));

    expect(screen.getByLabelText("Cart")).toBeInTheDocument();
  });

  it("shows the cart panel automatically once an item is added", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    await user.click(screen.getByText("Add"));

    expect(screen.getByLabelText("Cart")).toBeInTheDocument();
  });

  it("hides the header's item count while the cart panel is open", async () => {
    const user = userEvent.setup();
    const queryFn = vi.fn(() => Promise.resolve(buildPage()));
    renderWithClient(<OrderScreen />, { queryFn });
    await screen.findByText("Voss water");

    await user.click(screen.getByText("Add"));

    const header = screen
      .getByText("MASHVINI")
      .closest("header") as HTMLElement;
    expect(
      within(header).queryByText(/items? · Total/),
    ).not.toBeInTheDocument();
  });
});
