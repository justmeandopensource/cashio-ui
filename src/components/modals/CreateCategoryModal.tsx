import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Checkbox,
  Button,
  useToast,
  Box,
  VStack,
  useColorModeValue,
  Text,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import config from "@/config";
import { Plus, X } from "lucide-react";
import { toastDefaults } from "../shared/utils";

interface GroupCategory {
  category_id: string;
  name: string;
}

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: "income" | "expense";
  parentCategoryId?: string | null;
}

interface CreateCategoryPayload {
  name: string;
  is_group: boolean;
  parent_category_id: string | null;
  type: string;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryType,
  parentCategoryId,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [categoryName, setCategoryName] = useState<string>("");
  const [isGroupCategory, setIsGroupCategory] = useState<boolean>(false);
  const [parentCategory, setParentCategory] = useState<string>(
    parentCategoryId || "",
  );

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Update parentCategory state when parentCategoryId prop changes
  useEffect(() => {
    setParentCategory(parentCategoryId || "");
  }, [parentCategoryId]);

  // Fetch group categories when the modal is opened
  const {
    data: groupCategories,
    isLoading: isGroupCategoriesLoading,
    isError: isGroupCategoriesError,
  } = useQuery({
    queryKey: ["groupCategories", categoryType],
    queryFn: async (): Promise<GroupCategory[]> => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/category/group?category_type=${categoryType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group categories");
      }

      return response.json();
    },
    enabled: isOpen && !parentCategoryId, // Only fetch group categories when the modal is open and no parentCategoryId is provided
  });

  // Reset form fields
  const resetForm = (): void => {
    setCategoryName("");
    setIsGroupCategory(false);
    setParentCategory(parentCategoryId || "");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Mutation for creating a new account
  const createCategoryMutation = useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${config.apiBaseUrl}/category/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        description: "Category created successfully.",
        status: "success",
        ...toastDefaults,
      });
      resetForm();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (error: Error) => {
      toast({
        description: error.message || "Failed to create category.",
        status: "error",
        ...toastDefaults,
      });
    },
  });

  const handleSubmit = async (): Promise<void> => {
    if (!categoryName) {
      toast({
        description: "Please enter a category name.",
        status: "warning",
        ...toastDefaults,
      });
      return;
    }

    const payload: CreateCategoryPayload = {
      name: categoryName,
      is_group: isGroupCategory,
      parent_category_id: parentCategory || null,
      type: categoryType,
    };

    createCategoryMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", sm: "md" }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent
        borderRadius={{ base: 0, sm: "md" }}
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: "auto" }}
        maxHeight={{ base: "100%", md: "80vh" }}
        display="flex"
        flexDirection="column"
      >
        <Box
          pt={{ base: 10, sm: 4 }}
          pb={{ base: 2, sm: 0 }}
          px={{ base: 4, sm: 0 }}
          bg={{ base: buttonColorScheme + ".500", sm: "transparent" }}
          color={{ base: "white", sm: "inherit" }}
          borderTopRadius={{ base: 0, sm: "md" }}
        >
          <ModalHeader
            fontSize={{ base: "xl", sm: "lg" }}
            p={{ base: 0, sm: 6 }}
            pb={{ base: 4, sm: 2 }}
          >
            <Flex alignItems="center">
              <Plus size={24} style={{ marginRight: '8px' }} />
              Create {categoryType === "income" ? "Income" : "Expense"} Category
            </Flex>
          </ModalHeader>
        </Box>

        <ModalBody
          px={{ base: 4, sm: 6 }}
          py={{ base: 4, sm: 4 }}
          flex="1"
          display="flex"
          flexDirection="column"
          overflow="auto"
          maxHeight={{ md: "calc(80vh - 140px)" }}
          justifyContent={{ base: "space-between", sm: "flex-start" }}
        >
          <VStack spacing={6} align="stretch" w="100%">
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Category Name</FormLabel>
              <Input
                placeholder={`e.g., ${categoryType === "income" ? "Salary, Freelance" : "Groceries, Utilities"}`}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyPress={handleKeyPress}
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                size="md"
                borderRadius="md"
                _hover={{ borderColor: buttonColorScheme + ".300" }}
                _focus={{
                  borderColor: buttonColorScheme + ".500",
                  boxShadow: "0 0 0 1px " + buttonColorScheme + ".500",
                }}
              />
              <FormHelperText>
                Enter a descriptive name for your {categoryType} category
              </FormHelperText>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={isGroupCategory}
                onChange={(e) => setIsGroupCategory(e.target.checked)}
                colorScheme={buttonColorScheme}
                size="md"
              >
                <Text fontWeight="medium">Group Category</Text>
              </Checkbox>
              <FormHelperText ml="6">
                Group categories can contain other categories
              </FormHelperText>
            </FormControl>

            {/* Show loading spinner while fetching group categories */}
            {isGroupCategoriesLoading && (
              <Flex justify="center" align="center" my={4}>
                <Spinner size="sm" color={buttonColorScheme + ".500"} />
              </Flex>
            )}

            {!parentCategoryId &&
              groupCategories &&
              groupCategories.length > 0 && (
                <FormControl>
                  <FormLabel fontWeight="medium">
                    Parent Category (Optional)
                  </FormLabel>
                  <Select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    placeholder="Select parent category"
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={bgColor}
                    size="md"
                    borderRadius="md"
                    _hover={{ borderColor: buttonColorScheme + ".300" }}
                    _focus={{
                      borderColor: buttonColorScheme + ".500",
                      boxShadow: "0 0 0 1px " + buttonColorScheme + ".500",
                    }}
                  >
                    {groupCategories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>
                    Organize this category under an existing group
                  </FormHelperText>
                </FormControl>
              )}
            {/* Show error message if fetching group accounts fails */}
            {isGroupCategoriesError && (
              <Text color="red.500" fontSize="sm" mt={2}>
                Failed to load group categories. Please try again.
              </Text>
            )}
          </VStack>

          {/* Mobile-only action buttons that stay at bottom */}
          <Box display={{ base: "block", sm: "none" }} mt={6}>
            <Button
              onClick={handleSubmit}
              colorScheme={buttonColorScheme}
              size="lg"
              width="100%"
              mb={3}
              isLoading={createCategoryMutation.isPending}
              isDisabled={!categoryName || isGroupCategoriesError}
              loadingText="Creating..."
              leftIcon={<Plus />}
            >
              Create Category
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              width="100%"
              size="lg"
              isDisabled={createCategoryMutation.isPending}
              leftIcon={<X />}
            >
              Cancel
            </Button>
          </Box>
        </ModalBody>

        {/* Desktop-only footer */}
        <ModalFooter display={{ base: "none", sm: "flex" }}>
          <Button
            colorScheme={buttonColorScheme}
            mr={3}
            onClick={handleSubmit}
            px={6}
            isLoading={createCategoryMutation.isPending}
            isDisabled={!categoryName || isGroupCategoriesError}
            loadingText="Creating..."
            leftIcon={<Plus />}
          >
            Create
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            isDisabled={createCategoryMutation.isPending}
            leftIcon={<X />}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateCategoryModal;
