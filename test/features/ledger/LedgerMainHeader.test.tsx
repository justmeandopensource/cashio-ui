import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { setupTestEnvironment } from "@test/mocks/utils";

const { mockNavigate } = setupTestEnvironment();

import LedgerMainHeader from "@/features/ledger/components/LedgerMainHeader";

describe("LedgerMainHeader Component", () => {
  const renderLedgerMainHeader = (hasAccounts: boolean) => {
    const ledger = {
      name: "Test Ledger",
    };
    render(
      <ChakraProvider>
        <MemoryRouter>
          <LedgerMainHeader
            ledger={ledger}
            onAddTransaction={() => {}}
            onTransferFunds={() => {}}
            hasAccounts={hasAccounts}
          />
        </MemoryRouter>
      </ChakraProvider>,
    );
  };

  it("displays the ledger name", () => {
    renderLedgerMainHeader(true);
    expect(screen.getByText("Test Ledger")).toBeInTheDocument();
  });

  it("displays Add Transaction and Transfer Funds buttons when hasAccounts is true", () => {
    renderLedgerMainHeader(true);
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByText("Transfer Funds")).toBeInTheDocument();
  });

  it("does not display Add Transaction and Transfer Funds buttons when hasAccounts is false", () => {
    renderLedgerMainHeader(false);
    expect(screen.queryByText("Add Transaction")).not.toBeInTheDocument();
    expect(screen.queryByText("Transfer Funds")).not.toBeInTheDocument();
  });

  it("navigates to home page when back button is clicked", async () => {
    renderLedgerMainHeader(false);
    const backButton = screen.getByLabelText("Back to Home");

    const user = userEvent.setup();
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
