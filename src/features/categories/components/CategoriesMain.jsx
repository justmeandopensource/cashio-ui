import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Icon,
  useDisclosure,
  SimpleGrid,
  Spinner,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import CreateCategoryModal from '@components/modals/CreateCategoryModal'
import config from '@/config'

const CategoriesMain = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [categoryType, setCategoryType] = useState(null)
  const [parentCategoryId, setParentCategoryId] = useState(null)
  const [categories, setCategories] = useState([]); // State to store categories
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch categories from the backend
  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${config.apiBaseUrl}/category/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCategories(response.data); // Update categories state
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Separate categories into Income and Expense
  const incomeCategories = categories.filter((category) => category.type === 'income')
  const expenseCategories = categories.filter((category) => category.type === 'expense')

  // Function to render categories in a nested table format
  const renderCategoriesTable = (categories, parentId = null, level = 0) => {
    return categories
      .filter((category) => category.parent_category_id === parentId)
      .map((category) => (
        <React.Fragment key={category.category_id}>
          {/* Row for the current category */}
          <Tr
            bg={category.is_group ? 'teal.50' : 'transparent'}
            _hover={!category.is_group ? { bg: 'gray.50' } : undefined} // No hover for group categories
          >
            <Td pl={`${level * 24 + 8}px`}>
              {!category.is_group ? (
                <Text
                  fontWeight="normal"
                  color="gray.700"
                  fontSize="sm"
                >
                  {category.name}
                </Text>
              ) : (
                <Text
                  fontWeight="bold"
                  color="teal.600"
                  fontSize="md"
                >
                  {category.name}
                </Text>
              )}
            </Td>
            <Td>
              <Box display="flex" gap={2}>
                {/* Add Child Category Button (for group categories) */}
                {category.is_group && (
                  <ChakraLink
                    onClick={() => handleCreateCategoryClick(category.type, category.category_id)}
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Icon as={FiPlus} boxSize={4} color="teal.500" _hover={{ color: 'teal.600' }} />
                  </ChakraLink>
                )}
              </Box>
            </Td>
          </Tr>

          {/* Recursively render child categories */}
          {renderCategoriesTable(categories, category.category_id, level + 1)}
        </React.Fragment>
      ))
  }

  // Open modal for creating a new category
  const handleCreateCategoryClick = (type, parentId = null) => {
    setCategoryType(type)
    setParentCategoryId(parentId)
    onOpen()
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
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
          _hover={{ boxShadow: 'md', transition: 'all 0.2s' }} // Hover effect
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="teal.500">
              Income Categories
            </Text>
            <ChakraLink onClick={() => handleCreateCategoryClick('income')} _hover={{ textDecoration: 'none' }}>
              <Icon as={FiPlus} boxSize={5} color="teal.500" _hover={{ color: 'teal.600' }} />
            </ChakraLink>
          </Box>
          {incomeCategories.length === 0 ? (
            <Box textAlign="center" py={10} px={6}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                No Income Categories Found
              </Text>
              <Text color="gray.600" mb={6}>
                You don't have any income categories yet.
              </Text>
              <Button leftIcon={<FiPlus />} onClick={() => handleCreateCategoryClick('income')}>
                Create Income Category
              </Button>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>
                {renderCategoriesTable(incomeCategories)}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Expense Categories Table */}
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: 'md', transition: 'all 0.2s' }} // Hover effect
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="teal.500">
              Expense Categories
            </Text>
            <ChakraLink onClick={() => handleCreateCategoryClick('expense')} _hover={{ textDecoration: 'none' }}>
              <Icon as={FiPlus} boxSize={5} color="teal.500" _hover={{ color: 'teal.600' }} />
            </ChakraLink>
          </Box>
          {expenseCategories.length === 0 ? (
            <Box textAlign="center" py={10} px={6}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                No Expense Categories Found
              </Text>
              <Text color="gray.600" mb={6}>
                You don't have any expense categories yet.
              </Text>
              <Button leftIcon={<FiPlus />} onClick={() => handleCreateCategoryClick('expense')}>
                Create Expense Category
              </Button>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>
                {renderCategoriesTable(expenseCategories)}
              </Tbody>
            </Table>
          )}
        </Box>
      </SimpleGrid>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isOpen}
        onClose={onClose}
        categoryType={categoryType}
        parentCategoryId={parentCategoryId}
        fetchCategories={fetchCategories} // Pass fetchCategories to the modal
      />
    </Box>
  )
}

export default CategoriesMain
