import { describe, expect, it } from "vitest";
import { formatPrice } from "./currency";

describe("formatPrice", () => {
  it("formats a whole number as USD", () => {
    expect(formatPrice(9)).toBe("$9.00");
  });

  it("formats a fractional price rounded to two decimals", () => {
    expect(formatPrice(1.5)).toBe("$1.50");
  });

  it("formats zero as USD", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});
