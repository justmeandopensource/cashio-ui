import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { server } from "@test/mocks/server";
import { accountHandlers, ledgerHandlers } from "@test/mocks/handlers";
import LedgerMain from "@/features/ledger/components/LedgerMain";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { resetTestState } from "@test/mocks/utils";

vi.mock("@components/modals/CreateTransactionModal", () => ({
  default: vi.fn(({ isOpen }) =>
    isOpen ? <div data-testid="mocked-create-transaction-modal" /> : null,
  ),
}));

vi.mock("@components/modals/TransferFundsModal", () => ({
  default: vi.fn(({ isOpen }) =>
    isOpen ? <div data-testid="mocked-transfer-funds-modal" /> : null,
  ),
}));

describe("LedgerMain Component", () => {
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

  const renderLedgerMain = () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/ledger/1"]}>
            <Routes>
              <Route path="/ledger/:ledgerId" element={<LedgerMain />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("opens create transaction modal when Add Transaction button in LedgerMainHeader is clicked", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });

    const addTransactionBtn = screen.getByTestId(
      "ledgermainheader-add-transaction-btn",
    );
    await user.click(addTransactionBtn);

    await waitFor(() => {
      expect(
        screen.getByTestId("mocked-create-transaction-modal"),
      ).toBeInTheDocument();
    });
  });

  it("opens transfer funds modal when Transfer Funds button in LedgerMainHeader is clicked", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });

    const transferFundsBtn = screen.getByTestId(
      "ledgermainheader-transfer-funds-btn",
    );
    await user.click(transferFundsBtn);

    await waitFor(() => {
      expect(
        screen.getByTestId("mocked-transfer-funds-modal"),
      ).toBeInTheDocument();
    });
  });

  it("should have accounts tab selected by default", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });

    const accountsTab = screen.getByRole("tab", { name: /accounts/i });
    expect(accountsTab).toHaveAttribute("aria-selected", "true");

    const transactionsTab = screen.getByRole("tab", { name: /transactions/i });
    expect(transactionsTab).toHaveAttribute("aria-selected", "false");
  });

  it("shows accounts in accounts tab", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
    expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
  });

  it("should switch to transactions tab when clicked", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });

    const transactionsTab = screen.getByRole("tab", { name: /transactions/i });
    await user.click(transactionsTab);

    await waitFor(() => {
      expect(transactionsTab).toHaveAttribute("aria-selected", "true");
    });

    const accountsTab = screen.getByRole("tab", { name: /accounts/i });
    expect(accountsTab).toHaveAttribute("aria-selected", "false");
  });

  it("should display correct number of accounts in badge", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("UK")).toBeInTheDocument();
    });

    const badge = screen.getByText("5");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("chakra-badge");
  });

  it("should open create transaction modal when plus icon is clicked on a non-group account row", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
    });

    const accountRow = screen.getByText("Test Bank 1").closest("tr");
    expect(accountRow).toBeInTheDocument();

    const actionIcons = accountRow?.querySelector(".action-icons");
    expect(actionIcons).toBeInTheDocument();

    const icons = actionIcons?.querySelectorAll("svg");
    expect(icons?.length).toBeGreaterThanOrEqual(2);

    const plusIcon = icons?.[0];
    expect(plusIcon).toBeInTheDocument();
    await user.click(plusIcon!);

    await waitFor(() => {
      expect(
        screen.getByTestId("mocked-create-transaction-modal"),
      ).toBeInTheDocument();
    });
  });

  it("should open transfer funds modal when repeat icon is clicked on a non-group account row", async () => {
    server.use(ledgerHandlers.getLedgerWithData);
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderLedgerMain();

    await waitFor(() => {
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
    });

    const accountRow = screen.getByText("Test Bank 1").closest("tr");
    expect(accountRow).toBeInTheDocument();

    const actionIcons = accountRow?.querySelector(".action-icons");
    expect(actionIcons).toBeInTheDocument();

    const icons = actionIcons?.querySelectorAll("svg");
    expect(icons?.length).toBeGreaterThanOrEqual(2);

    const repeatIcon = icons?.[1];
    expect(repeatIcon).toBeInTheDocument();

    await user.click(repeatIcon!);

    await waitFor(() => {
      expect(
        screen.getByTestId("mocked-transfer-funds-modal"),
      ).toBeInTheDocument();
    });
  });
});
