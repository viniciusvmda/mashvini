import { act, screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { IdleTimeoutDialog } from "./IdleTimeoutDialog";

function renderDialog() {
  return renderWithClient(
    <Routes>
      <Route path="/catalog" element={<IdleTimeoutDialog />} />
      <Route path="/" element={<p>Idle screen</p>} />
    </Routes>,
    { queryFn: () => Promise.resolve({}), initialEntries: ["/catalog"] },
  );
}

describe("IdleTimeoutDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not shown before the idle timeout elapses", () => {
    renderDialog();

    expect(screen.queryByText("Still there?")).not.toBeInTheDocument();
  });

  it("shows the dialog after 90 seconds with no interaction", () => {
    renderDialog();

    act(() => {
      vi.advanceTimersByTime(90_000);
    });

    expect(screen.getByText("Still there?")).toBeInTheDocument();
  });

  it("cancels and resets the timer when the page is interacted with before it reaches 0", () => {
    renderDialog();

    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(screen.getByText("Still there?")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(screen.queryByText("Still there?")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(89_000);
    });
    expect(screen.queryByText("Still there?")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Still there?")).toBeInTheDocument();
  });

  it("clears the cart and navigates to the idle screen when the countdown reaches 0", () => {
    renderDialog();

    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(screen.getByText("Still there?")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText("Idle screen")).toBeInTheDocument();
  });
});
