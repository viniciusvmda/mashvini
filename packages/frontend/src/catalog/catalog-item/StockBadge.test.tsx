import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StockBadge } from "./StockBadge";

describe("StockBadge", () => {
  it("renders the not-available-in-stock message", () => {
    render(<StockBadge />);

    expect(screen.getByText("Not available in stock")).toBeInTheDocument();
  });
});
