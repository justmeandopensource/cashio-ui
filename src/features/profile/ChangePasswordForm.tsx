import React from "react";
import { KeyRound, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  VStack,
  FormErrorMessage,
  Text,
  HStack,
  Icon,
  Heading,
} from "@chakra-ui/react";
import { useChangePassword } from "./hooks";
import { ChangePassword } from "./api";

const ChangePasswordForm: React.FC = () => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePassword>();
  const { mutate: changePassword, isPending } = useChangePassword();

  const currentPassword = watch("current_password");
  const newPassword = watch("new_password");
  const isButtonDisabled =
    !currentPassword || !newPassword || currentPassword === newPassword;

  const onSubmit = (data: ChangePassword) => {
    changePassword(data, {
      onSuccess: () => {
        toast({
          title: "Password changed.",
          description: "Your password has been changed successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        reset();
      },
      onError: (error: any) => {
        toast({
          title: "An error occurred.",
          description:
            error.response?.data?.detail || "Unable to change your password.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  return (
     <Box w="full">
       <Box px={{ base: 6, md: 8 }} py={{ base: 6, md: 8 }}>
         <VStack spacing={6} align="stretch" mb={8}>
           <Box>
             <Heading size="md">Change Password</Heading>
             <Text mt={2} fontSize="sm" color="gray.500">
               Update your password to keep your account secure.
             </Text>
           </Box>
         </VStack>
         <Box as="form" onSubmit={handleSubmit(onSubmit)} maxW="2xl">
           <VStack spacing={8} align="stretch">
            {/* Form Fields */}
            <Box>
              <VStack spacing={6} align="stretch">
                <Box
                  display={{ base: "block", lg: "grid" }}
                  gridTemplateColumns="1fr 1fr"
                  gap={8}
                >
                  <FormControl isInvalid={!!errors.current_password}>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                    >
                      <HStack spacing={2}>
                        <Icon as={Lock} boxSize={4} color="gray.500" />
                        <Text>Current Password</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="password"
                      {...register("current_password", {
                        required: "Current password is required",
                      })}
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
                    <FormErrorMessage fontSize="sm" color="red.500">
                      {errors.current_password?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.new_password}>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb={3}
                    >
                      <HStack spacing={2}>
                        <Icon as={KeyRound} boxSize={4} color="gray.500" />
                        <Text>New Password</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="password"
                      {...register("new_password", {
                        required: "New password is required",
                      })}
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
                    <FormErrorMessage fontSize="sm" color="red.500">
                      {errors.new_password?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </VStack>
            </Box>



            {/* Change Password Button */}
            <Box pt={4}>
               <Button
                 type="submit"
                 isLoading={isPending}
                 loadingText="Changing password..."
                colorScheme="teal"
                isDisabled={isButtonDisabled}
                leftIcon={<KeyRound size={20} />}
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
                 Change Password
               </Button>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default ChangePasswordForm;
