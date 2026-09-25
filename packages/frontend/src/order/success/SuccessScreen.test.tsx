import { act, fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { SuccessScreen } from "./SuccessScreen";

function renderSuccessScreen() {
  return renderWithClient(
    <Routes>
      <Route path="/" element={<p>Idle screen</p>} />
      <Route path="/success" element={<SuccessScreen />} />
    </Routes>,
    { queryFn: () => Promise.resolve({}), initialEntries: ["/success"] },
  );
}

describe("SuccessScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the thank-you message and the initial countdown", () => {
    renderSuccessScreen();

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

  it("navigates to the idle screen immediately when Start new shop is clicked", () => {
    renderSuccessScreen();

    act(() => {
      fireEvent.click(screen.getByText("Start new shop"));
    });

    expect(screen.getByText("Idle screen")).toBeInTheDocument();
  });
});
