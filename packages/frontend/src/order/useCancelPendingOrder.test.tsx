import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { useCart } from "@/order/cart/CartContext";
import { renderWithClient } from "@/test/renderWithClient";
import { useCancelPendingOrder } from "./useCancelPendingOrder";

function CancelPendingOrderProbe() {
  const { state, dispatch } = useCart();
  const { cancel } = useCancelPendingOrder();

  return (
    <div>
      <p>Cart lines: {state.lines.length}</p>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "add",
            item: {
              id: 1,
              name: "Voss water",
              price: 9,
              stock: 5,
              image_url: "",
            },
          })
        }
      >
        Add to cart
      </button>
      <button type="button" onClick={() => cancel(1)}>
        Cancel
      </button>
    </div>
  );
}

function renderProbe(mutationFn: () => Promise<unknown>) {
  return renderWithClient(
    <Routes>
      <Route path="/payment" element={<CancelPendingOrderProbe />} />
      <Route path="/" element={<p>Idle screen</p>} />
    </Routes>,
    {
      queryFn: () => Promise.resolve({}),
      mutationKey: ["orders", "cancel"],
      mutationFn,
      initialEntries: ["/payment"],
    },
  );
}

describe("useCancelPendingOrder", () => {
  it("clears the cart and navigates to the idle screen once the cancel request resolves", async () => {
    const mutationFn = vi
      .fn()
      .mockResolvedValue({ id: 1, status: "cancelled" });
    const user = userEvent.setup();
    renderProbe(mutationFn);

    await user.click(screen.getByText("Add to cart"));
    expect(screen.getByText("Cart lines: 1")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));

    expect(mutationFn).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ mutationKey: ["orders", "cancel"] }),
    );
    expect(await screen.findByText("Idle screen")).toBeInTheDocument();
  });

  it("still clears the cart and navigates when the cancel request fails", async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderProbe(mutationFn);

    await user.click(screen.getByText("Add to cart"));
    await user.click(screen.getByText("Cancel"));

    expect(await screen.findByText("Idle screen")).toBeInTheDocument();
  });
});
