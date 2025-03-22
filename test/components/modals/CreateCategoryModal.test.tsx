import CreateCategoryModal from "@/components/modals/CreateCategoryModal";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { categoryHandlers } from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnClose = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe("CreateCategoryModal Component", () => {
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

  const renderCreateCategoryModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      categoryType: "income" as "income" | "expense",
      parentCategoryId: null,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <CreateCategoryModal {...mergedProps} />
        </ChakraProvider>
      </QueryClientProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders when isOpen is true", () => {
    renderCreateCategoryModal();
    expect(screen.getByText("Create Income Category")).toBeInTheDocument();
    expect(screen.getByLabelText(/Category Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Group Category/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderCreateCategoryModal({ isOpen: false });
    expect(
      screen.queryByText("Create Income Category"),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = renderCreateCategoryModal();
    await user.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("correctly renders income category form", () => {
    renderCreateCategoryModal({ categoryType: "income" });
    expect(screen.getByText("Create Income Category")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g., Salary, Freelance/i),
    ).toBeInTheDocument();
  });

  it("correctly renders expense category form", () => {
    renderCreateCategoryModal({ categoryType: "expense" });
    expect(screen.getByText("Create Expense Category")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g., Groceries, Utilities/i),
    ).toBeInTheDocument();
  });

  it("updates categoryName input value when typed", async () => {
    const { user } = renderCreateCategoryModal();
    const input = screen.getByLabelText(/Category Name/i);
    await user.type(input, "Test Category");
    expect(input).toHaveValue("Test Category");
  });

  it("toggles isGroupCategory checkbox when clicked", async () => {
    const { user } = renderCreateCategoryModal();
    const checkbox = screen.getByRole("checkbox", { name: /Group Category/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("disables create button when account name is empty", async () => {
    const { user } = renderCreateCategoryModal();
    const createBtn = screen.getByRole("button", { name: /Create/i });
    expect(createBtn).toBeDisabled();
    await user.type(screen.getByLabelText(/Category Name/i), "Test Category");
    expect(createBtn).toBeEnabled();
  });

  it("fetches group categories when parentCategoryId is not provided", async () => {
    renderCreateCategoryModal();
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Category (Optional)"),
      ).toBeInTheDocument();
    });
  });

  it("does not fetch group categories when parentCategoryId is provided", async () => {
    renderCreateCategoryModal({ parentCategoryId: "1" });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Category (Optional)"),
      ).not.toBeInTheDocument();
    });
  });

  it("fetches only income group categories for income category creation", async () => {
    renderCreateCategoryModal({ categoryType: "income" });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Category (Optional)"),
      ).toBeInTheDocument();
    });

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("Salary");
  });

  it("fetches only expense group categories for expense category creation", async () => {
    renderCreateCategoryModal({ categoryType: "expense" });
    await waitFor(() => {
      expect(
        screen.queryByText("Parent Category (Optional)"),
      ).toBeInTheDocument();
    });

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("Utilities");
  });

  it("successfully creates category on enter key in category name field when category name is not empty", async () => {
    const { user } = renderCreateCategoryModal();
    const input = screen.getByLabelText(/Category Name/i);
    await user.type(input, "Test Category{enter}");

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Category created successfully.",
        }),
      );
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error toast on enter key in category name field when category name is empty", async () => {
    const { user } = renderCreateCategoryModal();
    const input = screen.getByLabelText(/Category Name/i);
    await user.type(input, "{enter}");

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Please enter a category name.",
        }),
      );
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows success toast when regular category creation is successful", async () => {
    const { user } = renderCreateCategoryModal();

    await user.type(screen.getByLabelText(/Category Name/i), "Test Category");
    await user.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Category created successfully.",
        }),
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows success toast when group category creation is successful", async () => {
    const { user } = renderCreateCategoryModal();

    await user.type(
      screen.getByLabelText(/Category Name/i),
      "Test Group Category",
    );
    await user.click(screen.getByLabelText(/Group Category/i));
    await user.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Category created successfully.",
        }),
      );
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error toast when category creation fails", async () => {
    server.use(categoryHandlers.createCategoryError);
    const { user } = renderCreateCategoryModal();

    await user.type(screen.getByLabelText(/Category Name/i), "Test Account");

    await user.click(screen.getByRole("button", { name: /Create/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to create category",
        }),
      );
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows error toast when fetching group categories fails", async () => {
    server.use(categoryHandlers.getGroupCategoriesError);
    const { user } = renderCreateCategoryModal();

    await user.type(screen.getByLabelText(/Category Name/i), "Test Category");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Create/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Create/i })).toBeDisabled();
    expect(
      screen.getByText("Failed to load group categories. Please try again."),
    ).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
