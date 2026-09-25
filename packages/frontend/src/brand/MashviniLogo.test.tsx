import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MashviniLogo } from "./MashviniLogo";

describe("MashviniLogo", () => {
  it("renders the stacked layout as an accessible image named Mashvini", () => {
    render(<MashviniLogo />);

    expect(screen.getByRole("img", { name: "Mashvini" })).toBeInTheDocument();
  });

  it("renders the horizontal layout as an accessible image named Mashvini", () => {
    render(<MashviniLogo layout="horizontal" />);

    expect(screen.getByRole("img", { name: "Mashvini" })).toBeInTheDocument();
  });
});
