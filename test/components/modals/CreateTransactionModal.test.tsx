import CreateTransactionModal from "@/components/modals/CreateTransactionModal";
import { ChakraProvider } from "@chakra-ui/react";
import {
  accountHandlers,
  categoryHandlers,
  transactionHandlers,
} from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnClose = vi.fn();
const mockOnTransactionAdded = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe("CreateTransactionModal Component", () => {
  beforeEach(() => {
    resetTestState();
    mockOnClose.mockReset();
    mockOnTransactionAdded.mockReset();
    mockToast.mockReset();
  });

  const renderCreateTransactionModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      ledgerId: "1",
      accountId: "3",
      currencySymbol: "£",
      onTransactionAdded: mockOnTransactionAdded,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <ChakraProvider>
        <CreateTransactionModal {...mergedProps} />
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders the modal when isOpen is true", () => {
    renderCreateTransactionModal();
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Transaction/i }),
    ).toBeInTheDocument();
  });

  it("does not render the modal when isOpen is false", () => {
    renderCreateTransactionModal({ isOpen: false });
    expect(screen.queryByText("Add Transaction")).not.toBeInTheDocument();
    expect(screen.queryByText("Expense")).not.toBeInTheDocument();
    expect(screen.queryByText("Income")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Save Transaction/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = renderCreateTransactionModal();
    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("switches between expense and income tabs", async () => {
    renderCreateTransactionModal();
    expect(screen.getByText("Expense")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(screen.getByText("Income"));
    expect(screen.getByText("Income")).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByText("Expense"));
    expect(screen.getByText("Expense")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("sets date field with current date when the modal is opened", async () => {
    renderCreateTransactionModal();
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/");
    await waitFor(() => {
      const dateInput = screen.getByTestId(
        "createtransactionmodal-date-picker",
      );
      expect(dateInput).toHaveValue(currentDate);
    });
  });

  it("sets default focus on amount field", () => {
    renderCreateTransactionModal();
    expect(screen.getByLabelText("Amount")).toHaveFocus();
  });

  it("hides account dropdown when account id is passed", () => {
    renderCreateTransactionModal();
    expect(
      screen.queryByTestId("createtransactionmodal-account-dropdown"),
    ).not.toBeInTheDocument();
  });

  it("shows account dropdown with non group asset and liabilities accounts when account id is null", async () => {
    server.use(accountHandlers.getAccountsWithData);
    renderCreateTransactionModal({ accountId: undefined });
    await waitFor(() => {
      expect(
        screen.getByTestId("createtransactionmodal-account-dropdown"),
      ).toBeInTheDocument();
      expect(screen.getByText("Test Bank 1")).toBeInTheDocument();
      expect(screen.getByText("Test Bank 2")).toBeInTheDocument();
      expect(screen.getByText("Test Credit Card 1")).toBeInTheDocument();
      expect(screen.queryByText("Current Accounts")).not.toBeInTheDocument();
      expect(screen.queryByText("Credit Cards")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when accounts fetching fails", async () => {
    server.use(accountHandlers.getAccountsError);
    renderCreateTransactionModal({ accountId: undefined });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch accounts.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("disables split transaction toggle when amount is empty and enables it when amount is filled", async () => {
    renderCreateTransactionModal();
    const splitToggle = screen.getByRole("checkbox");
    expect(splitToggle).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Amount"), "100");
    expect(splitToggle).toBeEnabled();
  });

  it("shows category dropdown with non group income and expense categories", async () => {
    server.use(categoryHandlers.getCategoriesWithData);
    renderCreateTransactionModal();
    await waitFor(() => {
      expect(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
      ).toBeInTheDocument();
      expect(screen.getByText("Water")).toBeInTheDocument();
      expect(screen.getByText("Test Company")).toBeInTheDocument();
      expect(screen.queryByText("Salary")).not.toBeInTheDocument();
      expect(screen.queryByText("Utilities")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when categories fetching fails", async () => {
    server.use(categoryHandlers.getCategoriesError);
    renderCreateTransactionModal();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch categories.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  describe("income transaction tests", () => {
    it("adds a new income transaction successfully when account id is passed", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addIncomeTransactionSuccess);
      const { user } = renderCreateTransactionModal();

      await user.click(screen.getByText("Income"));
      await user.type(screen.getByLabelText("Amount"), "50.75");

      await waitFor(() => {
        expect(
          screen.getByTestId("createtransactionmodal-category-dropdown"),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
        "Test Company",
      );

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction added successfully.",
          }),
        );
      });
      expect(mockOnTransactionAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("adds a new income transaction successfully when account id is null", async () => {
      server.use(accountHandlers.getAccountsWithData);
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addIncomeTransactionSuccess);
      const { user } = renderCreateTransactionModal({ accountId: undefined });

      await user.click(screen.getByText("Income"));
      await user.type(screen.getByLabelText("Amount"), "50.75");

      await waitFor(() => {
        expect(
          screen.getByTestId("createtransactionmodal-account-dropdown"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("createtransactionmodal-category-dropdown"),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-account-dropdown"),
        "Test Bank 1",
      );
      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
        "Test Company",
      );

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction added successfully.",
          }),
        );
      });
      expect(mockOnTransactionAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("adds a new income transaction with one split successfully", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addIncomeTransactionSuccess);
      const { user } = renderCreateTransactionModal();

      await user.click(screen.getByText("Income"));
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.click(screen.getByRole("checkbox"));

      await waitFor(() => {
        expect(screen.getByText("Split Details")).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("formsplits-category-dropdown"),
        "Test Company",
      );

      const notesInputs = screen.getAllByLabelText("Notes");
      await user.type(notesInputs[0], "Salary");

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction added successfully.",
          }),
        );
      });
      expect(mockOnTransactionAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("shows error toast when adding an income transaction fails", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addIncomeTransactionError);
      const { user } = renderCreateTransactionModal();

      await user.click(screen.getByText("Income"));
      await user.type(screen.getByLabelText("Amount"), "50.75");

      await waitFor(() => {
        expect(
          screen.getByTestId("createtransactionmodal-category-dropdown"),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
        "Test Company",
      );

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction failed",
          }),
        );
      });
      expect(mockOnTransactionAdded).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("expense transaction tests", () => {
    it("adds a new expense transaction successfully when account id is passed", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addExpenseTransactionSuccess);
      const { user } = renderCreateTransactionModal();

      await user.type(screen.getByLabelText("Amount"), "50.75");

      await waitFor(() => {
        expect(
          screen.getByTestId("createtransactionmodal-category-dropdown"),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
        "Water",
      );

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction added successfully.",
          }),
        );
      });
      expect(mockOnTransactionAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("adds a new expense transaction successfully when account id is null", async () => {
      server.use(accountHandlers.getAccountsWithData);
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addExpenseTransactionSuccess);
      const { user } = renderCreateTransactionModal({ accountId: undefined });

      await user.type(screen.getByLabelText("Amount"), "50.75");

      await waitFor(() => {
        expect(
          screen.getByTestId("createtransactionmodal-account-dropdown"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("createtransactionmodal-category-dropdown"),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-account-dropdown"),
        "Test Credit Card 1",
      );
      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
        "Water",
      );

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction added successfully.",
          }),
        );
      });
      expect(mockOnTransactionAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("adds a new expense transaction with one split successfully", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addExpenseTransactionSuccess);
      const { user } = renderCreateTransactionModal();

      await user.type(screen.getByLabelText("Amount"), "100");
      await user.click(screen.getByRole("checkbox"));

      await waitFor(() => {
        expect(screen.getByText("Split Details")).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("formsplits-category-dropdown"),
        "Water",
      );

      const notesInputs = screen.getAllByLabelText("Notes");
      await user.type(notesInputs[0], "Split water bill");

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction added successfully.",
          }),
        );
      });
      expect(mockOnTransactionAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("shows error toast when adding an expense transaction fails", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      server.use(transactionHandlers.addExpenseTransactionError);
      const { user } = renderCreateTransactionModal();

      await user.type(screen.getByLabelText("Amount"), "50.75");

      await waitFor(() => {
        expect(
          screen.getByTestId("createtransactionmodal-category-dropdown"),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
        "Water",
      );

      await user.click(
        screen.getByRole("button", { name: /Save Transaction/i }),
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Transaction failed",
          }),
        );
      });
      expect(mockOnTransactionAdded).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("disables save transaction button when amount is empty and rest filled", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(categoryHandlers.getCategoriesWithData);
    const { user } = renderCreateTransactionModal({ accountId: undefined });

    await waitFor(() => {
      expect(
        screen.getByTestId("createtransactionmodal-account-dropdown"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
      ).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByTestId("createtransactionmodal-account-dropdown"),
      "Test Credit Card 1",
    );
    await user.selectOptions(
      screen.getByTestId("createtransactionmodal-category-dropdown"),
      "Water",
    );

    expect(
      screen.getByRole("button", { name: /Save Transaction/i }),
    ).toBeDisabled();
  });

  it("disables save transaction button when category is not selected and rest filled", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(categoryHandlers.getCategoriesWithData);
    const { user } = renderCreateTransactionModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "50.75");

    await waitFor(() => {
      expect(
        screen.getByTestId("createtransactionmodal-account-dropdown"),
      ).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByTestId("createtransactionmodal-account-dropdown"),
      "Test Credit Card 1",
    );

    expect(
      screen.getByRole("button", { name: /Save Transaction/i }),
    ).toBeDisabled();
  });

  it("disables save transaction button when account is not selected and rest filled", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(categoryHandlers.getCategoriesWithData);
    const { user } = renderCreateTransactionModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "50.75");

    await waitFor(() => {
      expect(
        screen.getByTestId("createtransactionmodal-category-dropdown"),
      ).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByTestId("createtransactionmodal-category-dropdown"),
      "Water",
    );

    expect(
      screen.getByRole("button", { name: /Save Transaction/i }),
    ).toBeDisabled();
  });

  it("disables save transaction button when split category is not selected and rest filled", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(categoryHandlers.getCategoriesWithData);
    const { user } = renderCreateTransactionModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "100");
    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(
        screen.getByTestId("createtransactionmodal-account-dropdown"),
      ).toBeInTheDocument();
      expect(screen.getByText("Split Details")).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByTestId("createtransactionmodal-account-dropdown"),
      "Test Credit Card 1",
    );

    expect(
      screen.getByRole("button", { name: /Save Transaction/i }),
    ).toBeDisabled();
  });

  it("disables save transaction button when account is not selected and rest filled including valid split inputs", async () => {
    server.use(accountHandlers.getAccountsWithData);
    server.use(categoryHandlers.getCategoriesWithData);
    const { user } = renderCreateTransactionModal({ accountId: undefined });

    await user.type(screen.getByLabelText("Amount"), "100");
    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(screen.getByText("Split Details")).toBeInTheDocument();
      expect(
        screen.getByTestId("formsplits-category-dropdown"),
      ).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByTestId("formsplits-category-dropdown"),
      "Water",
    );

    expect(
      screen.getByRole("button", { name: /Save Transaction/i }),
    ).toBeDisabled();
  });

  it("hides main category dropdown when split transaction toggle selected", async () => {
    const { user } = renderCreateTransactionModal();

    await user.type(screen.getByLabelText("Amount"), "100");
    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(screen.getByText("Split Details")).toBeInTheDocument();
      expect(
        screen.getByTestId("formsplits-category-dropdown"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("createtransactionmodal-category-dropdown"),
      ).not.toBeInTheDocument();
    });
  });
});
