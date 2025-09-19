import React, { useEffect } from "react";
import { Save, User, Mail, Calendar, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  VStack,
  Text,
  HStack,
  Icon,
  Divider,
  Card,
  CardBody,
  Heading,
} from "@chakra-ui/react";
import { useUpdateUserProfile, useUserProfile } from "./hooks";
import { UserUpdate } from "./api";

const UpdateProfileForm: React.FC = () => {
  const toast = useToast();
  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UserUpdate>();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUserProfile();

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  const onSubmit = (data: UserUpdate) => {
    updateUser(data, {
      onSuccess: () => {
        toast({
          title: "Profile updated.",
          description: "Your profile has been updated successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: () => {
        toast({
          title: "An error occurred.",
          description: "Unable to update your profile.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  if (isUserLoading) {
    return (
      <Box w="full" px={{ base: 6, md: 8 }} py={{ base: 6, md: 8 }}>
        <VStack spacing={4} py={8}>
          <Box
            w={12}
            h={12}
            borderRadius="full"
            bg="teal.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={User} color="teal.600" boxSize={6} />
          </Box>
          <Text color="gray.600" fontSize="lg">
            Loading your profile...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box w="full">
      <Box px={{ base: 6, md: 8 }} py={{ base: 6, md: 8 }}>
        <VStack spacing={6} align="stretch" mb={8}>
          <Box>
            <Heading size="md">Account Details</Heading>
            <Text mt={2} fontSize="sm" color="gray.500">
              Manage your personal information and account settings.
            </Text>
          </Box>
        </VStack>
        <Box as="form" onSubmit={handleSubmit(onSubmit)} maxW="2xl">
          <VStack spacing={8} align="stretch">
            {/* Form Fields */}
            <Box>
              <VStack spacing={6} align="stretch">
                {/* Username - First Row */}
                <Box
                  display={{ base: "block", lg: "grid" }}
                  gridTemplateColumns="1fr 1fr"
                  gap={8}
                >
                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                    >
                      <HStack spacing={2}>
                        <Icon as={User} boxSize={4} color="gray.500" />
                        <Text>Username</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="text"
                      value={user?.username}
                      isReadOnly
                      bg="gray.50"
                      borderColor="gray.200"
                      borderRadius="md"
                      h="52px"
                      fontSize="md"
                      fontWeight="500"
                      color="gray.600"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "teal.400",
                        boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.1)",
                      }}
                    />
                  </FormControl>
                </Box>

                 {/* Full Name and Email - Side by Side */}
                 <Box
                   display={{ base: "flex", lg: "grid" }}
                   flexDirection={{ base: "column", lg: "row" }}
                   gridTemplateColumns="1fr 1fr"
                   gap={{ base: 6, lg: 8 }}
                 >
                   <FormControl>
                     <FormLabel
                       fontSize="sm"
                       fontWeight="600"
                       color="gray.700"
                       mb={3}
                     >
                       <HStack spacing={2}>
                         <Icon as={User} boxSize={4} color="gray.500" />
                         <Text>Full Name</Text>
                       </HStack>
                     </FormLabel>
                    <Input
                      type="text"
                      {...register("full_name")}
                      bg="white"
                      borderColor="gray.200"
                      borderRadius="md"
                      h="52px"
                      fontSize="md"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "teal.400",
                        boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.1)",
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                    >
                      <HStack spacing={2}>
                        <Icon as={Mail} boxSize={4} color="gray.500" />
                        <Text>Email Address</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="email"
                      {...register("email")}
                      bg="white"
                      borderColor="gray.200"
                      borderRadius="md"
                      h="52px"
                      fontSize="md"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{
                        borderColor: "teal.400",
                        boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.1)",
                      }}
                    />
                  </FormControl>
                </Box>
              </VStack>
            </Box>

            <Divider borderColor="gray.200" />

            {/* Account Details Section */}
            <Box maxW={{ base: "full", lg: "75%" }}>
              <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
                Account Details
              </Text>
              <Card
                bg="gray.50"
                borderRadius="md"
                border="1px"
                borderColor="gray.100"
              >
                <CardBody px={6} py={5}>
                  <HStack
                    spacing={8}
                    align="start"
                    flexDir={{ base: "column", md: "row" }}
                  >
                    <HStack spacing={3} flex={1}>
                      <Box
                        w={10}
                        h={10}
                        borderRadius="md"
                        bg="green.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={Calendar} color="green.600" boxSize={5} />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="500" color="gray.700">
                          Account Created
                        </Text>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={3} flex={1}>
                      <Box
                        w={10}
                        h={10}
                        borderRadius="md"
                        bg="blue.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={Clock} color="blue.600" boxSize={5} />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="500" color="gray.700">
                          Last Updated
                        </Text>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {user?.updated_at
                            ? new Date(user.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </Text>
                      </Box>
                    </HStack>
                  </HStack>
                </CardBody>
              </Card>
            </Box>

            {/* Save Button */}
            <Box pt={4}>
              <Button
                type="submit"
                isLoading={isUpdating}
                loadingText="Saving changes..."
                colorScheme="teal"
                isDisabled={!isDirty}
                leftIcon={<Save size={20} />}
                size="lg"
                borderRadius="md"
                h="56px"
                fontSize="md"
                fontWeight="600"
                px={8}
                bgGradient="linear(to-r, teal.500, teal.600)"
                _hover={{
                  bgGradient: "linear(to-r, teal.600, teal.700)",
                  transform: "translateY(-1px)",
                  shadow: "lg",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
                shadow="md"
              >
                Save Changes
              </Button>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateProfileForm;
