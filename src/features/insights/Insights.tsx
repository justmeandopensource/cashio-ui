import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Spinner } from "@chakra-ui/react";
import Layout from "@components/Layout";
import InsightsMain from "./components/InsightsMain";
import config from "@/config";

interface TokenVerificationResponse {
  valid: boolean;
}

const Insights = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get ledgerId from state if coming from ledger page
  const ledgerId = location.state?.ledgerId;

  // Token verification (same pattern as other pages)
  const { isLoading: isTokenVerifying } = useQuery<
    TokenVerificationResponse,
    Error
  >({
    queryKey: ["verifyToken"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return {} as TokenVerificationResponse;
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
    retry: false,
  });

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
      <InsightsMain initialLedgerId={ledgerId} />
    </Layout>
  );
};

export default Insights;
