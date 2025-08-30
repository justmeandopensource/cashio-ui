
import React from "react";
import { KeyRound } from "lucide-react";
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
} from "@chakra-ui/react";
import { useChangePassword } from "./hooks";
import { ChangePassword } from "./api";

const ChangePasswordForm: React.FC = () => {
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePassword>();
  const { mutate: changePassword, isLoading } = useChangePassword();

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
          description: error.response?.data?.detail || "Unable to change your password.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl id="current_password" isInvalid={!!errors.current_password}>
          <FormLabel>Current Password</FormLabel>
          <Input type="password" {...register("current_password", { required: "Current password is required" })} />
          <FormErrorMessage>{errors.current_password?.message}</FormErrorMessage>
        </FormControl>
        <FormControl id="new_password" isInvalid={!!errors.new_password}>
          <FormLabel>New Password</FormLabel>
          <Input type="password" {...register("new_password", { required: "New password is required" })} />
          <FormErrorMessage>{errors.new_password?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" isLoading={isLoading} colorScheme="teal" leftIcon={<KeyRound size={18} />}>
          Change Password
        </Button>
      </VStack>
    </Box>
  );
};

export default ChangePasswordForm;
