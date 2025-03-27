import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Spinner } from "@chakra-ui/react";
import Layout from "@components/Layout";
import AccountMain from "@features/account/components/AccountMain";
import config from "@/config";

const Account: React.FC = () => {
  const navigate = useNavigate();

  // Function to verify the token
  const verifyToken = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return {};
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
  };

  // Use React Query to handle token verification
  const { isLoading, isError, error } = useQuery<Error>({
    queryKey: ["verifyToken"],
    queryFn: verifyToken,
    retry: false, // Disable retries to avoid multiple redirects
  });

  useEffect(() => {
    if (isError) {
      console.error("Token verification error:", error);
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [isError, error, navigate]);

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <Layout handleLogout={handleLogout}>
      <AccountMain />
    </Layout>
  );
};

export default Account;
