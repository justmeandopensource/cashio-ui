import { useNavigate } from "react-router-dom";
import Layout from "@components/Layout";
import InsightsMain from "./components/InsightsMain";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import { PieChart } from "lucide-react";
import { Box } from "@chakra-ui/react";

const Insights = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <PageHeader title="Insights" subtitle="Visualize your financial data" icon={PieChart} />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <InsightsMain />
        </PageContainer>
      </Box>
    </Layout>
  );
};

export default Insights;
