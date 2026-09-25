import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePaymentMachine } from "./usePaymentMachine";

describe("usePaymentMachine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with no outcome after 5 seconds with no manual resolution", () => {
    const onResolve = vi.fn();
    renderHook(() => usePaymentMachine(onResolve));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onResolve).toHaveBeenCalledOnce();
    expect(onResolve).toHaveBeenCalledWith(undefined);
  });

  it("resolves immediately with the given outcome when resolveNow is called", () => {
    const onResolve = vi.fn();
    const { result } = renderHook(() => usePaymentMachine(onResolve));

    act(() => {
      result.current.resolveNow("declined");
    });

    expect(onResolve).toHaveBeenCalledOnce();
    expect(onResolve).toHaveBeenCalledWith("declined");
  });

  it("does not resolve again from the timer once resolveNow has fired", () => {
    const onResolve = vi.fn();
    const { result } = renderHook(() => usePaymentMachine(onResolve));

    act(() => {
      result.current.resolveNow("approved");
      vi.advanceTimersByTime(5000);
    });

    expect(onResolve).toHaveBeenCalledOnce();
  });

  it("does not fire a stray payment after unmounting mid-wait", () => {
    const onResolve = vi.fn();
    const { unmount } = renderHook(() => usePaymentMachine(onResolve));

    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onResolve).not.toHaveBeenCalled();
  });
});
