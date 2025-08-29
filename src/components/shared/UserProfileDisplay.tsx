import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverFooter,
  PopoverCloseButton,
  Button,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import config from "../../config"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
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
  const token = localStorage.getItem("access_token");
  const response = await axios.get(`${config.apiBaseUrl}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  handleLogout,
}) => {
  const navigate = useNavigate();
  const { data: userProfile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [userProfile]); // Recalculate if userProfile changes

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return <Text>Loading user...</Text>;
  }

  if (isError || !userProfile) {
    return <Text>Error loading user profile.</Text>;
  }

  return (
    <Popover placement="top">
      <PopoverTrigger>
        <ChakraLink
          ref={triggerRef}
          display="flex"
          alignItems="center"
          py={2}
          px={4}
          cursor="pointer"
          _hover={{ bg: "teal.600", borderRadius: "md" }}
          _expanded={{ bg: "teal.600", borderRadius: "md" }}
          borderRadius="md"
        >
          <Avatar
            size="sm"
            name={userProfile.full_name}
            src="" // No image, just initials
            getInitials={getInitials}
            bg="teal.600"
            color="white"
          />
          <Box ml={3} textAlign="left">
            <Text fontWeight="bold" color="white" fontSize="md">
              {userProfile.full_name}
            </Text>
            <Text fontSize="sm" color="gray.200">
              {userProfile.email}
            </Text>
          </Box>
        </ChakraLink>
      </PopoverTrigger>
      <PopoverContent bg="teal.50" borderColor="gray.200" boxShadow="lg" width={triggerWidth}>
        <PopoverArrow />
        <PopoverCloseButton />
        
        <PopoverBody>
          <VStack align="flex-start" spacing={2}>
            <ChakraLink
              display="flex"
              alignItems="center"
              color="gray.800"
            >
              <FiUser style={{ marginRight: "8px" }} /> Profile
            </ChakraLink>
            <ChakraLink
              onClick={handleLogout}
              display="flex"
              alignItems="center"
              color="gray.800"
            >
              <FiLogOut style={{ marginRight: "8px" }} /> Log Out
            </ChakraLink>
          </VStack>
        </PopoverBody>
        <PopoverFooter>
          <Text fontSize="xs" color="gray.500">
            Version: {VERSION}
          </Text>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfileDisplay;
