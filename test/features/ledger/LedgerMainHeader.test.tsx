import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { setupTestEnvironment } from "@test/mocks/utils";

const { mockNavigate } = setupTestEnvironment();

import LedgerMainHeader from "@/features/ledger/components/LedgerMainHeader";
import useLedgerStore from "@/components/shared/store";

vi.mock("@/components/shared/store", () => ({
  default: vi.fn(),
}));

describe("LedgerMainHeader Component", () => {
  (useLedgerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    ledgerName: "Test Ledger",
  });
  const renderLedgerMainHeader = (hasAccounts: boolean) => {
    render(
      <ChakraProvider>
        <MemoryRouter>
          <LedgerMainHeader
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
