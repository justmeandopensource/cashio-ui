import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Button,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'

const CreateCategoryModal = ({ isOpen, onClose, categoryType, parentCategoryId, fetchCategories }) => {
  const toast = useToast()
  const [categoryName, setCategoryName] = useState('')
  const [isGroupCategory, setIsGroupCategory] = useState(false)
  const [parentCategory, setParentCategory] = useState(parentCategoryId || '')
  const [groupCategories, setGroupCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Update parentCategory state when parentCategoryId prop changes
  useEffect(() => {
    setParentCategory(parentCategoryId || '')
  }, [parentCategoryId])

  // Fetch group categories when the modal is opened
  useEffect(() => {
    if (isOpen && !parentCategoryId) {
      fetchGroupCategories()
    }
  }, [isOpen, categoryType, parentCategoryId])

  // Fetch group categories for the selected category type
  const fetchGroupCategories = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/category/group?category_type=${categoryType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setGroupCategories(response.data)
    } catch (error) {
      console.error('Error fetching group categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch group categories.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Reset form fields
  const resetForm = () => {
    setCategoryName('')
    setIsGroupCategory(false)
    setParentCategory(parentCategoryId || '')
  }

  const handleSubmit = async () => {
    if (!categoryName) {
      toast({
        title: 'Error',
        description: 'Category name is required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const payload = {
        name: categoryName,
        is_group: isGroupCategory,
        parent_category_id: parentCategory || null,
        type: categoryType,
      }

      const response = await axios.post(
        `http://localhost:8000/category/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast({
        title: 'Success',
        description: 'Category created successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      fetchCategories()
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create category.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create {categoryType === 'income' ? 'Income' : 'Expense'} Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Category Name</FormLabel>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
          </FormControl>

          <FormControl mb={4}>
            <Checkbox isChecked={isGroupCategory} onChange={(e) => setIsGroupCategory(e.target.checked)}>
              Is this a group category?
            </Checkbox>
          </FormControl>

          {!parentCategoryId && groupCategories.length > 0 && (
            <FormControl mb={4}>
              <FormLabel>Parent Category</FormLabel>
              <Select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                placeholder="Select parent category"
              >
                {groupCategories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={isLoading}>
            Create
          </Button>
          <Button variant="ghost" onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateCategoryModal
