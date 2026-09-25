import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect } from "react";
import { Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CatalogItem } from "@/catalog/catalogItem";
import { ApiError } from "@/config/apiError";
import { useCart } from "@/order/cart/CartContext";
import type { Order } from "@/order/createOrder";
import { renderWithClient } from "@/test/renderWithClient";
import { PaymentScreen } from "./PaymentScreen";

const ORDER: Order = {
  id: 1,
  created_at: "2026-09-24T00:00:00Z",
  status: "pending",
  expires_at: "2026-09-24T00:05:00Z",
  total: 18,
  lines: [{ item_id: 1, quantity: 2, price: 9 }],
};

const CART_ITEM: CatalogItem = {
  id: 1,
  name: "Voss water",
  price: 9,
  stock: 5,
  image_url: "https://example.com/voss.png",
};

function PopulateCart({ children }: { children: ReactNode }) {
  const { dispatch } = useCart();

  useEffect(() => {
    dispatch({ type: "add", item: CART_ITEM });
  }, [dispatch]);

  return <>{children}</>;
}

function renderPaymentScreen(opts: {
  skipOrder?: boolean;
  paymentFn?: (variables: unknown) => Promise<unknown>;
  cancelFn?: (orderId: unknown) => Promise<unknown>;
}) {
  const order = opts.skipOrder ? undefined : ORDER;

  return renderWithClient(
    <Routes>
      <Route
        path="/payment"
        element={
          <PopulateCart>
            <PaymentScreen />
          </PopulateCart>
        }
      />
      <Route path="/catalog" element={<p>Catalog screen</p>} />
      <Route path="/success" element={<p>Success screen</p>} />
      <Route path="/" element={<p>Idle screen</p>} />
    </Routes>,
    {
      queryFn: () => Promise.resolve({}),
      initialEntries: [
        { pathname: "/payment", state: order ? { order } : undefined },
      ],
      mutations: [
        {
          key: ["orders", "payment"],
          fn: opts.paymentFn ?? vi.fn().mockResolvedValue({}),
        },
        {
          key: ["orders", "cancel"],
          fn: opts.cancelFn ?? vi.fn().mockResolvedValue({}),
        },
      ],
    },
  );
}

function chooseCardViaClick() {
  fireEvent.click(screen.getByRole("button", { name: "Pay with card" }));
}

async function chooseCard(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Pay with card" }));
}

function orderSummaryTotal() {
  const heading = screen.getByText("Order summary");
  const container = heading.closest("div") as HTMLElement;
  return within(container).getByText("Total").parentElement as HTMLElement;
}

