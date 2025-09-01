import Transactions from "@/features/transactions/Transactions";
import { ChakraProvider } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { transactionHandlers } from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnAddTransaction = vi.fn();
const mockOnTransactionDeleted = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe("Transaction Component", () => {
  beforeEach(() => {
    resetTestState();
    mockOnAddTransaction.mockReset();
    mockOnTransactionDeleted.mockReset();
    mockToast.mockReset();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderTransactions = (props = {}) => {
    const defaultProps = {
      ledgerId: "1",
      currencySymbolCode: "GBP",
      onAddTransaction: mockOnAddTransaction,
      onTransactionDeleted: mockOnTransactionDeleted,
      shouldFetch: true,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <MemoryRouter>
            <Transactions {...mergedProps} />
          </MemoryRouter>
        </ChakraProvider>
        ,
      </QueryClientProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders no transactions message when there are no transactions", async () => {
    server.use(transactionHandlers.getTransactionsEmpty);
    renderTransactions();

    await waitFor(() => {
      expect(screen.getByText("No Transactions Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "You do not have any transactions for this account yet.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Add Transaction/i }),
      ).toBeInTheDocument();
    });
  });

  it("renders transactions from all accounts when account is not passed", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
      expect(screen.getAllByText("Test Credit Card 1").length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText("Council Water #1").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Test Bank 1").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Salary from Test Company into Test Bank 1").length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByText("Test Bank 2").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Salary from Test Company into Test Bank 2").length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders transactions only from specific account when account is passed", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    renderTransactions({ accountId: "5" });
    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
      expect(screen.getAllByText("Council Water #1").length).toBeGreaterThan(0);
      expect(
        screen.queryByText("Salary from Test Company into Test Bank 1"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Salary from Test Company into Test Bank 2"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error message when fetching transactions fails", async () => {
    server.use(transactionHandlers.getTransactionsError);
    renderTransactions();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch transactions",
        }),
      );
    });
  });

  it("shows split details when split indicator is clicked on split transaction", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.getTransactionSplitsWithData);
    const { user } = renderTransactions();
    await waitFor(() => {
      expect(
        screen.getByTestId("transactiontable-split-indicator"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("transactiontable-split-indicator"));
    await waitFor(() => {
      expect(screen.getByText("Water split 1")).toBeInTheDocument();
      expect(screen.getByText("Water split 2")).toBeInTheDocument();
    });
  });

  it("shows error toast when fetching split details fails", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.getTransactionSplitsError);
    const { user } = renderTransactions();
    await waitFor(() => {
      expect(
        screen.getByTestId("transactiontable-split-indicator"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("transactiontable-split-indicator"));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch split transactions.",
        }),
      );
    });
  });

  it("shows transfer details when transfer indicator is clicked on source transfer transaction", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.getTransferTransactionsWithData);
    const { user } = renderTransactions({ accountId: "2" });
    await waitFor(() => {
      expect(
        screen.getByTestId("transactiontable-transfer-indicator"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("transactiontable-transfer-indicator"));
    await waitFor(() => {
      expect(screen.getByText("Funds transferred to")).toBeInTheDocument();
      expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
    });
  });

  it("shows transfer details when transfer indicator is clicked on destination transfer transaction", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.getTransferTransactionsWithData);
    const { user } = renderTransactions({ accountId: "5" });
    await waitFor(() => {
      expect(
        screen.getByTestId("transactiontable-transfer-indicator"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("transactiontable-transfer-indicator"));
    await waitFor(() => {
      expect(screen.getByText("Funds transferred from")).toBeInTheDocument();
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
    });
  });

  it("shows error toast when fetching transfer details fails", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.getTransferTransactionsError);
    const { user } = renderTransactions({ accountId: "2" });
    await waitFor(() => {
      expect(
        screen.getByTestId("transactiontable-transfer-indicator"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("transactiontable-transfer-indicator"));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch transfer details.",
        }),
      );
    });
  });

  it("successfully deletes a transaction when trash icon is clicked", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.deleteTransactionSuccess);
    const { user } = renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });
    const trashIcon = screen.getAllByTestId("transactiontable-trash-icon")[0];
    await user.click(trashIcon);
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);
    await waitFor(() => {
      expect(mockOnTransactionDeleted).toHaveBeenCalledOnce();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Transaction deleted",
        }),
      );
    });
  });

  it("shows error toast when delete transaction fails", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    server.use(transactionHandlers.deleteTransactionError);
    const { user } = renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });
    const trashIcon = screen.getAllByTestId("transactiontable-trash-icon")[0];
    await user.click(trashIcon);
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to delete transaction.",
        }),
      );
    });
  });

  it("shows pagination controls when there are multiple pages", async () => {
    server.use(transactionHandlers.getTransactionsWithPagination);
    renderTransactions();
    await waitFor(() => {
      expect(screen.getByText("Transactions")).toBeInTheDocument();
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
      expect(
        screen.getByTestId("transactions-prev-page-icon"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("transactions-prev-page-icon")).toBeDisabled();
      expect(
        screen.getByTestId("transactions-next-page-icon"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("transactions-next-page-icon"),
      ).not.toBeDisabled();
    });
  });

  it("navigates to previous and next pages when corresponding button icons are clicked", async () => {
    server.use(transactionHandlers.getTransactionsWithData);
    const { user } = renderTransactions();

    await waitFor(() => {
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("transactions-next-page-icon"));
    await waitFor(() => {
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
      expect(
        screen.getByTestId("transactions-prev-page-icon"),
      ).not.toBeDisabled();
      expect(screen.getByTestId("transactions-next-page-icon")).toBeDisabled();
    });

    await user.click(screen.getByTestId("transactions-prev-page-icon"));
    await waitFor(() => {
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
      expect(screen.getByTestId("transactions-prev-page-icon")).toBeDisabled();
      expect(
        screen.getByTestId("transactions-next-page-icon"),
      ).not.toBeDisabled();
    });
  });
});
