import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Text,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverFooter,
  VStack,
  Link as ChakraLink,
  HStack,
  Divider,
  useColorModeValue,
  Icon,
  Button,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronUp } from "lucide-react";
import { VERSION } from "../../version";

interface UserProfile {
  full_name: string;
  email: string;
  // Add other user properties as needed
}

interface UserProfileDisplayProps {
  handleLogout: () => void;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/user/me");
  return response.data;
};

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  handleLogout,
}) => {
  const navigate = useNavigate();
  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);

  // Modern color scheme
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const avatarBg = useColorModeValue("teal.500", "teal.600");

  useEffect(() => {
    const measureTriggerWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    };

    measureTriggerWidth();

    // Re-measure on window resize
    window.addEventListener("resize", measureTriggerWidth);
    return () => window.removeEventListener("resize", measureTriggerWidth);
  }, [userProfile]);

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Box
        p={3}
        borderRadius="md"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={3}>
          <Box width="40px" height="40px" borderRadius="md" bg={hoverBg} />
          <Box flex="1">
            <Box height="16px" bg={hoverBg} borderRadius="md" mb={1} />
            <Box height="12px" bg={hoverBg} borderRadius="md" width="70%" />
          </Box>
        </HStack>
      </Box>
    );
  }

  if (isError || !userProfile) {
    return (
      <Box
        p={3}
        borderRadius="md"
        bg={cardBg}
        border="1px solid"
        borderColor="red.200"
        color="red.600"
        textAlign="center"
      >
        <Text fontSize="sm">Error loading profile</Text>
      </Box>
    );
  }

  return (
      <Popover placement="top" isLazy onOpen={() => setTimeout(() => (document.activeElement as HTMLElement)?.blur(), 0)}>
        <PopoverTrigger>
          <Button
            ref={triggerRef}
            variant="ghost"
            p={3}
            height="auto"
            borderRadius="md"
            bg="transparent"
            border="1px solid"
            borderColor={borderColor}
            _hover={{
              bg: hoverBg,
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            _active={{ transform: "translateY(0)" }}
            _focus={{ outline: "none", ring: 0, borderColor: borderColor }}
            transition="all 0.2s ease"
            width="full"
            justifyContent="flex-start"
            tabIndex={-1}
            sx={{ "&:focus": { outline: "none" } }}
          >
          <HStack spacing={3} width="full">
            <Avatar
              size="sm"
              name={userProfile.full_name}
              src=""
              getInitials={getInitials}
              bg={avatarBg}
              borderRadius="md"
              color="white"
              fontWeight="bold"
              fontSize="sm"
            />

            <Box flex="1" textAlign="left" minWidth="0">
              <Text
                fontWeight="semibold"
                fontSize="sm"
                color={textColor}
                noOfLines={1}
              >
                {userProfile.full_name}
              </Text>
              <Text fontSize="xs" color={secondaryTextColor} noOfLines={1}>
                {userProfile.email}
              </Text>
            </Box>

            <Icon
              as={ChevronUp}
              boxSize={4}
              color={secondaryTextColor}
              opacity={0.7}
            />
          </HStack>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        bg={bgColor}
        borderColor="transparent"
        boxShadow="rgba(0, 0, 0, 0.1) 0px 4px 12px"
        borderRadius="xl"
        border="none"
        width={triggerWidth > 0 ? `${triggerWidth}px` : "240px"}
        maxWidth="none"
        overflow="hidden"
        autoFocus={false}
        tabIndex={-1}
        _focus={{ outline: "none" }}
        style={{ outline: "none" }}
        css={{
          "--popper-arrow-shadow-color": "transparent",
        }}
        sx={{ "&:focus": { outline: "none" } }}
      >
        <PopoverArrow bg={bgColor} shadow="none" border="none" />

        <PopoverBody p={0} pt={4}>
          <VStack align="stretch" spacing={0}>
            <ChakraLink
              onClick={() => navigate("/profile")}
              display="flex"
              alignItems="center"
              px={4}
              py={3}
              color={textColor}
              fontWeight="medium"
              fontSize="sm"
              tabIndex={-1}
              _hover={{ bg: hoverBg }}
              transition="all 0.2s"
            >
              <Icon as={User} boxSize={4} mr={3} color="teal.500" />
              Profile Settings
            </ChakraLink>

            <Divider borderColor={borderColor} />

            <ChakraLink
              onClick={handleLogout}
              display="flex"
              alignItems="center"
              px={4}
              py={3}
              color="red.500"
              fontWeight="medium"
              fontSize="sm"
              tabIndex={-1}
              _hover={{ bg: "red.50", color: "red.600" }}
              transition="all 0.2s"
            >
              <Icon as={LogOut} boxSize={4} mr={3} />
              Sign Out
            </ChakraLink>
          </VStack>
        </PopoverBody>

        <PopoverFooter
          px={4}
          py={3}
          bg={cardBg}
          borderTop="1px solid"
          borderColor={borderColor}
        >
          <Text fontSize="xs" color={secondaryTextColor}>
            Version {VERSION}
          </Text>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfileDisplay;
