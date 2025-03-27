import TransferFundsModal from "@/components/modals/TransferFundsModal";
import useLedgerStore from "@/components/shared/store";
import { ChakraProvider } from "@chakra-ui/react";
import {
  accountHandlers,
  ledgerHandlers,
  transactionHandlers,
} from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnClose = vi.fn();
const mockOnTransferCompleted = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

vi.mock("@/components/shared/store", () => ({
  default: vi.fn(),
}));

describe("TransferFundsModal Component", () => {
  beforeEach(() => {
    resetTestState();
    mockOnClose.mockReset();
    mockOnTransferCompleted.mockReset();
    mockToast.mockReset();
  });

  (useLedgerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    ledgerId: "1",
    currencySymbol: "£",
  });

  const renderTransferFundsModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      ledgerId: "1",
      accountId: "3",
      currencySymbol: "£",
      onTransferCompleted: mockOnTransferCompleted,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <ChakraProvider>
        <TransferFundsModal {...mergedProps} />
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders the modal when isOpen is true", () => {
    renderTransferFundsModal();
    expect(screen.getByText("Transfer Funds")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Complete Transfer/i }),
    ).toBeInTheDocument();
  });

  it("does not render the modal when isOpen is false", () => {
    renderTransferFundsModal({ isOpen: false });
    expect(screen.queryByText("Transfer Funds")).not.toBeInTheDocument();
    expect(screen.queryByText("Date")).not.toBeInTheDocument();
    expect(screen.queryByText("Amount")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Complete Transfer/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = renderTransferFundsModal();
    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("sets date field with current date when the modal is opened", async () => {
    renderTransferFundsModal();
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/");
    await waitFor(() => {
      const dateInput = screen.getByTestId("transferfundsmodal-date-picker");
      expect(dateInput).toHaveValue(currentDate);
    });
  });

  it("allows date field to be entered manually without picking from date picker", async () => {
    const { user } = renderTransferFundsModal();
    const dateInput = screen.getByTestId("transferfundsmodal-date-picker");
    await user.clear(dateInput);
    await user.type(dateInput, "2025/01/01");
    expect(dateInput).toHaveValue("2025/01/01");
  });

  it("sets default focus on amount field", () => {
    renderTransferFundsModal();
    expect(screen.getByLabelText("Amount")).toHaveFocus();
  });

  it("hides account dropdown when account id is passed", () => {
    renderTransferFundsModal();
    expect(
      screen.queryByTestId("transferfundsmodal-account-dropdown"),
    ).not.toBeInTheDocument();
  });

  it("fetches from accounts when the modal is opened", async () => {
    server.use(accountHandlers.getAccountsWithData);
    renderTransferFundsModal({ accountId: undefined });
    await waitFor(() => {
      const fromAccountDropdown = screen.getByTestId(
        "transferfundsmodal-from-account-dropdown",
      );
      expect(fromAccountDropdown).toBeInTheDocument();
      expect(
        within(fromAccountDropdown).getByText("Test Bank 1"),
      ).toBeInTheDocument();
      expect(
        within(fromAccountDropdown).getByText("Test Bank 2"),
      ).toBeInTheDocument();
      expect(
        within(fromAccountDropdown).getByText("Test Credit Card 1"),
      ).toBeInTheDocument();
      expect(
        within(fromAccountDropdown).queryByText("Current Accounts"),
      ).not.toBeInTheDocument();
      expect(
        within(fromAccountDropdown).queryByText("Credit Cards"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error toast when from accounts fetching fails", async () => {
    server.use(accountHandlers.getAccountsError);
    renderTransferFundsModal({ accountId: undefined });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch accounts.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("toggles different ledger section when the switch is clicked", async () => {
    const { user } = renderTransferFundsModal();

    expect(screen.queryByText("Destination Ledger")).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Destination Ledger")).toBeInTheDocument();
    expect(screen.getByText("Destination Amount")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));
    expect(screen.queryByText("Destination Ledger")).not.toBeInTheDocument();
    expect(screen.queryByText("Destination Amount")).not.toBeInTheDocument();
  });

  it("fetches ledgers when the modal is opened", async () => {
    server.use(ledgerHandlers.getLedgersWithData);
    const { user } = renderTransferFundsModal();

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(screen.getByText("Destination Ledger")).toBeInTheDocument();
    });

    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await waitFor(() => {
      expect(within(toLedgerDropdown).getByText("India")).toBeInTheDocument();
      expect(
        within(toLedgerDropdown).queryByText("UK"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error toast when ledger fetching fails", async () => {
    server.use(ledgerHandlers.getLedgersError);
    renderTransferFundsModal();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch ledgers.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("fetches correct destination accounts for the selected destination ledger", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(ledgerHandlers.getLedgersWithData);
    const { user } = renderTransferFundsModal();
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Destination Ledger")).toBeInTheDocument();
    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await user.selectOptions(toLedgerDropdown, "India");
    const toAccountDropdown = screen.getByTestId(
      "transferfundsmodal-to-account-dropdown",
    );
    await waitFor(() => {
      const options = within(toAccountDropdown).getAllByRole("option");
      expect(options).toHaveLength(2);
      expect(options[1]).toHaveTextContent("Wallet");
    });
  });

  it("shows error toast when destination accounts fetching fails", async () => {
    server.use(accountHandlers.getAccountsError);
    server.use(ledgerHandlers.getLedgersWithData);
    const { user } = renderTransferFundsModal({ accountId: undefined });
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Destination Ledger")).toBeInTheDocument();
    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await user.selectOptions(toLedgerDropdown, "India");
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch accounts.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("disables complete transfer button when required fields are not filled", () => {
    renderTransferFundsModal({ accountId: undefined });
    const saveButton = screen.getByRole("button", {
      name: /Complete Transfer/i,
    });
    expect(saveButton).toBeDisabled();
  });

  it("enables complete transfer button when all required fields are filled for same ledger transfer", async () => {
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderTransferFundsModal({ accountId: undefined });
    await user.type(screen.getByLabelText("Amount"), "100");

    const fromAccountDropdown = await screen.findByTestId(
      "transferfundsmodal-from-account-dropdown",
    );
    await user.selectOptions(fromAccountDropdown, "Test Bank 1");

    const toAccountDropdown = screen.getByTestId(
      "transferfundsmodal-to-account-dropdown",
    );
    await user.selectOptions(toAccountDropdown, "Test Credit Card 1");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", {
        name: /Complete Transfer/i,
      });
      expect(saveButton).not.toBeDisabled();
    });
  });

  it("enables complete transfer button when all required fields are filled for different ledger transfer", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(ledgerHandlers.getLedgersWithData);
    const { user } = renderTransferFundsModal({ accountId: undefined });
    await user.type(screen.getByLabelText("Amount"), "100");

    const fromAccountDropdown = await screen.findByTestId(
      "transferfundsmodal-from-account-dropdown",
    );
    await user.selectOptions(fromAccountDropdown, "Test Bank 1");

    await user.click(screen.getByRole("checkbox"));
    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await user.selectOptions(toLedgerDropdown, "India");
    const toAccountDropdown = screen.getByTestId(
      "transferfundsmodal-to-account-dropdown",
    );
    await user.selectOptions(toAccountDropdown, "Wallet");

    await user.type(screen.getByLabelText("Destination Amount"), "1000");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", {
        name: /Complete Transfer/i,
      });
      expect(saveButton).not.toBeDisabled();
    });
  });

  it("successfully submits a transfer within the same ledger", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(transactionHandlers.transferFundsSuccess);
    const { user } = renderTransferFundsModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "100");

    const fromAccountDropdown = await screen.findByTestId(
      "transferfundsmodal-from-account-dropdown",
    );
    await user.selectOptions(fromAccountDropdown, "Test Bank 1");

    const toAccountDropdown = screen.getByTestId(
      "transferfundsmodal-to-account-dropdown",
    );
    await user.selectOptions(toAccountDropdown, "Test Credit Card 1");

    await user.click(
      screen.getByRole("button", { name: /Complete Transfer/i }),
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Transfer completed successfully.",
        }),
      );
    });

    expect(mockOnTransferCompleted).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("successfully submits a transfer between different ledgers", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(ledgerHandlers.getLedgersWithData);
    server.use(transactionHandlers.transferFundsSuccess);
    const { user } = renderTransferFundsModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "100");

    const fromAccountDropdown = await screen.findByTestId(
      "transferfundsmodal-from-account-dropdown",
    );
    await user.selectOptions(fromAccountDropdown, "Test Bank 1");

    await user.click(screen.getByRole("checkbox"));
    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await user.selectOptions(toLedgerDropdown, "India");

    const toAccountDropdown = screen.getByTestId(
      "transferfundsmodal-to-account-dropdown",
    );
    await user.selectOptions(toAccountDropdown, "Wallet");
    await user.type(screen.getByLabelText("Destination Amount"), "1000");
    await user.click(
      screen.getByRole("button", { name: /Complete Transfer/i }),
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Transfer completed successfully.",
        }),
      );
    });

    expect(mockOnTransferCompleted).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error toast when transfer submission fails", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(transactionHandlers.transferFundsError);
    const { user } = renderTransferFundsModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "100");

    const fromAccountDropdown = await screen.findByTestId(
      "transferfundsmodal-from-account-dropdown",
    );
    await user.selectOptions(fromAccountDropdown, "Test Bank 1");

    const toAccountDropdown = screen.getByTestId(
      "transferfundsmodal-to-account-dropdown",
    );
    await user.selectOptions(toAccountDropdown, "Test Credit Card 1");

    await user.click(
      screen.getByRole("button", { name: /Complete Transfer/i }),
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Transfer failed",
        }),
      );
    });

    expect(mockOnTransferCompleted).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("filters out the from account from the to account dropdown", async () => {
    server.use(accountHandlers.getAccountsWithData);
    const { user } = renderTransferFundsModal({ accountId: undefined });
    const fromAccountDropdown = await screen.findByTestId(
      "transferfundsmodal-from-account-dropdown",
    );
    await user.selectOptions(fromAccountDropdown, "Test Bank 1");
    await waitFor(() => {
      const toAccountDropdown = screen.getByTestId(
        "transferfundsmodal-to-account-dropdown",
      );
      const options = within(toAccountDropdown).getAllByRole("option");
      const accounts = Array.from(options).map((option) => option.textContent);
      expect(accounts).not.toContain("Test Bank 1");
    });
  });

  it("filters out the current ledger from the destination ledger dropdown", async () => {
    server.use(ledgerHandlers.getLedgersWithData);
    const { user } = renderTransferFundsModal();

    await user.click(screen.getByRole("checkbox"));

    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await waitFor(() => {
      const options = within(toLedgerDropdown).getAllByRole("option");
      const ledgers = Array.from(options).map((option) => option.textContent);
      expect(ledgers).not.toContain("UK");
    });
  });

  it("updates destination amount currency symbol when destination ledger is selected", async () => {
    server.use(ledgerHandlers.getLedgersWithData);
    const { user } = renderTransferFundsModal();
    await user.click(screen.getByRole("checkbox"));
    await waitFor(() => {
      expect(screen.getAllByText("£")).toHaveLength(2);
    });
    const toLedgerDropdown = screen.getByTestId(
      "transferfundsmodal-to-ledger-dropdown",
    );
    await user.click(toLedgerDropdown);
    await user.selectOptions(toLedgerDropdown, "India");
    await waitFor(() => {
      expect(screen.getAllByText("£")).toHaveLength(1);
      expect(screen.getAllByText("₹")).toHaveLength(1);
    });
  });
});
