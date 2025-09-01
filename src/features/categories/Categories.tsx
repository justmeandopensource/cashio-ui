import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/Layout";
import CategoriesMain from "@features/categories/components/CategoriesMain";

const Categories: React.FC = () => {
  const navigate = useNavigate();

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <CategoriesMain />
    </Layout>
  );
};

export default Categories;
