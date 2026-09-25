import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "./QuantityStepper";

describe("QuantityStepper", () => {
  it("renders the quantity and labeled buttons", () => {
    render(
      <QuantityStepper
        itemName="Voss water"
        quantity={2}
        max={5}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Decrease quantity of Voss water"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Increase quantity of Voss water"),
    ).toBeInTheDocument();
  });

  it("calls onIncrement when the plus button is clicked", async () => {
    const onIncrement = vi.fn();
    const user = userEvent.setup();
    render(
      <QuantityStepper
        itemName="Voss water"
        quantity={2}
        max={5}
        onIncrement={onIncrement}
        onDecrement={() => {}}
      />,
    );

    await user.click(screen.getByLabelText("Increase quantity of Voss water"));

    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it("calls onDecrement when the minus button is clicked", async () => {
    const onDecrement = vi.fn();
    const user = userEvent.setup();
    render(
      <QuantityStepper
        itemName="Voss water"
        quantity={2}
        max={5}
        onIncrement={() => {}}
        onDecrement={onDecrement}
      />,
    );

    await user.click(screen.getByLabelText("Decrease quantity of Voss water"));

    expect(onDecrement).toHaveBeenCalledOnce();
  });

  it("disables the plus button when quantity reaches the stock limit", () => {
    render(
      <QuantityStepper
        itemName="Voss water"
        quantity={5}
        max={5}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );

    expect(
      screen.getByLabelText("Increase quantity of Voss water"),
    ).toBeDisabled();
  });
});
