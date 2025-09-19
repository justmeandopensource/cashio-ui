import React from "react";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Layout from "../../components/Layout";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import SystemBackup from "./SystemBackup";
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
      <PageHeader
        title="User Profile"
        subtitle="Manage your account details and security"
        icon={User}
      />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <Box borderRadius="lg" boxShadow="lg" bg="white" overflow="hidden">
            <Tabs
              variant="soft-rounded"
              colorScheme="teal"
              size={{ base: "sm", md: "md" }}
            >
              <Box
                p={{ base: 2, md: 4 }}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <TabList
                  minW={{ base: "auto", md: "auto" }}
                  borderBottom="none"
                  justifyContent={{ base: "space-around", md: "flex-start" }}
                >
                  <Tab
                    px={{ base: 2, md: 6 }}
                    py={3}
                    fontWeight="medium"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    flex={{ base: 1, md: "none" }}
                    _selected={{
                      color: "teal.700",
                      bg: "teal.50",
                      fontWeight: "semibold",
                      border: "1px solid",
                      borderColor: "teal.400",
                    }}
                    _hover={{
                      bg: "teal.25",
                    }}
                  >
                    Account Details
                  </Tab>
                  <Tab
                    px={{ base: 2, md: 6 }}
                    py={3}
                    fontWeight="medium"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    flex={{ base: 1, md: "none" }}
                    _selected={{
                      color: "teal.700",
                      bg: "teal.50",
                      fontWeight: "semibold",
                      border: "1px solid",
                      borderColor: "teal.400",
                    }}
                    _hover={{
                      bg: "teal.25",
                    }}
                  >
                    Security
                  </Tab>
                  <Tab
                    px={{ base: 2, md: 6 }}
                    py={3}
                    fontWeight="medium"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    flex={{ base: 1, md: "none" }}
                    _selected={{
                      color: "teal.700",
                      bg: "teal.50",
                      fontWeight: "semibold",
                      border: "1px solid",
                      borderColor: "teal.400",
                    }}
                    _hover={{
                      bg: "teal.25",
                    }}
                  >
                    System
                  </Tab>
                </TabList>
              </Box>
              <TabPanels>
                <TabPanel p={{ base: 2, md: 4 }}>
                  <UpdateProfileForm />
                </TabPanel>
                <TabPanel p={{ base: 2, md: 4 }}>
                  <ChangePasswordForm />
                </TabPanel>
                <TabPanel p={{ base: 2, md: 4 }}>
                  <SystemBackup />
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
