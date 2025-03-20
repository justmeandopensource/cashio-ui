import React, {
  useState,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  useCallback,
} from "react";
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
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import config from "@/config";

interface GroupCategory {
  category_id: string;
  name: string;
}

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: "income" | "expense";
  parentCategoryId?: string | null;
  fetchCategories: () => void;
}

interface CategoryPayload {
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
  fetchCategories,
}) => {
  const toast = useToast();
  const [categoryName, setCategoryName] = useState<string>("");
  const [isGroupCategory, setIsGroupCategory] = useState<boolean>(false);
  const [parentCategory, setParentCategory] = useState<string>(
    parentCategoryId || "",
  );
  const [groupCategories, setGroupCategories] = useState<GroupCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Define fetchGroupCategories using useCallback
  const fetchGroupCategories = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get<GroupCategory[]>(
        `${config.apiBaseUrl}/category/group?category_type=${categoryType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setGroupCategories(response.data);
    } catch (error) {
      console.error("Error fetching group categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch group categories.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    }
  }, [categoryType, toast]);

  // Update parentCategory state when parentCategoryId prop changes
  useEffect(() => {
    setParentCategory(parentCategoryId || "");
  }, [parentCategoryId]);

  // Fetch group categories when the modal is opened
  useEffect(() => {
    if (isOpen && !parentCategoryId) {
      fetchGroupCategories();
    }
  }, [isOpen, categoryType, parentCategoryId, fetchGroupCategories]);

  // Reset form fields
  const resetForm = (): void => {
    setCategoryName("");
    setIsGroupCategory(false);
    setParentCategory(parentCategoryId || "");
  };

  // Handle Enter key press
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!categoryName) {
      toast({
        title: "Required Field",
        description: "Please enter a category name.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const payload: CategoryPayload = {
        name: categoryName,
        is_group: isGroupCategory,
        parent_category_id: parentCategory || null,
        type: categoryType,
      };

      await axios.post(`${config.apiBaseUrl}/category/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Success",
        description: "Category created successfully.",
        status: "success",
        duration: 2000,
        position: "top",
        isClosable: true,
      });

      fetchCategories();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail || "Failed to create category.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
            Create {categoryType === "income" ? "Income" : "Expense"} Category
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCategoryName(e.target.value)
                }
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIsGroupCategory(e.target.checked)
                }
                colorScheme={buttonColorScheme}
                size="md"
              >
                <Text fontWeight="medium">Group Category</Text>
              </Checkbox>
              <FormHelperText ml="6">
                Group categories can contain other categories
              </FormHelperText>
            </FormControl>

            {!parentCategoryId && groupCategories.length > 0 && (
              <FormControl>
                <FormLabel fontWeight="medium">
                  Parent Category (Optional)
                </FormLabel>
                <Select
                  value={parentCategory}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setParentCategory(e.target.value)
                  }
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
          </VStack>

          {/* Mobile-only action buttons that stay at bottom */}
          <Box display={{ base: "block", sm: "none" }} mt={6}>
            <Button
              onClick={handleSubmit}
              colorScheme={buttonColorScheme}
              size="lg"
              width="100%"
              mb={3}
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Create Category
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              width="100%"
              size="lg"
              isDisabled={isLoading}
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
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create
          </Button>
          <Button variant="outline" onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateCategoryModal;
