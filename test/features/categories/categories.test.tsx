import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  mockLocalStorage,
  mockNavigate,
  resetTestState,
} from "@test/mocks/utils";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@test/mocks/server";
import Categories from "@/features/categories/Categories";
import { authHandlers, categoryHandlers } from "@test/mocks/handlers";

const mockToast = vi.fn();
vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe("Categories Component", () => {
  beforeEach(() => {
    resetTestState();
    mockToast.mockReset();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderCategoriesComponent = () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/categories"]}>
            <Routes>
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>,
    );

    return {
      user: userEvent.setup(),
    };
  };

  describe("Authentication Tests", () => {
    it("redirects to login page if access token is missing", async () => {
      // Remove access token from local storage
      mockLocalStorage.clear();
      renderCategoriesComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("redirects to login page when access token is invalid", async () => {
      // Mock an invalid access token in localStorage
      mockLocalStorage.setItem("access_token", "invalid_access_token");
      server.use(authHandlers.verifyTokenInvalid);
      renderCategoriesComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Categories Rendering", () => {
    beforeEach(() => {
      mockLocalStorage.setItem("access_token", "mock-access-token");
      server.use(authHandlers.verifyTokenSuccess);
    });

    it("renders income and expense categories correctly", async () => {
      server.use(categoryHandlers.getCategoriesWithData);
      renderCategoriesComponent();

      await waitFor(() => {
        expect(screen.getByText("Income Categories")).toBeInTheDocument();
        expect(screen.getByText("Expense Categories")).toBeInTheDocument();

        expect(screen.getByText("Utilities")).toBeInTheDocument();
        expect(screen.getByText("Water")).toBeInTheDocument();
        expect(screen.getByText("Salary")).toBeInTheDocument();
      });
    });

    it("displays empty state when no categories exist", async () => {
      server.use(categoryHandlers.getCategoriesEmpty);
      renderCategoriesComponent();

      await waitFor(() => {
        const noIncomeCategoryText = screen.getByText(
          "No Income Categories Found",
        );
        const noExpenseCategoryText = screen.getByText(
          "No Expense Categories Found",
        );

        expect(noIncomeCategoryText).toBeInTheDocument();
        expect(noExpenseCategoryText).toBeInTheDocument();
      });
    });

    it("handles API error when fetching categories", async () => {
      server.use(categoryHandlers.getCategoriesError);
      renderCategoriesComponent();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: "Failed to fetch categories.",
          }),
        );
      });
    });
  });
});
