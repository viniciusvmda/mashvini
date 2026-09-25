import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/order/cart/CartContext";
import type { CatalogItem } from "../catalogItem";
import { CatalogCard } from "./CatalogCard";

function buildItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: 1,
    name: "Voss water",
    price: 9,
    stock: 12,
    image_url: "https://example.com/voss-water.png",
    ...overrides,
  };
}

function renderCard(ui: ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe("CatalogCard", () => {
  it("renders the name, formatted price, and image alt text for an in-stock item", () => {
    renderCard(<CatalogCard item={buildItem()} />);

    expect(screen.getByText("Voss water")).toBeInTheDocument();
    expect(screen.getByText("$9.00")).toBeInTheDocument();
    expect(screen.getByAltText("Voss water")).toBeInTheDocument();
  });

  it("renders the stock badge and no price or add button for an out-of-stock item", () => {
    renderCard(<CatalogCard item={buildItem({ name: "Halls", stock: 0 })} />);

    expect(screen.getByText("Not available in stock")).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Add")).not.toBeInTheDocument();
  });

  it("swaps the Add button for a quantity stepper once the item is added", async () => {
    const user = userEvent.setup();
    renderCard(<CatalogCard item={buildItem()} />);

    await user.click(screen.getByText("Add"));

    expect(screen.queryByText("Add")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Increase quantity of Voss water"),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("removes the item from the cart when the stepper reaches 0", async () => {
    const user = userEvent.setup();
    renderCard(<CatalogCard item={buildItem()} />);

    await user.click(screen.getByText("Add"));
    await user.click(screen.getByLabelText("Decrease quantity of Voss water"));

    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("disables the increase button once the stock limit is reached", async () => {
    const user = userEvent.setup();
    renderCard(<CatalogCard item={buildItem({ stock: 1 })} />);

    await user.click(screen.getByText("Add"));

    expect(
      screen.getByLabelText("Increase quantity of Voss water"),
    ).toBeDisabled();
  });
});
