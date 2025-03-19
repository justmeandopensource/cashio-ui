import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  mockLocalStorage,
  mockNavigate,
  resetTestState,
} from "@test/mocks/utils";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@test/mocks/server";
import { authHandlers } from "@test/mocks/handlers";
import Ledger from "@/features/ledger/Ledger";

describe("Ledger Component", () => {
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

  const renderLedgerComponent = () => {
    render(
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/ledger/1"]}>
            <Routes>
              <Route path="/ledger/:ledgerId" element={<Ledger />} />
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
      renderLedgerComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    it("redirects to login page when access token is invalid", async () => {
      // Mock an invalid access token in localStorage
      mockLocalStorage.setItem("access_token", "invalid_acess_token");
      server.use(authHandlers.verifyTokenInvalid);
      renderLedgerComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });
});
