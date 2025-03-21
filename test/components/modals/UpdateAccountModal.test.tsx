import UpdateAccountModal from "@/components/modals/UpdateAccountModal";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { accountHandlers } from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { mockAccounts } from "@test/mocks/testData";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnClose = vi.fn();
const mockOnUpdateCompleted = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

const assetAccount = mockAccounts[1];
const liabilityAccount = mockAccounts[4];
const liabilityAccountNotChild = mockAccounts[6];

describe("UpdateAccountModal Component", () => {
  beforeEach(() => {
    resetTestState();
    mockOnClose.mockReset();
    mockOnUpdateCompleted.mockReset();
    mockToast.mockReset();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderUpdateAccountModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      account: assetAccount,
      currencySymbol: "£",
      onUpdateCompleted: mockOnUpdateCompleted,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <UpdateAccountModal {...mergedProps} />
        </ChakraProvider>
      </QueryClientProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders when isOpen is true", async () => {
    renderUpdateAccountModal();
    expect(screen.getByText("Update Asset Account")).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Opening Balance/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderUpdateAccountModal({ isOpen: false });
    expect(screen.queryByText("Update Asset Account")).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = renderUpdateAccountModal();
    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("correctly renders asset account form for updating asset account", () => {
    renderUpdateAccountModal();
    expect(screen.getByText("Update Asset Account")).toBeInTheDocument();
  });

  it("correctly renders liability account form for updating liability account", () => {
    renderUpdateAccountModal({ account: liabilityAccount });
    expect(screen.getByText("Update Liability Account")).toBeInTheDocument();
  });

  it("updates accountName input value when typed", async () => {
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.clear(input);
    await user.type(input, "Test Account");
    expect(input).toHaveValue("Test Account");
  });

  it("updates openingBalance input value when typed", async () => {
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText("Opening Balance");
    await user.clear(input);
    await user.type(input, "100");
    expect(input).toHaveValue(100);
  });

  it("enables update button only when values changed and account name is non-empty", async () => {
    const { user } = renderUpdateAccountModal();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Update/i }),
      ).toBeInTheDocument();
    });
    const updateBtn = screen.getByRole("button", { name: /Update/i });
    const input = screen.getByLabelText(/Account Name/i);
    await user.clear(input);
    await user.type(input, "Test Account");
    expect(updateBtn).toBeEnabled();
    await user.clear(input);
    expect(updateBtn).toBeDisabled();
  });

  it("shows error toast on pressing enter key when account name is empty", async () => {
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.clear(input);
    await user.type(input, "{enter}");

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Please enter an account name.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows error toast on pressing enter key when values have not changed", async () => {
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.type(input, "{enter}");

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Please update at least one field.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("successfully updates with valid changes", async () => {
    server.use(accountHandlers.updateAccountSuccess);
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.clear(input);
    await user.type(input, "Test Account");
    await user.click(screen.getByRole("button", { name: /Update/i }));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Account updated successfully",
        }),
      );
    });
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnUpdateCompleted).toHaveBeenCalled();
  });

  it("successfully updates with valid changes on enter key in account name field", async () => {
    server.use(accountHandlers.updateAccountSuccess);
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.clear(input);
    await user.type(input, "Test Account{enter}");
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Account updated successfully",
        }),
      );
    });
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnUpdateCompleted).toHaveBeenCalled();
  });

  it("shows error toast when account update fails", async () => {
    server.use(accountHandlers.updateAccountError);
    const { user } = renderUpdateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.clear(input);
    await user.type(input, "Test Account");
    await user.click(screen.getByRole("button", { name: /Update/i }));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to update account",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnUpdateCompleted).not.toHaveBeenCalled();
  });

  it("shows correct parent account in the dropdown for the account which has parent", async () => {
    renderUpdateAccountModal();
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("Current Accounts");
    await waitFor(() => {
      expect(
        screen.getByTestId("updateaccountmodal-parent-account-dropdown"),
      ).toHaveValue("1");
    });
  });

  it("shows only asset group accounts for asset account in parent account dropdown", async () => {
    renderUpdateAccountModal();
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Select parent account");
    expect(options[1]).toHaveTextContent("Current Accounts");
  });

  it("shows only liability group accounts for liability account in parent account dropdown", async () => {
    renderUpdateAccountModal({ account: liabilityAccount });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Select parent account");
    expect(options[1]).toHaveTextContent("Credit Cards");
  });

  it("shows select a parent account in the dropdown when the account does not have a parent", async () => {
    renderUpdateAccountModal({ account: liabilityAccountNotChild });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Select parent account");
    expect(options[1]).toHaveTextContent("Credit Cards");
    await waitFor(() => {
      expect(
        screen.getByTestId("updateaccountmodal-parent-account-dropdown"),
      ).toHaveValue("");
    });
  });

  it("hides parent account dropdown when there are no group accounts", () => {
    server.use(accountHandlers.getGroupAccountsEmptyByType);
    renderUpdateAccountModal({ account: liabilityAccountNotChild });
    expect(
      screen.queryByText("Parent Account (Optional)"),
    ).not.toBeInTheDocument();
  });

  it("shows error toast when fetching group accounts fails", async () => {
    server.use(accountHandlers.getGroupAccountsError);
    renderUpdateAccountModal();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch group accounts",
        }),
      );
    });
  });
});
