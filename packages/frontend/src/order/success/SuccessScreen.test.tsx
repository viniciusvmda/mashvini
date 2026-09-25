import { act, fireEvent, screen } from "@testing-library/react";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { SuccessScreen } from "./SuccessScreen";

function NavigateToSuccess({ orderId }: { orderId: number }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/success", { replace: true, state: { orderId } });
  }, [navigate, orderId]);

  return null;
}

function renderSuccessScreen(orderId?: number) {
  return renderWithClient(
    <Routes>
      <Route path="/" element={<p>Idle screen</p>} />
      <Route path="/success" element={<SuccessScreen />} />
      {orderId !== undefined && (
        <Route
          path="/start"
          element={<NavigateToSuccess orderId={orderId} />}
        />
      )}
    </Routes>,
    {
      queryFn: () => Promise.resolve({}),
      initialEntries: [orderId !== undefined ? "/start" : "/success"],
    },
  );
}

describe("SuccessScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Mashvini logo, thank-you message, and the initial countdown", () => {
    renderSuccessScreen();

    expect(screen.getByRole("img", { name: "Mashvini" })).toBeInTheDocument();
    expect(
      screen.getByText("Thank you for buying at MashVini"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Returning to the start page in 10 seconds"),
    ).toBeInTheDocument();
  });

  it("navigates to the idle screen once the countdown reaches 0", () => {
    renderSuccessScreen();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText("Idle screen")).toBeInTheDocument();
  });

  it("shows the order number when it is passed via router state", () => {
    renderSuccessScreen(42);

    expect(screen.getByText("Order #42")).toBeInTheDocument();
  });

  it("does not crash and shows no order number without router state", () => {
    renderSuccessScreen();

    expect(screen.queryByText(/Order #/)).not.toBeInTheDocument();
  });

  it("navigates to the idle screen immediately when Start new shop is clicked", () => {
    renderSuccessScreen();

    act(() => {
      fireEvent.click(screen.getByText("Start new shop"));
    });

    expect(screen.getByText("Idle screen")).toBeInTheDocument();
  });
});
