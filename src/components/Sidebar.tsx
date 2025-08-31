import React from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Link as ChakraLink,
  Icon,
  useDisclosure,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
} from "@chakra-ui/react";

import { Home, Bookmark, Menu, PieChart, Wallet } from "lucide-react";

import { useNavigate } from "react-router-dom";
import UserProfileDisplay from "./shared/UserProfileDisplay";

interface SidebarProps {
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleLogout }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sidebarBg = useColorModeValue("teal.500", "teal.700");
  const sidebarColor = useColorModeValue("white", "gray.200");
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <Box display={{ base: "block", md: "none" }} p={4}>
        <Button onClick={onOpen} variant="ghost" color="teal.400">
          <Icon as={Menu} />
        </Button>
      </Box>

      {/* Desktop Sidebar */}
      <Box
        w={{ base: "full", md: "250px" }}
        bg={sidebarBg}
        color={sidebarColor}
        p={4}
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        justifyContent="space-between"
        height="100vh"
        position="sticky"
        top={0}
        left={0}
        overflowY="auto"
        flexShrink={0}
      >
        <VStack align="flex-start" spacing={2}>
          <Flex align="center" mb={3}>
            <Icon as={Wallet} boxSize={6} mr={3} />
            <Heading as="h1" size="lg">
              Cashio
            </Heading>
          </Flex>
          <ChakraLink
            display="flex"
            alignItems="center"
            onClick={() => navigate("/")}
            py={2}
            px={4}
            borderRadius="md"
            _hover={{ bg: "teal.600" }}
            _expanded={{ bg: "teal.600" }}
            width="full"
          >
            <Icon as={Home} mr={2} />
            Home
          </ChakraLink>
          <ChakraLink
            display="flex"
            alignItems="center"
            onClick={() => {
              navigate("/insights");
              onClose();
            }}
            py={2}
            px={4}
            borderRadius="md"
            _hover={{ bg: "teal.600" }}
            _expanded={{ bg: "teal.600" }}
            width="full"
          >
            <Icon as={PieChart} mr={2} />
            Insights
          </ChakraLink>
          <ChakraLink
            display="flex"
            alignItems="center"
            onClick={() => navigate("/categories")}
            py={2}
            px={4}
            borderRadius="md"
            _hover={{ bg: "teal.600" }}
            _expanded={{ bg: "teal.600" }}
            width="full"
          >
            <Icon as={Bookmark} mr={2} />
            Manage Categories
          </ChakraLink>
        </VStack>
        {/* User Profile Display */}
        <UserProfileDisplay handleLogout={handleLogout} />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} color={sidebarColor}>
          <DrawerHeader>
            <Flex align="center">
              <Icon as={Wallet} boxSize={6} mr={3} />
              <Heading as="h1" size="lg">
                Cashio
              </Heading>
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Flex direction="column" justify="space-between" h="full">
              <VStack align="flex-start" spacing={2}>
                <ChakraLink
                  display="flex"
                  alignItems="center"
                  onClick={() => {
                    navigate("/");
                    onClose();
                  }}
                  py={2}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: "teal.600" }}
                  _expanded={{ bg: "teal.600" }}
                  width="full"
                >
                  <Icon as={Home} mr={2} />
                  Home
                </ChakraLink>
                <ChakraLink
                  display="flex"
                  alignItems="center"
                  onClick={() => {
                    navigate("/insights");
                    onClose();
                  }}
                  py={2}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: "teal.600" }}
                  _expanded={{ bg: "teal.600" }}
                  width="full"
                >
                  <Icon as={PieChart} mr={2} />
                  Insights
                </ChakraLink>
                <ChakraLink
                  display="flex"
                  alignItems="center"
                  onClick={() => {
                    navigate("/categories");
                    onClose();
                  }}
                  py={2}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: "teal.600" }}
                  _expanded={{ bg: "teal.600" }}
                  width="full"
                >
                  <Icon as={Bookmark} mr={2} />
                  Manage Categories
                </ChakraLink>
              </VStack>
              {/* User Profile Display */}
              <UserProfileDisplay handleLogout={handleLogout} />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
