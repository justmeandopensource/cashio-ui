
import React from "react";
import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Layout from "../../components/Layout";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { useNavigate } from "react-router-dom";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import { User } from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <PageHeader title="User Profile" subtitle="Manage your account details and security" icon={User} />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <Box>
            <Tabs>
              <TabList>
                <Tab>Account Details</Tab>
                <Tab>Security</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <UpdateProfileForm />
                </TabPanel>
                <TabPanel>
                  <ChangePasswordForm />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </PageContainer>
      </Box>
    </Layout>
  );
};

export default Profile;
