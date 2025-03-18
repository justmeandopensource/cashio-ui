import LedgerMainAccounts from "@/features/ledger/components/LedgerMainAccounts";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ledgerHandlers } from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { mockAccounts, mockLedgers } from "@test/mocks/testData";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

describe("LedgerMainAccounts Component", () => {
  beforeEach(() => {
    resetTestState();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const ledger = mockLedgers[0];

  const renderLedgerMainAccounts = (accounts: any[]) => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <LedgerMainAccounts
              accounts={accounts}
              ledger={ledger}
              onAddTransaction={() => {}}
              onTransferFunds={() => {}}
            />
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("displays asset and liability tables with accounts when accounts are present", async () => {
    server.use(ledgerHandlers.getAccountsWithData);
    renderLedgerMainAccounts(mockAccounts);

    await waitFor(() => {
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
      expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
    });
  });

  it("displays empty state for assets and liabilities when no accounts exist", async () => {
    server.use(ledgerHandlers.getAccountsEmpty);
    renderLedgerMainAccounts([]);

    await waitFor(() => {
      expect(screen.getByText("No Asset Accounts")).toBeInTheDocument();
      expect(screen.getByText("Create Asset Account")).toBeInTheDocument();
      expect(screen.getByText("No Liability Accounts")).toBeInTheDocument();
      expect(screen.getByText("Create Liability Account")).toBeInTheDocument();
    });
  });

  it("shows non-zero balance and hides zero balance accounts by default", async () => {
    server.use(ledgerHandlers.getAccountsWithData);
    renderLedgerMainAccounts(mockAccounts);

    await waitFor(() => {
      // zero balance accounts should not be visible
      expect(screen.queryByText("Test Bank 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Test Credit Card 2")).not.toBeInTheDocument();
      // non-zero balance accounts should be visible
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
      expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
    });
  });

  it("allows toggling zero balance asset accounts", async () => {
    server.use(ledgerHandlers.getAccountsWithData);
    const { user } = renderLedgerMainAccounts(mockAccounts);

    const showZeroBalancesButton = screen.getAllByText("Show zero balances")[0];

    await user.click(showZeroBalancesButton);
    const hideZeroBalancesButton = screen.getAllByText("Hide zero balances")[0];
    expect(hideZeroBalancesButton).toBeInTheDocument();
    expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
    expect(screen.getByText("Test Bank 2")).toBeInTheDocument();
    expect(screen.queryByText("Test Credit Card 2")).not.toBeInTheDocument();

    await user.click(hideZeroBalancesButton);
    expect(showZeroBalancesButton).toBeInTheDocument();
    expect(screen.queryByText("Test Bank 2")).not.toBeInTheDocument();
  });

  it("allows toggling zero balance liaiblity accounts", async () => {
    server.use(ledgerHandlers.getAccountsWithData);
    const { user } = renderLedgerMainAccounts(mockAccounts);

    const showZeroBalancesButton = screen.getAllByText("Show zero balances")[1];

    await user.click(showZeroBalancesButton);
    const hideZeroBalancesButton = screen.getAllByText("Hide zero balances")[0];
    expect(hideZeroBalancesButton).toBeInTheDocument();
    expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
    expect(screen.getByText("Test Credit Card 2")).toBeInTheDocument();
    expect(screen.queryByText("Test Bank 2")).not.toBeInTheDocument();

    await user.click(hideZeroBalancesButton);
    expect(showZeroBalancesButton).toBeInTheDocument();
    expect(screen.queryByText("Test Credit Card 2")).not.toBeInTheDocument();
  });
});
