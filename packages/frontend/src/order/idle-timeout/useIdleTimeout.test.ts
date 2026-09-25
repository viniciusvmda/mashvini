import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIdleTimeout } from "./useIdleTimeout";

describe("useIdleTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not idle right after mounting", () => {
    const { result } = renderHook(() => useIdleTimeout(90_000));

    expect(result.current.isIdle).toBe(false);
  });

  it("becomes idle after the timeout elapses with no interaction", () => {
    const { result } = renderHook(() => useIdleTimeout(90_000));

    act(() => {
      vi.advanceTimersByTime(90_000);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it("resets the timer when a pointerdown event fires on the window", () => {
    const { result } = renderHook(() => useIdleTimeout(90_000));

    act(() => {
      vi.advanceTimersByTime(89_000);
      window.dispatchEvent(new Event("pointerdown"));
      vi.advanceTimersByTime(89_000);
    });

    expect(result.current.isIdle).toBe(false);
  });

  it("goes idle again 90 seconds after the last reset interaction", () => {
    const { result } = renderHook(() => useIdleTimeout(90_000));

    act(() => {
      vi.advanceTimersByTime(89_000);
      window.dispatchEvent(new Event("keydown"));
      vi.advanceTimersByTime(90_000);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it("exposes a reset function that clears the idle state", () => {
    const { result } = renderHook(() => useIdleTimeout(90_000));

    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(result.current.isIdle).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isIdle).toBe(false);
  });
});
