import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/order/cart/CartContext";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the app name, item count, and total", () => {
    render(
      <CartProvider>
        <Header onToggleCart={() => {}} />
      </CartProvider>,
    );

    expect(screen.getByText("MASHVINI")).toBeInTheDocument();
    expect(screen.getByText(/0 items/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
  });

  it("is fixed to the top of the viewport", () => {
    render(
      <CartProvider>
        <Header onToggleCart={() => {}} />
      </CartProvider>,
    );

    expect(screen.getByText("MASHVINI").closest("header")).toHaveClass(
      "fixed",
      "top-0",
    );
  });

  it("calls onToggleCart when the cart button is clicked", async () => {
    const onToggleCart = vi.fn();
    const user = userEvent.setup();
    render(
      <CartProvider>
        <Header onToggleCart={onToggleCart} />
      </CartProvider>,
    );

    await user.click(screen.getByLabelText("Toggle cart"));

    expect(onToggleCart).toHaveBeenCalledOnce();
  });
});
