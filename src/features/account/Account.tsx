import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/Layout";
import AccountMain from "@features/account/components/AccountMain";

const Account: React.FC = () => {
  const navigate = useNavigate();

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <AccountMain />
    </Layout>
  );
};

export default Account;
