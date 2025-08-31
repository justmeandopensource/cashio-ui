import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Table,
  Tbody,
  Tr,
  Td,
  Text,
  Button,
  Icon,
  useDisclosure,
  SimpleGrid,
  Spinner,
  Link as ChakraLink,
  useToast,
  HStack,
} from "@chakra-ui/react";
import {
  Plus,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import CreateCategoryModal from "@components/modals/CreateCategoryModal";
import config from "@/config";
import { toastDefaults } from "@/components/shared/utils";

// Define TypeScript interfaces
interface Category {
  category_id: string;
  name: string;
  type: "income" | "expense";
  is_group: boolean;
  parent_category_id: string | null;
}

const CategoriesMain: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categoryType, setCategoryType] = useState<"income" | "expense" | null>(
    null,
  );
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch categories using React Query
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${config.apiBaseUrl}/category/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      return response.json();
    },
  });

  // Function to refresh categories data
  const refreshCategories = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // Separate categories into Income and Expense
  const incomeCategories = categories.filter(
    (category) => category.type === "income",
  );
  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  // Function to render categories in a nested table format
  const renderCategoriesTable = (
    categories: Category[],
    parentId: string | null = null,
    level: number = 0,
  ): React.ReactNode => {
    return categories
      .filter((category) => category.parent_category_id === parentId)
      .map((category) => (
        <React.Fragment key={category.category_id}>
          {/* Row for the current category */}
          <Tr
            bg={category.is_group ? "teal.50" : "transparent"}
            _hover={!category.is_group ? { bg: "gray.50" } : undefined} // No hover for group categories
          >
            <Td pl={`${level * 24 + 8}px`}>
              {!category.is_group ? (
                <Text fontWeight="normal" color="secondaryTextColor" fontSize="sm">
                  {category.name}
                </Text>
              ) : (
                <Text fontWeight="bold" color="teal.600" fontSize="md">
                  {category.name}
                </Text>
              )}
            </Td>
            <Td>
              <Box display="flex" gap={2}>
                {/* Add Child Category Button (for group categories) */}
                {category.is_group && (
                  <ChakraLink
                    onClick={() =>
                      handleCreateCategoryClick(
                        category.type,
                        category.category_id,
                      )
                    }
                    _hover={{ textDecoration: "none" }}
                  >
                    <Icon
                      as={Plus}
                      boxSize={4}
                      color="teal.500"
                      _hover={{ color: "teal.600" }}
                    />
                  </ChakraLink>
                )}
              </Box>
            </Td>
          </Tr>

          {/* Recursively render child categories */}
          {renderCategoriesTable(categories, category.category_id, level + 1)}
        </React.Fragment>
      ));
  };

  // Open modal for creating a new category
  const handleCreateCategoryClick = (
    type: "income" | "expense",
    parentId: string | null = null,
  ): void => {
    setCategoryType(type);
    setParentCategoryId(parentId);
    onOpen();
  };

  if (isCategoriesLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    );
  }

  if (isCategoriesError) {
    toast({
      description: "Failed to fetch categories.",
      status: "error",
      ...toastDefaults,
    });
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500" mb={4}>
          There was an error loading your categories.
        </Text>
        <Button onClick={refreshCategories} colorScheme="teal" leftIcon={<RefreshCw size={16} />}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" p={6} borderRadius="lg">
      {/* Responsive Grid for Income and Expense Categories */}
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={6}>
        {/* Income Categories Table */}
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: "md", transition: "all 0.2s" }} // Hover effect
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <HStack spacing={2}>
              <Icon as={ArrowUpCircle} boxSize={6} color="green.500" />
              <Text fontSize="xl" fontWeight="bold" color="teal.500">
                Income Categories
              </Text>
            </HStack>
            <ChakraLink
              onClick={() => handleCreateCategoryClick("income")}
              _hover={{ textDecoration: "none" }}
            >
              <Icon
                as={Plus}
                boxSize={5}
                color="teal.500"
                _hover={{ color: "teal.600" }}
              />
            </ChakraLink>
          </Box>
          {incomeCategories.length === 0 ? (
            <Box textAlign="center" py={10} px={6}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                No Income Categories Found
              </Text>
              <Text color="secondaryTextColor" mb={6}>
                You do not have any income categories yet.
              </Text>
              <Button
                leftIcon={<Plus />}
                onClick={() => handleCreateCategoryClick("income")}
              >
                Create Income Category
              </Button>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>{renderCategoriesTable(incomeCategories)}</Tbody>
            </Table>
          )}
        </Box>

        {/* Expense Categories Table */}
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: "md", transition: "all 0.2s" }} // Hover effect
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <HStack spacing={2}>
              <Icon as={ArrowDownCircle} boxSize={6} color="green.500" />
              <Text fontSize="xl" fontWeight="bold" color="teal.500">
                Expense Categories
              </Text>
            </HStack>
            <ChakraLink
              onClick={() => handleCreateCategoryClick("expense")}
              _hover={{ textDecoration: "none" }}
            >
              <Icon
                as={Plus}
                boxSize={5}
                color="teal.500"
                _hover={{ color: "teal.600" }}
              />
            </ChakraLink>
          </Box>
          {expenseCategories.length === 0 ? (
            <Box textAlign="center" py={10} px={6}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                No Expense Categories Found
              </Text>
              <Text color="secondaryTextColor" mb={6}>
                You do not have any expense categories yet.
              </Text>
              <Button
                leftIcon={<Plus />}
                onClick={() => handleCreateCategoryClick("expense")}
              >
                Create Expense Category
              </Button>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>{renderCategoriesTable(expenseCategories)}</Tbody>
            </Table>
          )}
        </Box>
      </SimpleGrid>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        categoryType={categoryType === "income" ? "income" : "expense"}
        parentCategoryId={parentCategoryId}
      />
    </Box>
  );
};

export default CategoriesMain;
