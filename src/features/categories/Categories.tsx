import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/Layout";
import CategoriesMain from "@features/categories/components/CategoriesMain";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import { Bookmark } from "lucide-react";
import { Box } from "@chakra-ui/react";

const Categories: React.FC = () => {
  const navigate = useNavigate();

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <PageHeader title="Categories" subtitle="Manage your expense categories" icon={Bookmark} />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <CategoriesMain />
        </PageContainer>
      </Box>
    </Layout>
  );
};

export default Categories;
