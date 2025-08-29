
import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { useUpdateUserProfile, useUserProfile } from "./hooks";
import { UserUpdate } from "./api";

const UpdateProfileForm: React.FC = () => {
  const toast = useToast();
  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { register, handleSubmit, setValue, reset, formState: { isDirty } } = useForm<UserUpdate>();
  const { mutate: updateUser, isLoading: isUpdating } = useUpdateUserProfile();

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
    return <Text>Loading...</Text>;
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl id="username">
          <FormLabel>Username</FormLabel>
          <Input type="text" value={user?.username} isReadOnly />
        </FormControl>
        <FormControl id="full_name">
          <FormLabel>Full Name</FormLabel>
          <Input type="text" {...register("full_name")} />
        </FormControl>
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" {...register("email")} />
        </FormControl>
        <Button type="submit" isLoading={isUpdating} colorScheme="teal" isDisabled={!isDirty}>
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
};

export default UpdateProfileForm;
