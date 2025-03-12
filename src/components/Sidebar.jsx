import {
  Box,
  Flex,
  VStack,
  Heading,
  Link as ChakraLink,
  Icon,
  Text,
  useDisclosure,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
} from "@chakra-ui/react";

import { FiHome, FiBookmark, FiLogOut, FiMenu } from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { VERSION } from "../version";

const Sidebar = ({ handleLogout }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sidebarBg = useColorModeValue("teal.500", "teal.700");
  const sidebarColor = useColorModeValue("white", "gray.200");
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <Box display={{ base: "block", md: "none" }} p={4}>
        <Button onClick={onOpen} variant="ghost" color="teal.400">
          <Icon as={FiMenu} />
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
        <VStack align="flex-start" spacing={3}>
          <Flex align="baseline">
            <Heading as="h1" size="lg" mb={6} mr={2}>
              Cashio
            </Heading>
            <Text fontSize="sm" color={sidebarColor} opacity={0.8}>
              v{VERSION}
            </Text>
          </Flex>
          <ChakraLink
            display="flex"
            alignItems="center"
            onClick={() => navigate("/")}
          >
            <Icon as={FiHome} mr={2} />
            Home
          </ChakraLink>
          <ChakraLink
            display="flex"
            alignItems="center"
            onClick={() => navigate("/categories")}
          >
            <Icon as={FiBookmark} mr={2} />
            Manage Categories
          </ChakraLink>
          <ChakraLink display="flex" alignItems="center" onClick={handleLogout}>
            <Icon as={FiLogOut} mr={2} />
            Log Out
          </ChakraLink>
        </VStack>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} color={sidebarColor}>
          <DrawerHeader>
            <Flex align="baseline">
              <Heading as="h1" size="lg" mr={2}>
                Cashio
              </Heading>
              <Text fontSize="sm" opacity={0.8}>
                v{VERSION}
              </Text>
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <VStack align="flex-start" spacing={3}>
              <ChakraLink
                display="flex"
                alignItems="center"
                onClick={() => {
                  navigate("/");
                  onClose();
                }}
              >
                <Icon as={FiHome} mr={2} />
                Home
              </ChakraLink>
              <ChakraLink
                display="flex"
                alignItems="center"
                onClick={() => {
                  navigate("/categories");
                  onClose();
                }}
              >
                <Icon as={FiBookmark} mr={2} />
                Manage Categories
              </ChakraLink>
              <ChakraLink
                display="flex"
                alignItems="center"
                onClick={handleLogout}
              >
                <Icon as={FiLogOut} mr={2} />
                Log Out
              </ChakraLink>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
