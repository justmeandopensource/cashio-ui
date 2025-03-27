import React, { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "@components/Sidebar";

interface LayoutProps {
  children: ReactNode;
  handleLogout: () => void;
  currentLedgerId?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  handleLogout,
  currentLedgerId,
}) => {
  return (
    <Flex minH="100vh" direction={{ base: "column", md: "row" }}>
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} currentLedgerId={currentLedgerId} />

      {/* Main Content */}
      <Box flex={1} p={{ base: 4, md: 8 }}>
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
