import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at the given number of seconds", () => {
    const { result } = renderHook(() => useCountdown(3, () => {}));

    expect(result.current.remaining).toBe(3);
  });

  it("counts down by one every second", () => {
    const { result } = renderHook(() => useCountdown(3, () => {}));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remaining).toBe(2);
  });

  it("calls onZero once the countdown reaches 0", () => {
    const onZero = vi.fn();
    renderHook(() => useCountdown(2, onZero));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onZero).toHaveBeenCalledOnce();
  });

  it("does not call onZero again after it has already reached 0", () => {
    const onZero = vi.fn();
    renderHook(() => useCountdown(1, onZero));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onZero).toHaveBeenCalledOnce();
  });

  it("resets the remaining seconds back to the initial value", () => {
    const { result } = renderHook(() => useCountdown(3, () => {}));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.remaining).toBe(3);
  });
});
