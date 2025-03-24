import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TransactionCard from "@/features/transactions/TransactionCard";
import { ChakraProvider } from "@chakra-ui/react";

// Mock transaction data for different test scenarios
const mockBaseTransaction = {
  transaction_id: "1",
  date: "2023-05-20",
  category_name: "Groceries",
  notes: "Weekly shopping",
  account_name: "Test Bank",
  is_split: false,
  is_transfer: false,
  credit: 0,
  debit: 50.0,
  tags: [{ tag_id: "1", name: "Food" }],
};

const mockSplitTransaction = {
  ...mockBaseTransaction,
  is_split: true,
};

const mockTransferTransaction = {
  ...mockBaseTransaction,
  is_transfer: true,
  transfer_id: "transfer1",
  credit: 100.0,
  debit: 0,
};

// Utility function to render the component with Chakra Provider
const renderTransactionCard = (props = {}) => {
  const defaultProps = {
    transaction: mockBaseTransaction,
    currencySymbolCode: "GBP",
    isExpanded: false,
    toggleExpand: vi.fn(),
    fetchSplitTransactions: vi.fn(),
    splitTransactions: [],
    fetchTransferDetails: vi.fn(),
    transferDetails: undefined,
    isSplitLoading: false,
    isTransferLoading: false,
    onDeleteTransaction: vi.fn(),
    showAccountName: false,
  };

  const mergedProps = { ...defaultProps, ...props };

  return render(
    <ChakraProvider>
      <TransactionCard {...mergedProps} />
    </ChakraProvider>,
  );
};

describe("TransactionCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders basic transaction information correctly", () => {
    renderTransactionCard();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Weekly shopping")).toBeInTheDocument();
  });

  it("shows account name when showAccountName is true", () => {
    renderTransactionCard({ showAccountName: true });
    expect(screen.getByText("Test Bank")).toBeInTheDocument();
  });

  it("renders tags when transaction has tags", () => {
    renderTransactionCard({ isExpanded: true });
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("expands transaction details when clicked", async () => {
    const mockToggleExpand = vi.fn();
    renderTransactionCard({
      isExpanded: true,
      toggleExpand: mockToggleExpand,
    });

    const cardElement = screen.getByText("Groceries").closest("div");
    await userEvent.click(cardElement!);

    expect(mockToggleExpand).toHaveBeenCalledOnce();
  });

  describe("Split Transaction", () => {
    const mockSplitTransactions = [
      {
        split_id: "split1",
        category_name: "Fruits",
        debit: 25.0,
        notes: "Apples and bananas",
      },
      {
        split_id: "split2",
        category_name: "Vegetables",
        debit: 25.0,
      },
    ];

    it("shows split transaction button when transaction is split", () => {
      renderTransactionCard({
        transaction: mockSplitTransaction,
        isExpanded: true,
      });
      expect(screen.getByText("View Split Details")).toBeInTheDocument();
    });

    it("fetches split transactions when split details button is clicked", async () => {
      const mockFetchSplitTransactions = vi.fn();
      renderTransactionCard({
        transaction: mockSplitTransaction,
        isExpanded: true,
        fetchSplitTransactions: mockFetchSplitTransactions,
      });

      const splitDetailsButton = screen.getByText("View Split Details");
      await userEvent.click(splitDetailsButton);

      expect(mockFetchSplitTransactions).toHaveBeenCalledWith(
        mockSplitTransaction.transaction_id,
      );
    });

    it("renders split transactions when available", () => {
      renderTransactionCard({
        transaction: mockSplitTransaction,
        isExpanded: true,
        splitTransactions: mockSplitTransactions,
      });

      expect(screen.getByText("Fruits")).toBeInTheDocument();
      expect(screen.getByText("Vegetables")).toBeInTheDocument();
      expect(screen.getByText("Apples and bananas")).toBeInTheDocument();
    });
  });

  describe("Transfer Transaction", () => {
    const mockTransferDetails = {
      destination_account_name: "Savings Account",
      source_account_name: "Checking Account",
      destination_ledger_name: "UK",
      source_ledger_name: "UK",
    };

    it("shows transfer details button when transaction is a transfer", () => {
      renderTransactionCard({
        transaction: mockTransferTransaction,
        isExpanded: true,
      });
      expect(screen.getByText("View Transfer Details")).toBeInTheDocument();
    });

    it("fetches transfer details when transfer details button is clicked", async () => {
      const mockFetchTransferDetails = vi.fn();
      renderTransactionCard({
        transaction: mockTransferTransaction,
        isExpanded: true,
        fetchTransferDetails: mockFetchTransferDetails,
      });

      const transferDetailsButton = screen.getByText("View Transfer Details");
      await userEvent.click(transferDetailsButton);

      expect(mockFetchTransferDetails).toHaveBeenCalledWith(
        mockTransferTransaction.transfer_id,
      );
    });

    it("renders transfer details when available", () => {
      renderTransactionCard({
        transaction: mockTransferTransaction,
        isExpanded: true,
        transferDetails: mockTransferDetails,
      });

      expect(screen.getByText("Transferred from:")).toBeInTheDocument();
      expect(screen.getByText("Checking Account")).toBeInTheDocument();
      expect(screen.getByText("UK")).toBeInTheDocument();
    });
  });

  describe("Delete Transaction", () => {
    it("opens delete confirmation modal when delete icon is clicked", async () => {
      renderTransactionCard({ isExpanded: true });

      const deleteButton = screen.getAllByTestId(
        "transactioncard-delete-icon",
      )[0];
      await userEvent.click(deleteButton);

      expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete this transaction?"),
      ).toBeInTheDocument();
    });

    it("calls onDeleteTransaction when delete is confirmed", async () => {
      const mockOnDeleteTransaction = vi.fn().mockResolvedValue(undefined);
      renderTransactionCard({
        isExpanded: true,
        onDeleteTransaction: mockOnDeleteTransaction,
      });

      const deleteButton = screen.getAllByTestId(
        "transactioncard-delete-icon",
      )[0];
      await userEvent.click(deleteButton);

      const confirmDeleteButton = screen.getByRole("button", {
        name: /delete/i,
      });
      await userEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mockOnDeleteTransaction).toHaveBeenCalledWith(
          mockBaseTransaction.transaction_id,
        );
      });
    });
  });
});
