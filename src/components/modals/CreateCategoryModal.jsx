import { useState, useEffect, useRef } from "react";
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
import axios from "axios";
import config from "@/config";

const CreateCategoryModal = ({
  isOpen,
  onClose,
  categoryType,
  parentCategoryId,
  fetchCategories,
}) => {
  const toast = useToast();
  const [categoryName, setCategoryName] = useState("");
  const [isGroupCategory, setIsGroupCategory] = useState(false);
  const [parentCategory, setParentCategory] = useState(parentCategoryId || "");
  const [groupCategories, setGroupCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const categoryNameInputRef = useRef(null);

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Update parentCategory state when parentCategoryId prop changes
  useEffect(() => {
    setParentCategory(parentCategoryId || "");
  }, [parentCategoryId]);

  // Fetch group categories when the modal is opened
  useEffect(() => {
    if (isOpen && !parentCategoryId) {
      fetchGroupCategories();
    }

    // Auto-focus on category name input when modal opens
    if (isOpen && categoryNameInputRef.current) {
      setTimeout(() => {
        categoryNameInputRef.current.focus();
      }, 100);
    }
  }, [isOpen, categoryType, parentCategoryId]);

  // Fetch group categories for the selected category type
  const fetchGroupCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
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
  };

  // Reset form fields
  const resetForm = () => {
    setCategoryName("");
    setIsGroupCategory(false);
    setParentCategory(parentCategoryId || "");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!categoryName) {
      toast({
        title: "Required Field",
        description: "Please enter a category name.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      categoryNameInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
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
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to create category.",
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
      initialFocusRef={categoryNameInputRef}
      size={{ base: "full", sm: "md" }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent
        borderRadius={{ base: 0, sm: "md" }}
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: "auto" }}
        h={{ base: "100vh", sm: "auto" }}
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
          justifyContent={{ base: "space-between", sm: "flex-start" }}
        >
          <VStack spacing={6} align="stretch" w="100%">
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Category Name</FormLabel>
              <Input
                placeholder={`e.g., ${categoryType === "income" ? "Salary, Freelance" : "Groceries, Utilities"}`}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                ref={categoryNameInputRef}
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

            {!parentCategoryId && groupCategories.length > 0 && (
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
