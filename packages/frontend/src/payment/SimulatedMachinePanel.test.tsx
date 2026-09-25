import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SimulatedMachinePanel } from "./SimulatedMachinePanel";

describe("SimulatedMachinePanel", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing when the payment simulator env var is off", () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "false");

    render(<SimulatedMachinePanel onOutcome={vi.fn()} />);

    expect(screen.queryByText("SIMULATOR")).not.toBeInTheDocument();
  });

  it("renders the simulator panel when the env var is on", () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");

    render(<SimulatedMachinePanel onOutcome={vi.fn()} />);

    expect(screen.getByText("SIMULATOR")).toBeInTheDocument();
  });

  it("calls onOutcome with approved when Approve is clicked", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const onOutcome = vi.fn();
    const user = userEvent.setup();
    render(<SimulatedMachinePanel onOutcome={onOutcome} />);

    await user.click(
      screen.getByRole("button", { name: "Simulate an approved payment" }),
    );

    expect(onOutcome).toHaveBeenCalledWith("approved");
  });

  it("calls onOutcome with declined when Decline is clicked", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const onOutcome = vi.fn();
    const user = userEvent.setup();
    render(<SimulatedMachinePanel onOutcome={onOutcome} />);

    await user.click(
      screen.getByRole("button", { name: "Simulate a declined payment" }),
    );

    expect(onOutcome).toHaveBeenCalledWith("declined");
  });

  it("calls onOutcome with gateway_error when Gateway error is clicked", async () => {
    vi.stubEnv("VITE_PAYMENT_SIMULATOR", "true");
    const onOutcome = vi.fn();
    const user = userEvent.setup();
    render(<SimulatedMachinePanel onOutcome={onOutcome} />);

    await user.click(
      screen.getByRole("button", { name: "Simulate a gateway error" }),
    );

    expect(onOutcome).toHaveBeenCalledWith("gateway_error");
  });
});
