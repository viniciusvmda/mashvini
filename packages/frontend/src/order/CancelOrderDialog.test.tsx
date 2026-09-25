import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { CancelOrderDialog } from "./CancelOrderDialog";

function renderDialog() {
  return renderWithClient(
    <Routes>
      <Route path="/catalog" element={<CancelOrderDialog />} />
      <Route path="/" element={<p>Idle screen</p>} />
    </Routes>,
    { queryFn: () => Promise.resolve({}), initialEntries: ["/catalog"] },
  );
}

describe("CancelOrderDialog", () => {
  it("opens a confirmation dialog when Cancel order is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancel order" }));

    expect(screen.getByText("Cancel this order?")).toBeInTheDocument();
  });

  it("keeps the cart untouched and closes when dismissed", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancel order" }));
    await user.click(screen.getByRole("button", { name: "Keep shopping" }));

    expect(screen.queryByText("Cancel this order?")).not.toBeInTheDocument();
    expect(screen.queryByText("Idle screen")).not.toBeInTheDocument();
  });

  it("clears the cart and navigates to the idle screen when confirmed", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancel order" }));
    const dialogButtons = screen.getAllByRole("button", {
      name: "Cancel order",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    expect(await screen.findByText("Idle screen")).toBeInTheDocument();
  });
});
