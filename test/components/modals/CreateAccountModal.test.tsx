import CreateAccountModal from "@/components/modals/CreateAccountModal";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@test/mocks/server";
import { accountHandlers } from "@test/mocks/handlers";

const mockOnClose = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe("CreateAccountModal Component", () => {
  beforeEach(() => {
    resetTestState();
    mockOnClose.mockReset();
    mockToast.mockReset();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderCreateAccountModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      ledgerId: "1",
      accountType: "asset" as "asset" | "liability",
      currencySymbol: "£",
      parentAccountId: null,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <CreateAccountModal {...mergedProps} />
        </ChakraProvider>
      </QueryClientProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders when isOpen is true", () => {
    renderCreateAccountModal();
    expect(screen.getByText("Create Asset Account")).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Group Account$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Opening Balance/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderCreateAccountModal({ isOpen: false });
    expect(screen.queryByText("Create Asset Account")).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = renderCreateAccountModal();
    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("correctly renders asset account form for asset account creation", () => {
    renderCreateAccountModal();
    expect(screen.getByText("Create Asset Account")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g., Cash, Bank Account/i),
    ).toBeInTheDocument();
  });

  it("correctly renders liability account form for liability account creation", () => {
    renderCreateAccountModal({ accountType: "liability" });
    expect(screen.getByText("Create Liability Account")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g., Credit Card, Mortgage/i),
    ).toBeInTheDocument();
  });

  it("updates accountName input value when typed", async () => {
    const { user } = renderCreateAccountModal();
    const input = screen.getByLabelText(/Account Name/i);
    await user.type(input, "Test Account");
    expect(input).toHaveValue("Test Account");
  });

  it("updates openingBalance input value when typed", async () => {
    const { user } = renderCreateAccountModal();
    const input = screen.getByPlaceholderText("0.00");
    await user.type(input, "100");
    expect(input).toHaveValue(100);
  });

  it("toggles isGroupAccount checkbox when clicked", async () => {
    const { user } = renderCreateAccountModal();
    const checkbox = screen.getByRole("checkbox", { name: /Group Account/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("hides opening balance when isGroupAccount checkbox is clicked", async () => {
    const { user } = renderCreateAccountModal();
    const checkbox = screen.getByRole("checkbox", { name: /Group Account/i });
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByPlaceholderText("0.00")).toBeInTheDocument();
    await user.click(checkbox);
    expect(screen.queryByPlaceholderText("0.00")).not.toBeInTheDocument();
  });

  it("disables create button when account name is empty", async () => {
    const { user } = renderCreateAccountModal();
    const createBtn = screen.getByRole("button", { name: /Create/i });
    expect(createBtn).toBeDisabled();
    await user.type(screen.getByLabelText(/Account Name/i), "Test Account");
    expect(createBtn).toBeEnabled();
  });

  it("fetches group accounts when parentAccountId is provided", async () => {
    renderCreateAccountModal();
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });
  });

  it("does not fetch group accounts when parentAccountId is provided", async () => {
    renderCreateAccountModal({ parentAccountId: "1" });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).not.toBeInTheDocument();
    });
  });

  it("fetches only asset group accounts for asset account creation", async () => {
    renderCreateAccountModal({ accountType: "asset" });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("Current Accounts");
  });

  it("fetches only liability group accounts for liability account creation", async () => {
    renderCreateAccountModal({ accountType: "liability" });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Account (Optional)"),
      ).toBeInTheDocument();
    });

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("Credit Cards");
  });

  it("shows success toast when regular account creation is successful", async () => {
    const { user } = renderCreateAccountModal();

    await user.type(screen.getByLabelText(/Account Name/i), "Test Account");
    await user.type(screen.getByLabelText(/Opening Balance/i), "100");

    await user.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Account created successfully.",
        }),
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows success toast when group account creation is successful", async () => {
    const { user } = renderCreateAccountModal();

    await user.type(
      screen.getByLabelText(/Account Name/i),
      "Test Group Account",
    );
    await user.click(screen.getByLabelText(/Group Account/i));

    await user.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Account created successfully.",
        }),
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error toast when account creation fails", async () => {
    server.use(accountHandlers.createAccountError);
    const { user } = renderCreateAccountModal();

    await user.type(screen.getByLabelText(/Account Name/i), "Test Account");
    await user.type(screen.getByLabelText(/Opening Balance/i), "100");

    await user.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to create account",
        }),
      );
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
