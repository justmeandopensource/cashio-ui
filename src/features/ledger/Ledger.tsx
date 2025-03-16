import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Spinner } from "@chakra-ui/react";
import Layout from "@components/Layout";
import LedgerMain from "@features/ledger/components/LedgerMain";
import config from "@/config";

interface TokenVerificationResponse {
  // Define the response shape from verify-token endpoint
  // Add actual properties returned by your API
  valid: boolean;
  // other properties as needed
}

const Ledger = () => {
  const navigate = useNavigate();

  // Token verification
  const { isLoading: isTokenVerifying } = useQuery<
    TokenVerificationResponse,
    Error
  >({
    queryKey: ["verifyToken"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return {} as TokenVerificationResponse; // Type assertion for early return
      }

      const response = await fetch(`${config.apiBaseUrl}/user/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      return response.json();
    },
    retry: false, // Disable retries to avoid infinite loops
  });

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (isTokenVerifying) {
    return (
      <Layout handleLogout={handleLogout}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="teal.500" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout handleLogout={handleLogout}>
      <LedgerMain />
    </Layout>
  );
};

export default Ledger;