describe("PaymentScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("shows the order summary from router state with the cart intact", async () => {
    renderPaymentScreen({});

    expect(await screen.findByText("Voss water × 2")).toBeInTheDocument();
    expect(within(orderSummaryTotal()).getByText("$18.00")).toBeInTheDocument();
    expect(screen.getByText("Select the payment method")).toBeInTheDocument();
  });

  it("redirects to the catalog when there is no order in router state", async () => {
    renderPaymentScreen({ skipOrder: true });

    expect(await screen.findByText("Catalog screen")).toBeInTheDocument();
  });

  it("approves automatically after 5 seconds with no method chosen manually", async () => {
    vi.useFakeTimers();
    const paymentFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ paymentFn });

    act(() => {
      chooseCardViaClick();
    });
    expect(
      screen.getAllByText("Finish the payment on the payment machine"),
    ).not.toHaveLength(0);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(paymentFn).toHaveBeenCalledTimes(1);
    expect(paymentFn.mock.calls[0][0]).toMatchObject({
      method: "card",
      simulatedOutcome: undefined,
    });
  });

  it("starts a single payment when the approve button is double tapped", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);

    const approveButton = screen.getByRole("button", {
      name: "Simulate an approved payment",
    });
    await act(async () => {
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);
    });

    expect(paymentFn).toHaveBeenCalledTimes(1);
  });

  it("hides the simulator panel when the env var is off", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "false");
    renderPaymentScreen({});
    const user = userEvent.setup();
    await chooseCard(user);

    expect(screen.queryByText("SIMULATOR")).not.toBeInTheDocument();
  });

  it("sends the simulated outcome immediately without waiting 5 seconds", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);

    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );

    expect(paymentFn.mock.calls[0][0]).toMatchObject({
      simulatedOutcome: "declined",
    });
  });

  it("clears the cart and goes to the success screen on approval", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);

    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    expect(await screen.findByText("Success screen")).toBeInTheDocument();
  });

  it("toasts and returns to method choice on a decline, keeping the cart and renewing the key", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValue(new ApiError("Payment declined", 402));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );

    expect(
      await screen.findByText(
        "Payment declined, please choose a payment method again",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pay with card" }),
    ).toBeInTheDocument();

    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );

    const firstKey = paymentFn.mock.calls[0][0].idempotencyKey;
    const secondKey = paymentFn.mock.calls[1][0].idempotencyKey;
    expect(secondKey).not.toBe(firstKey);
  });

  it("toasts and returns to method choice on a gateway error", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValue(new ApiError("Gateway error", 502));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a gateway error" }),
    );

    expect(
      await screen.findByText(
        "We couldn't reach the payment provider, please try again",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pay with card" }),
    ).toBeInTheDocument();
  });

  it("toasts and returns to the catalog with the cart intact when the order expired", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValue(new ApiError("Your order expired", 409));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    expect(
      await screen.findByText("Your order expired, please finalize it again"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Catalog screen")).toBeInTheDocument();
  });

  it("offers a Try again action reusing the same key on a network error", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({});
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    const tryAgainButton = await screen.findByText("Try again");
    fireEvent.click(tryAgainButton);

    expect(await screen.findByText("Success screen")).toBeInTheDocument();
    const firstKey = paymentFn.mock.calls[0][0].idempotencyKey;
    const secondKey = paymentFn.mock.calls[1][0].idempotencyKey;
    expect(secondKey).toBe(firstKey);
  });

  it("shows the support dialog after three consecutive declined payments", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValue(new ApiError("Payment declined", 402));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();

    for (let attempt = 0; attempt < 3; attempt++) {
      await chooseCard(user);
      await user.click(
        screen.getByRole("button", { name: "Simulate a declined payment" }),
      );
    }

    expect(await screen.findByText("Need help paying?")).toBeInTheDocument();
    expect(screen.getByText(/9999-999-9999/)).toBeInTheDocument();
  });

  it("does not show the support dialog after only two consecutive failures", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValue(new ApiError("Payment declined", 402));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();

    for (let attempt = 0; attempt < 2; attempt++) {
      await chooseCard(user);
      await user.click(
        screen.getByRole("button", { name: "Simulate a declined payment" }),
      );
    }

    expect(screen.queryByText("Need help paying?")).not.toBeInTheDocument();
  });

  it("resets the failure count after a successful payment", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockResolvedValueOnce({});
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();

    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    expect(await screen.findByText("Success screen")).toBeInTheDocument();
  });

  it("does not count an expired order toward the support dialog threshold", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockRejectedValueOnce(new ApiError("Your order expired", 409));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();

    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    expect(await screen.findByText("Catalog screen")).toBeInTheDocument();
    expect(screen.queryByText("Need help paying?")).not.toBeInTheDocument();
  });

  it("shows the support dialog after three consecutive generic network failures", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();
    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    await waitFor(() => expect(paymentFn).toHaveBeenCalledTimes(1));

    for (let call = 2; call <= 3; call++) {
      const tryAgainButtons = await screen.findAllByText("Try again");
      fireEvent.click(tryAgainButtons[0]);
      await waitFor(() => expect(paymentFn).toHaveBeenCalledTimes(call));
    }

    expect(await screen.findByText("Need help paying?")).toBeInTheDocument();
  });

  it("closes the support dialog and allows further attempts", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const paymentFn = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockRejectedValueOnce(new ApiError("Payment declined", 402))
      .mockResolvedValueOnce({});
    renderPaymentScreen({ paymentFn });
    const user = userEvent.setup();

    for (let attempt = 0; attempt < 3; attempt++) {
      await chooseCard(user);
      await user.click(
        screen.getByRole("button", { name: "Simulate a declined payment" }),
      );
    }

    await user.click(await screen.findByRole("button", { name: "Close" }));
    expect(screen.queryByText("Need help paying?")).not.toBeInTheDocument();

    await chooseCard(user);
    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    expect(await screen.findByText("Success screen")).toBeInTheDocument();
  });

  it("cancels the pending order when Back to cart is clicked", async () => {
    const cancelFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ cancelFn });
    await screen.findByText("Select the payment method");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Back to cart" }));

    expect(cancelFn).toHaveBeenCalledWith(1, expect.anything());
    expect(await screen.findByText("Catalog screen")).toBeInTheDocument();
  });

  it("does not send a payment when Back to cart is used during the machine step", async () => {
    const paymentFn = vi.fn().mockResolvedValue({});
    const cancelFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ paymentFn, cancelFn });
    const user = userEvent.setup();
    await chooseCard(user);

    await user.click(screen.getByRole("button", { name: "Back to cart" }));

    expect(paymentFn).not.toHaveBeenCalled();
    expect(cancelFn).toHaveBeenCalled();
  });

  it("keeps the order pending when the cancel confirmation dialog is dismissed", async () => {
    const cancelFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ cancelFn });
    await screen.findByText("Select the payment method");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Cancel order" }));
    await user.click(screen.getByRole("button", { name: "Keep shopping" }));

    expect(cancelFn).not.toHaveBeenCalled();
    expect(screen.getByText("Select the payment method")).toBeInTheDocument();
  });

  it("cancels the order and resets even when the cancel request rejects", async () => {
    const cancelFn = vi.fn().mockRejectedValue(new Error("network error"));
    renderPaymentScreen({ cancelFn });
    await screen.findByText("Select the payment method");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Cancel order" }));
    const dialogButtons = screen.getAllByRole("button", {
      name: "Cancel order",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    expect(await screen.findByText("Idle screen")).toBeInTheDocument();
  });

  it("cancels the pending order when the idle timeout elapses while choosing", async () => {
    vi.useFakeTimers();
    const cancelFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ cancelFn });
    expect(screen.getByText("Select the payment method")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    expect(cancelFn).toHaveBeenCalled();
  });

  it("does not trigger the idle timeout during the machine step", () => {
    vi.useFakeTimers();
    const cancelFn = vi.fn().mockResolvedValue({});
    renderPaymentScreen({ cancelFn });

    act(() => {
      chooseCardViaClick();
    });

    act(() => {
      vi.advanceTimersByTime(100_000);
    });

    expect(cancelFn).not.toHaveBeenCalled();
  });
});
