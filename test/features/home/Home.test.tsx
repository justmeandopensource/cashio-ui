import { resetTestState, setupTestEnvironment } from "@test/mocks/utils";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@test/mocks/server";
import { authHandlers, ledgerHandlers } from "@test/mocks/handlers";

const { mockLocalStorage, mockNavigate } = setupTestEnvironment();

import Home from "@/features/home/Home";
import userEvent from "@testing-library/user-event";

describe("Home Component", () => {
  beforeEach(() => {
    resetTestState();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderHomeComponent = () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="/" element={<Home />} />
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
      renderHomeComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("redirects to login page when access token is invalid", async () => {
      // Mock an invalid access token in localStorage
      mockLocalStorage.setItem("access_token", "invalid_acess_token");
      server.use(authHandlers.verifyTokenInvalid);
      renderHomeComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Ledger Fetching Tests", () => {
    beforeEach(() => {
      mockLocalStorage.setItem("access_token", "mock-access-token");
      server.use(authHandlers.verifyTokenSuccess);
    });

    it("renders error message when ledger fetching fails", async () => {
      server.use(ledgerHandlers.getLedgersError);
      renderHomeComponent();

      await waitFor(() => {
        expect(
          screen.getByText("Error fetching ledgers. Please try again."),
        ).toBeInTheDocument();
      });
    });

    it("displays 'No Ledgers Found' message when no ledgers exist", async () => {
      server.use(ledgerHandlers.getLedgersEmpty);
      renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("No Ledgers Found")).toBeInTheDocument();
        expect(screen.getByText("Create Ledger")).toBeInTheDocument();
      });
    });

    it("displays ledger cards when ledgers exist", async () => {
      server.use(ledgerHandlers.getLedgersWithData);
      renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("My Ledgers")).toBeInTheDocument();
        expect(screen.getByText("UK")).toBeInTheDocument();
        expect(screen.getByText("India")).toBeInTheDocument();
        expect(
          screen.getByTestId("create-ledger-card-with-plus-icon"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Navigation Tests", () => {
    beforeEach(() => {
      mockLocalStorage.setItem("access_token", "mock-access-token");
      server.use(authHandlers.verifyTokenSuccess);
    });

    it("navigates to ledger details when a ledger card is clicked", async () => {
      server.use(ledgerHandlers.getLedgersWithData);
      const { user } = renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("My Ledgers")).toBeInTheDocument();
        expect(screen.getByText("UK")).toBeInTheDocument();
      });

      await user.click(screen.getByText("UK"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/ledger");
      });
    });

    it("opens create ledger modal when create ledger button is clicked", async () => {
      server.use(ledgerHandlers.getLedgersEmpty);
      const { user } = renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("No Ledgers Found")).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /^Create Ledger$/i }),
      );

      await waitFor(() => {
        const modal = screen.getByRole("dialog");
        expect(
          within(modal).getByText("Create New Ledger"),
        ).toBeInTheDocument();
      });
    });

    it("opens create ledger modal when create new ledger button in header is clicked", async () => {
      server.use(ledgerHandlers.getLedgersWithData);
      const { user } = renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("My Ledgers")).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /create new ledger/i }),
      );

      await waitFor(() => {
        const modal = screen.getByRole("dialog");
        expect(
          within(modal).getByText("Create New Ledger"),
        ).toBeInTheDocument();
      });
    });

    it("opens create ledger modal when create ledger card is clicked", async () => {
      server.use(ledgerHandlers.getLedgersWithData);
      const { user } = renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("UK")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("create-ledger-card-with-plus-icon"));

      await waitFor(() => {
        const modal = screen.getByRole("dialog");
        expect(
          within(modal).getByText("Create New Ledger"),
        ).toBeInTheDocument();
      });
    });

    it("renders the sidebar with navigation links", async () => {
      const { user } = renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("Test User")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Test User"));

      await waitFor(() => {
        expect(screen.getByText("Log Out")).toBeInTheDocument();
      });
    });

    it("logs out when the logout button is clicked", async () => {
      const { user } = renderHomeComponent();

      await user.click(screen.getByText("Log Out"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
        expect(mockLocalStorage.getItem("access_token")).toBeNull();
      });
    });

    it("navigates to categories page when 'Manage Categories' is clicked", async () => {
      const { user } = renderHomeComponent();

      await waitFor(() => {
        expect(screen.getByText("Manage Categories")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Manage Categories"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/categories");
      });
    });
  });
});
