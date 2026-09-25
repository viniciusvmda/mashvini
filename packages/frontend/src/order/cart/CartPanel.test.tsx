import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider, useCart } from "./CartContext";
import { CartPanel } from "./CartPanel";

const ITEM = {
  id: 1,
  name: "Voss water",
  price: 9,
  stock: 3,
  image_url: "https://example.com/voss.png",
};

function AddItemButton() {
  const { dispatch } = useCart();

  return (
    <button type="button" onClick={() => dispatch({ type: "add", item: ITEM })}>
      seed cart
    </button>
  );
}

function renderPanel() {
  return render(
    <CartProvider>
      <AddItemButton />
      <CartPanel open={true} onOpenChange={() => {}} />
    </CartProvider>,
  );
}

describe("CartPanel", () => {
  it("renders as a labeled panel with an empty-cart message", () => {
    renderPanel();

    expect(screen.getByLabelText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("lists a line with the item's thumbnail, name, price, and stepper", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByText("seed cart"));

    expect(screen.getByAltText("Voss water")).toBeInTheDocument();
    expect(screen.getByText("Voss water")).toBeInTheDocument();
    expect(screen.getByText("$9.00")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Increase quantity of Voss water"),
    ).toBeInTheDocument();
  });

  it("updates the quantity and total shown after using the stepper", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByText("seed cart"));

    await user.click(screen.getByLabelText("Increase quantity of Voss water"));

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("removes the line once the quantity is decreased to 0", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByText("seed cart"));

    await user.click(screen.getByLabelText("Decrease quantity of Voss water"));

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <CartProvider>
        <CartPanel open={false} onOpenChange={() => {}} />
      </CartProvider>,
    );

    expect(screen.queryByLabelText("Cart")).not.toBeInTheDocument();
  });
});
