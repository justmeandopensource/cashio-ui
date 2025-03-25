import FormTags from "@/components/shared/FormTags";
import { ChakraProvider } from "@chakra-ui/react";
import { transactionHandlers } from "@test/mocks/handlers";
import { server } from "@test/mocks/server";
import { resetTestState } from "@test/mocks/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSetTags = vi.fn();

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe.only("FormTags Component", () => {
  beforeEach(() => {
    resetTestState();
    mockSetTags.mockReset();
    mockToast.mockReset();
  });

  const renderFormTags = (props = {}) => {
    const defaultProps = {
      tags: [],
      setTags: mockSetTags,
      borderColor: "gray.200",
      buttonColorScheme: "blue",
    };

    const mergedProps = { ...defaultProps, ...props };

    render(
      <ChakraProvider>
        <FormTags {...mergedProps} />
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  it("renders the component with empty tags", () => {
    renderFormTags();
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("adds a new tag by pressing Enter", async () => {
    const { user } = renderFormTags();
    const input = screen.getByPlaceholderText("Add tags (press Enter)");
    await user.type(input, "anothertag{enter}");
    expect(mockSetTags).toHaveBeenCalledWith([{ name: "anothertag" }]);
  });

  it("renders existing tags", () => {
    const tags = ["existing1", { name: "existing2", tag_id: "123" }];
    renderFormTags({ tags: tags });
    expect(screen.getByText("existing1")).toBeInTheDocument();
    expect(screen.getByText("existing2")).toBeInTheDocument();
  });

  it("fetches tag suggestions on input", async () => {
    server.use(transactionHandlers.getTagsSuggestions);
    const { user } = renderFormTags();

    const input = screen.getByPlaceholderText("Add tags (press Enter)");
    await user.type(input, "empl");

    await waitFor(() => {
      expect(screen.getByText("employer1")).toBeInTheDocument();
      expect(screen.getByText("employer2")).toBeInTheDocument();
      expect(screen.queryByText("leicester")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when fetching tag suggestions fails", async () => {
    server.use(transactionHandlers.getTagsSuggestionsError);
    const { user } = renderFormTags();

    const input = screen.getByPlaceholderText("Add tags (press Enter)");
    await user.type(input, "empl");

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Failed to fetch tag suggestions.",
        }),
      );
    });
  });

  it("does not fetch suggestions for short inputs", async () => {
    server.use(transactionHandlers.getTagsSuggestions);
    const { user } = renderFormTags();

    const input = screen.getByPlaceholderText("Add tags (press Enter)");
    await user.type(input, "em");

    await new Promise((resolve) => setTimeout(resolve, 600));

    await waitFor(() => {
      expect(screen.queryByText("employer1")).not.toBeInTheDocument();
      expect(screen.queryByText("employer2")).not.toBeInTheDocument();
    });
  });

  it("adds a tag from suggestions when clicked", async () => {
    server.use(transactionHandlers.getTagsSuggestions);
    const { user } = renderFormTags();

    const input = screen.getByPlaceholderText("Add tags (press Enter)");
    await user.type(input, "empl");

    await waitFor(() => {
      expect(screen.getByText("employer1")).toBeInTheDocument();
    });

    await user.click(screen.getByText("employer1"));

    expect(mockSetTags).toHaveBeenCalledWith([
      { name: "employer1", tag_id: "4" },
    ]);
    expect(input).toHaveValue("");
  });

  it("removes a tag when close button is clicked", async () => {
    const tags = ["tag1"];
    const { user } = renderFormTags({ tags: tags });
    await user.click(screen.getAllByRole("button", { name: "close" })[0]);
    expect(mockSetTags).toHaveBeenCalledWith([]);
  });
});
