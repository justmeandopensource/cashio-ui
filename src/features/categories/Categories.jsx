import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/Layout";
import CategoriesMain from "@features/categories/components/CategoriesMain";
import config from "@/config";

const Categories = () => {
  const navigate = useNavigate();

  // Token verification
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
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

        const data = await response.json();
        console.log("Token verified:", data);
      } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate]);

  // handle logout
  const handleLogout = () => {
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
