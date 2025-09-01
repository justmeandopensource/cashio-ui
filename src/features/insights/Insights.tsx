import { useNavigate } from "react-router-dom";
import Layout from "@components/Layout";
import InsightsMain from "./components/InsightsMain";

const Insights = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <InsightsMain />
    </Layout>
  );
};

export default Insights;
