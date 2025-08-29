
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

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <Box>
        <Heading mb={4}>User Profile</Heading>
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
    </Layout>
  );
};

export default Profile;
