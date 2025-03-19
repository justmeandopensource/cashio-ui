import LedgerMainAccounts from "@/features/ledger/components/LedgerMainAccounts";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { accountHandlers } from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { mockAccounts, mockLedgers } from "@test/mocks/testData";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@components/modals/CreateAccountModal", () => ({
  default: vi.fn(({ isOpen }) =>
    isOpen ? <div data-testid="mocked-create-account-modal" /> : null,
  ),
}));

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

  describe("Assets table tests", () => {
    it("displays asset tables with accounts when accounts are present", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
      });
    });

    it("displays empty state for assets when no asset accounts exist", async () => {
      server.use(accountHandlers.getAccountsEmpty);
      renderLedgerMainAccounts([]);

      await waitFor(() => {
        expect(screen.getByText("No Asset Accounts")).toBeInTheDocument();
        expect(screen.getByText("Create Asset Account")).toBeInTheDocument();
      });
    });

    it("shows non-zero balance and hides zero balance accounts in assets table by default", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        // non-zero balance accounts should be visible
        expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
        // zero balance accounts should not be visible
        expect(screen.queryByText("Test Bank 2")).not.toBeInTheDocument();
      });
    });

    it("allows toggling zero balance asset accounts", async () => {
      server.use(accountHandlers.getAccountsWithData);
      const { user } = renderLedgerMainAccounts(mockAccounts);

      const showZeroBalancesButton =
        screen.getAllByText("Show zero balances")[0];

      await user.click(showZeroBalancesButton);
      const hideZeroBalancesButton =
        screen.getAllByText("Hide zero balances")[0];
      expect(hideZeroBalancesButton).toBeInTheDocument();
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
      expect(screen.getByText("Test Bank 2")).toBeInTheDocument();

      await user.click(hideZeroBalancesButton);
      expect(showZeroBalancesButton).toBeInTheDocument();
      expect(screen.queryByText("Test Bank 2")).not.toBeInTheDocument();
    });

    it("renders group asset account name as text (not a link)", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        const assetsTable = screen.getByTestId(
          "ledgermainaccounts-asset-accounts-table",
        );
        const groupAssetAccountName =
          within(assetsTable).getByText("Current Accounts");
        expect(groupAssetAccountName.closest("a")).toBeNull();
      });
    });

    it("renders non-group asset account name as a link", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        const nonGroupAccountLink = screen
          .getByText("Test Bank 1")
          .closest("a");
        expect(nonGroupAccountLink).toBeInTheDocument();
        expect(nonGroupAccountLink).toHaveAttribute(
          "href",
          `/ledger/1/account/2`,
        );
      });
    });

    it("opens create asset account modal when add-asset-account-plus-icon is clicked", async () => {
      server.use(accountHandlers.getAccountsEmpty);
      const { user } = renderLedgerMainAccounts([]);
      await waitFor(() => {
        expect(screen.getByText("No Asset Accounts")).toBeInTheDocument();
      });
      await user.click(
        screen.getByTestId("ledgermainaccounts-add-asset-account-plus-icon"),
      );
      await waitFor(() => {
        expect(
          screen.getByTestId("mocked-create-account-modal"),
        ).toBeInTheDocument();
      });
    });

    it("opens create asset account modal when Create Asset Account button is clicked", async () => {
      server.use(accountHandlers.getAccountsEmpty);
      const { user } = renderLedgerMainAccounts([]);
      await waitFor(() => {
        expect(screen.getByText("No Asset Accounts")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Create Asset Account"));
      await waitFor(() => {
        expect(
          screen.getByTestId("mocked-create-account-modal"),
        ).toBeInTheDocument();
      });
    });

    it("opens create asset account modal when group-account-plus-icon is clicked", async () => {
      server.use(accountHandlers.getAccountsWithData);
      const { user } = renderLedgerMainAccounts(mockAccounts);
      await waitFor(() => {
        expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
      });

      // 1 is the account id of Current Accounts group account
      const groupAccountPlusIcon = screen.getByTestId(
        "ledgermainaccounts-group-account-plus-icon-1",
      );
      await user.click(groupAccountPlusIcon);

      await waitFor(() => {
        expect(
          screen.getByTestId("mocked-create-account-modal"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Liabilities table tests", () => {
    it("displays liability tables with accounts when accounts are present", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
      });
    });

    it("displays empty state for liabilities when no liability accounts exist", async () => {
      server.use(accountHandlers.getAccountsEmpty);
      renderLedgerMainAccounts([]);

      await waitFor(() => {
        expect(screen.getByText("No Liability Accounts")).toBeInTheDocument();
        expect(
          screen.getByText("Create Liability Account"),
        ).toBeInTheDocument();
      });
    });

    it("shows non-zero balance and hides zero balance accounts in liabilities table by default", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        // non-zero balance accounts should be visible
        expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
        // zero balance accounts should not be visible
        expect(
          screen.queryByText("Test Credit Card 2"),
        ).not.toBeInTheDocument();
      });
    });

    it("allows toggling zero balance liaiblity accounts", async () => {
      server.use(accountHandlers.getAccountsWithData);
      const { user } = renderLedgerMainAccounts(mockAccounts);

      const showZeroBalancesButton =
        screen.getAllByText("Show zero balances")[1];

      await user.click(showZeroBalancesButton);
      const hideZeroBalancesButton =
        screen.getAllByText("Hide zero balances")[0];
      expect(hideZeroBalancesButton).toBeInTheDocument();
      expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
      expect(screen.getByText("Test Credit Card 2")).toBeInTheDocument();

      await user.click(hideZeroBalancesButton);
      expect(showZeroBalancesButton).toBeInTheDocument();
      expect(screen.queryByText("Test Credit Card 2")).not.toBeInTheDocument();
    });

    it("renders group liability account name as text (not a link)", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        const liabilitiesTable = screen.getByTestId(
          "ledgermainaccounts-liability-accounts-table",
        );
        const groupLiabilityAccountName =
          within(liabilitiesTable).getByText("Credit Cards");
        expect(groupLiabilityAccountName.closest("a")).toBeNull();
      });
    });

    it("renders non-group liaiblity account name as a link", async () => {
      server.use(accountHandlers.getAccountsWithData);
      renderLedgerMainAccounts(mockAccounts);

      await waitFor(() => {
        const nonGroupAccountLink = screen
          .getByText("Test Credit Card 1")
          .closest("a");
        expect(nonGroupAccountLink).toBeInTheDocument();
        expect(nonGroupAccountLink).toHaveAttribute(
          "href",
          `/ledger/1/account/5`,
        );
      });
    });

    it("opens create liability account modal when add-liability-account-plus-icon is clicked", async () => {
      server.use(accountHandlers.getAccountsEmpty);
      const { user } = renderLedgerMainAccounts([]);
      await waitFor(() => {
        expect(screen.getByText("No Liability Accounts")).toBeInTheDocument();
      });
      await user.click(
        screen.getByTestId(
          "ledgermainaccounts-add-liability-account-plus-icon",
        ),
      );
      await waitFor(() => {
        expect(
          screen.getByTestId("mocked-create-account-modal"),
        ).toBeInTheDocument();
      });
    });

    it("opens create liability account modal when Create Liability Account button is clicked", async () => {
      server.use(accountHandlers.getAccountsEmpty);
      const { user } = renderLedgerMainAccounts([]);
      await waitFor(() => {
        expect(screen.getByText("No Liability Accounts")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Create Liability Account"));
      await waitFor(() => {
        expect(
          screen.getByTestId("mocked-create-account-modal"),
        ).toBeInTheDocument();
      });
    });

    it("opens create liaiblity account modal when group-account-plus-icon is clicked", async () => {
      server.use(accountHandlers.getAccountsWithData);
      const { user } = renderLedgerMainAccounts(mockAccounts);
      await waitFor(() => {
        expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
      });

      // 4 is the account id of Credit Cards group account
      const groupAccountPlusIcon = screen.getByTestId(
        "ledgermainaccounts-group-account-plus-icon-4",
      );
      await user.click(groupAccountPlusIcon);

      await waitFor(() => {
        expect(
          screen.getByTestId("mocked-create-account-modal"),
        ).toBeInTheDocument();
      });
    });
  });
});
