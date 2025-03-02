import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Text,
  VStack,
  HStack,
  useToast,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import axios from 'axios'
import ChakraDatePicker from '@components/shared/ChakraDatePicker'

const CreateTransactionModal = ({ isOpen, onClose, accountId, ledgerId, onTransactionAdded }) => {
  const [date, setDate] = useState(new Date())
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [amount, setAmount] = useState('')
  const [isSplit, setIsSplit] = useState(false)
  const [splits, setSplits] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const resetForm = () => {
    setDate(new Date())
    setType('expense')
    setCategoryId('')
    setNotes('')
    setAmount('')
    setIsSplit(false)
    setSplits([])
  }

  // Fetch tag suggestions as the user types
  useEffect(() => {
    if (tagInput.length > 0) {
      fetchTagSuggestions(tagInput)
    } else {
      setTagSuggestions([])
    }
  }, [tagInput])

  // Fetch tag suggestions from the backend
  const fetchTagSuggestions = async (query) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`http://localhost:8000/tags/search?query=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTagSuggestions(response.data)
    } catch (error) {
      console.error('Error fetching tag suggestions:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch tag suggestions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Add a tag to the selected tags list
  const addTag = (tag) => {
    if (!tags.some((t) => t.tag_id === tag.tag_id)) {
      setTags([...tags, tag])
      setTagInput('')
      setTagSuggestions([])
    }
  }

  // Remove a tag from the selected tags list
  const removeTag = (tagName) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.name !== tagName))
  }

  // Handle Enter key press in the tags input field
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTagName = tagInput.trim()

      if (newTagName) {
        // Check if the tag already exists in the selected tags
        const isTagAlreadyAdded = tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())

        if (!isTagAlreadyAdded) {
          // Add the new tag to the selected tags
          const newTag = { name: newTagName }
          setTags((prevTags) => [...prevTags, newTag])
          setTagInput('')
          setTagSuggestions([])
        }
      }
    }
  }

  // Fetch categories when modal is opened
  // Fetch accounts if no accountId is provided
  useEffect(() => {
    if (isOpen) {
      resetForm()
      fetchCategories()
      if (!accountId) {
        fetchAccounts()
      }
    }
  }, [isOpen, accountId])

  // Recalculate splits when amount changes
  useEffect(() => {
    if (isSplit && amount > 0) {
      updateSplitsBasedOnAmount()
    }
  }, [amount, isSplit])

  // Update splits based on the current amount
  const updateSplitsBasedOnAmount = () => {
    const currentAmount = parseFloat(amount) || 0
    
    if (splits.length === 0) {
      // Initialize with first split
      setSplits([{ amount: currentAmount, categoryId: '' }])
      return
    }
  }

  // Fetch categories based on the transaction type
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/category/list?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch categories.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Fetch accounts if no accountId is provided (from ledger page)
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/ledger/${ledgerId}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setAccounts(response.data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch accounts.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle split transaction toggle
  const handleSplitToggle = (isChecked) => {
    const currentAmount = parseFloat(amount) || 0
    
    if (currentAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Amount required before enabling split transactions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    setIsSplit(isChecked)
    
    if (isChecked) {
      // Initialize with the total amount
      setSplits([{ amount: currentAmount, categoryId: '' }])
    } else {
      // Clear splits when toggle is turned off
      setSplits([])
    }
  }

  // Handle split amount change
  const handleSplitAmountChange = (index, inputValue) => {
    // Make a copy of the current splits
    const newSplits = [...splits]
    
    // Convert input to number or use 0 if empty
    const value = inputValue === '' ? 0 : parseFloat(inputValue)
    
    // Update the split amount
    newSplits[index] = {
      ...newSplits[index],
      amount: value
    }
    
    // Calculate total of all splits excluding the last one if it's empty/new
    const totalAllocated = newSplits.reduce((sum, split, i) => {
      // Only count this split if it's not the one we're currently analyzing as the "last"
      return sum + (i !== newSplits.length - 1 || i === index ? (parseFloat(split.amount) || 0) : 0)
    }, 0)
    
    const totalAmount = parseFloat(amount) || 0
    const remaining = totalAmount - totalAllocated
    
    // If we're editing the last split, don't adjust it
    if (index < newSplits.length - 1) {
      // We're editing a split that's not the last one, so adjust the last one
      if (newSplits.length > 1) {
        newSplits[newSplits.length - 1].amount = remaining > 0 ? remaining : 0
      }
    } else if (remaining > 0) {
      // We're editing the last split and there's still remaining amount
      // Add a new split with the remaining amount
      newSplits.push({ amount: remaining, categoryId: '' })
    }
    
    // Clean up: remove any zero-amount splits at the end, except keep at least one split
    let i = newSplits.length - 1
    while (i > 0 && (parseFloat(newSplits[i].amount) || 0) === 0 && i !== index) {
      newSplits.pop()
      i--
    }
    
    setSplits(newSplits)
  }

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    const totalAmount = parseFloat(amount) || 0
    const allocatedAmount = splits.reduce((sum, split) => {
      return sum + (parseFloat(split.amount) || 0)
    }, 0)
    
    return totalAmount - allocatedAmount
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (categories.length === 0) {
      toast({
        title: 'Error',
        description: 'No categories found. Please create categories first.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Validate all splits have categories if split is enabled
    if (isSplit) {
      const invalidSplits = splits.filter(split => !split.categoryId)
      if (invalidSplits.length > 0) {
        toast({
          title: 'Error',
          description: 'Please select a category for each split.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      
      // Check if the total split amount matches the transaction amount
      const totalSplitAmount = splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0)
      const totalAmount = parseFloat(amount) || 0
      
      if (Math.abs(totalSplitAmount - totalAmount) > 0.01) { // Allow for small rounding differences
        toast({
          title: 'Error',
          description: 'The sum of split amounts must equal the total transaction amount.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const parsedAmount = parseFloat(amount) || 0
      
      const payload = {
        account_id: parseInt(accountId || (accounts.length > 0 ? accounts[0].account_id : ''), 10),
        category_id: parseInt(categoryId, 10),
        type: type,
        date: date.toISOString(),
        notes: notes,
        credit: type === 'income' ? parsedAmount : 0,
        debit: type === 'expense' ? parsedAmount : 0,
        is_transfer: false,
        transfer_id: null,
        transfer_type: null,
        is_split: isSplit,
        splits: isSplit ? splits.map(split => ({
          credit: type === 'income' ? parseFloat(split.amount) || 0 : 0,
          debit: type === 'expense' ? parseFloat(split.amount) || 0 : 0,
          category_id: parseInt(split.categoryId, 10)
        })) : [],
        tags: tags.map((tag) => ({ name: tag.name })),
      }

      const endpoint = type === 'income' 
        ? `http://localhost:8000/ledger/${ledgerId}/transaction/income`
        : `http://localhost:8000/ledger/${ledgerId}/transaction/expense`

      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast({
        title: 'Success',
        description: 'Transaction added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onClose()
      onTransactionAdded()
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Transaction failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Transaction</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Date Picker */}
            <ChakraDatePicker selected={date} onChange={(date) => setDate(date)} />

            {/* Transaction Type */}
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
            </FormControl>

            {/* Account Dropdown (only shown if no accountId is provided) */}
            {!accountId && accounts.length > 0 && (
              <FormControl>
                <FormLabel>Account</FormLabel>
                <Select>
                  {accounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Notes */}
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Input 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Notes (optional)'
              />
            </FormControl>

            {/* Amount and Split Toggle */}
            <HStack spacing={4} width="100%" align="flex-start">
              <FormControl flex="1">
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value
                    setAmount(value)
                  }}
                  placeholder='0.00'
                />
              </FormControl>

              <FormControl flex="1">
                <FormLabel>Split Transaction</FormLabel>
                <Switch
                  isChecked={isSplit}
                  onChange={(e) => handleSplitToggle(e.target.checked)}
                  isDisabled={!amount} // Disable if amount is not entered
                />
              </FormControl>
            </HStack>

            {/* Split Transaction Fields */}
            {isSplit && splits.length > 0 && (
              <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="medium">Split Details</Text>
                  
                  {splits.map((split, index) => (
                    <HStack key={index} spacing={4}>
                      <FormControl flex="1">
                        <FormLabel fontSize="sm">Split {index + 1} Amount</FormLabel>
                        <Input
                          type="number"
                          value={split.amount || ''}
                          onChange={(e) => {
                            handleSplitAmountChange(index, e.target.value)
                          }}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormControl flex="1">
                        <FormLabel fontSize="sm">Split {index + 1} Category</FormLabel>
                        <Select
                          value={split.categoryId}
                          onChange={(e) => {
                            const newSplits = [...splits]
                            newSplits[index].categoryId = e.target.value
                            setSplits(newSplits)
                          }}
                        >
                          <option value="">Select a category</option>
                          {/* Group for Income Categories */}
                          <optgroup label="Income">
                            {categories
                              .filter((category) => category.type === 'income')
                              .map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                  {category.name}
                                </option>
                              ))}
                          </optgroup>

                          {/* Group for Expense Categories */}
                          <optgroup label="Expense">
                            {categories
                              .filter((category) => category.type === 'expense')
                              .map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                  {category.name}
                                </option>
                              ))}
                          </optgroup>
                        </Select>
                      </FormControl>
                    </HStack>
                  ))}
                  
                  {/* Display total allocated and remaining amount */}
                  <HStack justifyContent="space-between" pt={2}>
                    <Text fontSize="sm">
                      Total Amount: {parseFloat(amount) || 0}
                    </Text>
                    {calculateRemainingAmount() < 0 && (
                      <Text 
                        fontSize="sm" 
                        color="red.500"
                      >
                        Over-allocated by {Math.abs(calculateRemainingAmount()).toFixed(2)}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Box>
            )}

            {/* Category Dropdown */}
            {!isSplit && (
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  isDisabled={isSplit} // Disable if split is enabled
                >
                  <option value="">Select a category</option>
                    {/* Group for Income Categories */}
                    <optgroup label="Income">
                      {categories
                        .filter((category) => category.type === 'income')
                        .map((category) => (
                          <option key={category.category_id} value={category.category_id}>
                            {category.name}
                          </option>
                        ))}
                    </optgroup>

                    {/* Group for Expense Categories */}
                    <optgroup label="Expense">
                      {categories
                        .filter((category) => category.type === 'expense')
                        .map((category) => (
                          <option key={category.category_id} value={category.category_id}>
                            {category.name}
                          </option>
                        ))}
                    </optgroup>
                </Select>
              </FormControl>
            )}

            {/* Tags Input */}
            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Box>
                {/* Display selected tags as chips */}
                <Wrap spacing={2} mb={2}>
                  {tags.map((tag) => (
                    <WrapItem key={tag.name}>
                      <Tag size="md" borderRadius="full" variant="solid" colorScheme="teal">
                        <TagLabel>{tag.name}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(tag.name)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>

                {/* Tag input with suggestions */}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown} // Handle Enter key
                  placeholder="Add tags (press Enter to add)"
                />

                {/* Display tag suggestions */}
                {tagSuggestions.length > 0 && (
                  <Box mt={2} borderWidth="1px" borderRadius="md" p={2} bg="gray.50">
                    {tagSuggestions.map((tag) => (
                      <Box
                        key={tag.tag_id}
                        p={1}
                        cursor="pointer"
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => {
                          addTag(tag);
                          setTagInput(''); // Clear input after adding a tag
                          setTagSuggestions([]); // Clear suggestions
                        }}
                      >
                        {tag.name}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={isLoading}
            isDisabled={
              (isSplit && splits.length === 0) || 
              (!isSplit && !categoryId) || 
              !amount ||
              (isSplit && calculateRemainingAmount() !== 0)
            }
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateTransactionModal
