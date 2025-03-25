import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import FormSplits from "@/components/modals/CreateTransactionModal/FormSplits";

const mockCategories = [
  { category_id: "1", name: "Salary", type: "income" },
  { category_id: "2", name: "Freelance", type: "income" },
  { category_id: "3", name: "Groceries", type: "expense" },
  { category_id: "4", name: "Rent", type: "expense" },
];

describe("FormSplits Component", () => {
  const defaultProps = {
    splits: [{ amount: 100, categoryId: "1", notes: "" }],
    calculateRemainingAmount: vi.fn(() => 0),
    currencySymbol: "$",
    amount: 100,
    type: "income" as "income",
    categories: mockCategories,
    setSplits: vi.fn(),
    borderColor: "gray.200",
    bgColor: "white",
    highlightColor: "gray.50",
    buttonColorScheme: "blue",
  };

  it("renders the component with initial split", () => {
    render(<FormSplits {...defaultProps} />);

    // Check main elements
    expect(screen.getByText("Split Details")).toBeInTheDocument();
    expect(screen.getByText("Total: $100.00")).toBeInTheDocument();

    // Check amount input
    const amountInput = screen.getByPlaceholderText("0.00");
    expect(amountInput).toHaveValue(100);
  });

  it("allows adding a new split when remaining amount exists", () => {
    const customProps = {
      ...defaultProps,
      calculateRemainingAmount: vi.fn(() => 50),
    };

    render(<FormSplits {...customProps} />);

    const addSplitButton = screen.getByText("Add Split");
    expect(addSplitButton).not.toBeDisabled();

    fireEvent.click(addSplitButton);

    expect(customProps.setSplits).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ amount: 100 }),
        expect.objectContaining({ amount: 50, categoryId: "" }),
      ]),
    );
  });

  it("disables add split button when no remaining amount", () => {
    const customProps = {
      ...defaultProps,
      calculateRemainingAmount: vi.fn(() => 0),
      splits: [
        { amount: 100, categoryId: "1", notes: "" },
        { amount: 0, categoryId: "", notes: "" },
      ],
    };

    render(<FormSplits {...customProps} />);

    const addSplitButton = screen.getByText("Add Split");
    expect(addSplitButton).toBeDisabled();
  });

  it("handles split amount change correctly", () => {
    const setSplitsMock = vi.fn();
    const customProps = {
      ...defaultProps,
      setSplits: setSplitsMock,
      amount: 200,
      calculateRemainingAmount: vi.fn(() => 50),
    };

    render(<FormSplits {...customProps} />);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(amountInputs[0], { target: { value: "150" } });

    expect(setSplitsMock).toHaveBeenCalled();
    const lastCall = setSplitsMock.mock.calls[0][0];
    expect(lastCall).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ amount: 150 }),
        expect.objectContaining({ amount: 50 }),
      ]),
    );
  });

  it("removes a split and redistributes amount", () => {
    const setSplitsMock = vi.fn();
    const customProps = {
      ...defaultProps,
      setSplits: setSplitsMock,
      splits: [
        { amount: 50, categoryId: "1", notes: "" },
        { amount: 50, categoryId: "2", notes: "" },
      ],
    };

    render(<FormSplits {...customProps} />);

    const removeSplitButtons = screen.getAllByText("Remove Split");
    fireEvent.click(removeSplitButtons[0]);

    expect(setSplitsMock).toHaveBeenCalled();
    const lastCall = setSplitsMock.mock.calls[0][0];
    expect(lastCall).toEqual([
      expect.objectContaining({ amount: 100, categoryId: "2" }),
    ]);
  });

  it("filters categories based on transaction type", () => {
    render(<FormSplits {...defaultProps} />);

    const categorySelect = screen.getByTestId("formsplits-category-dropdown");
    fireEvent.click(categorySelect);

    const incomeCategories = within(categorySelect)
      .getAllByRole("option")
      .filter((option) => option.textContent !== "Select category");

    expect(incomeCategories).toHaveLength(2);
    expect(incomeCategories[0]).toHaveTextContent("Salary");
    expect(incomeCategories[1]).toHaveTextContent("Freelance");
  });

  it("shows over-allocated warning when total exceeds amount", () => {
    const customProps = {
      ...defaultProps,
      calculateRemainingAmount: vi.fn(() => -50),
    };

    render(<FormSplits {...customProps} />);

    expect(screen.getByText(/Over-allocated by \$50\.00/)).toBeInTheDocument();
  });

  it("prevents removing the last split", () => {
    const setSplitsMock = vi.fn();
    const customProps = {
      ...defaultProps,
      setSplits: setSplitsMock,
      splits: [{ amount: 100, categoryId: "1", notes: "" }],
    };

    render(<FormSplits {...customProps} />);

    const removeSplitButtons = screen.queryAllByText("Remove Split");
    expect(removeSplitButtons).toHaveLength(0);
  });

  it("handles amount prop as string", () => {
    const customProps = {
      ...defaultProps,
      amount: "150.50",
      calculateRemainingAmount: vi.fn(() => 50.5),
    };

    render(<FormSplits {...customProps} />);

    expect(screen.getByText("Total: $150.50")).toBeInTheDocument();
    expect(screen.getByText("$50.50 unallocated")).toBeInTheDocument();
  });

  it("rounds decimal values correctly", () => {
    const setSplitsMock = vi.fn();
    const customProps = {
      ...defaultProps,
      setSplits: setSplitsMock,
      amount: 100,
      calculateRemainingAmount: vi.fn(() => 0),
    };

    render(<FormSplits {...customProps} />);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(amountInputs[0], { target: { value: "33.333" } });

    const lastCall = setSplitsMock.mock.calls[0][0];
    expect(lastCall[0].amount).toBeCloseTo(33.33, 2);
  });
});
