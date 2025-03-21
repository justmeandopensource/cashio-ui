import CreateLedgerModal from "@/components/modals/CreateLedgerModal";
import { ChakraProvider } from "@chakra-ui/react";
import { resetTestState } from "@test/mocks/utils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnClose = vi.fn();
const mockHandleCreateLedger = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe("CreateLedgerModal Component", () => {
  beforeEach(() => {
    resetTestState();
    mockHandleCreateLedger.mockReset();
    mockOnClose.mockReset();
  });

  const renderCreateLedgerModal = (isOpen = true) => {
    render(
      <ChakraProvider>
        <CreateLedgerModal
          isOpen={isOpen}
          onClose={mockOnClose}
          handleCreateLedger={mockHandleCreateLedger}
        />
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders when isOpen is true", () => {
    renderCreateLedgerModal();
    expect(screen.getByText("Create New Ledger")).toBeInTheDocument();
    expect(screen.getByLabelText(/Ledger Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderCreateLedgerModal(false);
    expect(screen.queryByText("Create New Ledger")).not.toBeInTheDocument();
  });

  it("updates ledger name input value when typed", async () => {
    const { user } = renderCreateLedgerModal();
    const input = screen.getByLabelText(/Ledger Name/i);
    await user.type(input, "Test Ledger");
    expect(input).toHaveValue("Test Ledger");
  });

  it("calls handleCreateLedger with correct values when form is filled and submitted", async () => {
    const { user } = renderCreateLedgerModal();

    await user.type(screen.getByLabelText(/Ledger Name/i), "Test Ledger");
    const select = screen.getByLabelText(/Currency/i);
    await user.selectOptions(select, "£ - GBP (British Pound)");

    await user.click(screen.getByRole("button", { name: /Create/i }));

    expect(mockHandleCreateLedger).toHaveBeenCalledWith("Test Ledger", "£");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows warning toast when form is submitted without required fields", async () => {
    const { user } = renderCreateLedgerModal();

    await user.click(screen.getByRole("button", { name: /Create/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Please enter both ledger name and select a currency.",
      }),
    );

    expect(mockHandleCreateLedger).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows warning toast when only ledger name is provided", async () => {
    const { user } = renderCreateLedgerModal();

    await user.type(screen.getByLabelText(/Ledger Name/i), "Test Ledger");

    await user.click(screen.getByRole("button", { name: /Create/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Please enter both ledger name and select a currency.",
      }),
    );
    expect(mockHandleCreateLedger).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows warning toast when only currency is selected", async () => {
    const { user } = renderCreateLedgerModal();

    const select = screen.getByLabelText(/Currency/i);
    await user.selectOptions(select, "$ - USD (US Dollar)");
    await user.click(screen.getByRole("button", { name: /Create/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Please enter both ledger name and select a currency.",
      }),
    );
    expect(mockHandleCreateLedger).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = renderCreateLedgerModal();
    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
