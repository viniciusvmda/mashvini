import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { IdleScreen } from "./IdleScreen";

function renderIdleScreen() {
  return renderWithClient(
    <Routes>
      <Route path="/" element={<IdleScreen />} />
      <Route path="/catalog" element={<p>Catalog screen</p>} />
    </Routes>,
    { queryFn: () => Promise.resolve({}), initialEntries: ["/"] },
  );
}

describe("IdleScreen", () => {
  it("renders the start prompt", () => {
    renderIdleScreen();

    expect(
      screen.getByText("Tap here to start your order"),
    ).toBeInTheDocument();
  });

  it("navigates to the catalog when tapped", async () => {
    const user = userEvent.setup();
    renderIdleScreen();

    await user.click(screen.getByText("Tap here to start your order"));

    expect(await screen.findByText("Catalog screen")).toBeInTheDocument();
  });
});
