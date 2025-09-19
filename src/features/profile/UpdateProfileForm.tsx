
import React, { useEffect } from "react";
import { Save } from "lucide-react";
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
  Heading,
} from "@chakra-ui/react";
import { useUpdateUserProfile, useUserProfile } from "./hooks";
import { UserUpdate } from "./api";

const UpdateProfileForm: React.FC = () => {
  const toast = useToast();
  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UserUpdate>();
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
     <Box maxW="md">
       <VStack spacing={6} align="stretch">
         <Box>
           <Heading size="md">Account Information</Heading>
           <Text mt={2} fontSize="sm" color="gray.500">
             Update your personal details here.
           </Text>
         </Box>
         <Box as="form" onSubmit={handleSubmit(onSubmit)}>
           <VStack spacing={4}>
         <FormControl id="username">
           <FormLabel>Username</FormLabel>
           <Input type="text" value={user?.username} isReadOnly bg="gray.50" opacity={0.7} />
         </FormControl>
        <FormControl id="full_name">
          <FormLabel>Full Name</FormLabel>
          <Input type="text" {...register("full_name")} />
        </FormControl>
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input type="email" {...register("email")} />
        </FormControl>
         <Box alignSelf="flex-start" mt={4}>
           <Button type="submit" isLoading={isUpdating} colorScheme="teal" isDisabled={!isDirty} leftIcon={<Save size={18} />}>
             Save Changes
           </Button>
         </Box>
         </VStack>
       </Box>
     </VStack>
   </Box>
  );
};

export default UpdateProfileForm;
