import React, { useState, useEffect, useRef } from 'react'
import {
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Button,
  useToast,
  Box,
  VStack,
  useColorModeValue,
  Text,
} from '@chakra-ui/react'
import axios from 'axios'
import config from '@/config'

const UpdateAccountModal = ({ isOpen, onClose, account, onUpdateCompleted }) => {
  const [name, setName] = useState(account.name)
  const [openingBalance, setOpeningBalance] = useState(account.opening_balance)
  const [parentAccountId, setParentAccountId] = useState(account.parent_account_id)
  const [groupAccounts, setGroupAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const nameInputRef = useRef(null)
  const toast = useToast()

  // Color variables for consistent theming
  const buttonColorScheme = "teal"
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Auto-focus on account name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // Fetch group accounts based on the account type
  useEffect(() => {
    const fetchGroupAccounts = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('access_token')
        const response = await axios.get(
          `${config.apiBaseUrl}/ledger/${account.ledger_id}/accounts/group?account_type=${account.type}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setGroupAccounts(response.data)
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch group accounts',
          status: 'error',
          duration: 3000,
          position: 'top',
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchGroupAccounts()
    }
  }, [isOpen, account.ledger_id, account.type, toast])

  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: 'Required Field',
        description: 'Please enter an account name.',
        status: 'warning',
        duration: 3000,
        position: 'top',
        isClosable: true,
      })
      nameInputRef.current?.focus()
      return
    }
    
    const payload = {}

    // Add only the fields that have changed
    if (name !== account.name) payload.name = name
    if (openingBalance !== account.opening_balance) payload.opening_balance = parseFloat(openingBalance)
    if (parentAccountId !== account.parent_account_id) payload.parent_account_id = parentAccountId

    // If no fields have changed, show an error toast
    if (Object.keys(payload).length === 0) {
      toast({
        title: 'No changes detected',
        description: 'Please update at least one field.',
        status: 'warning',
        duration: 3000,
        position: 'top',
        isClosable: true,
      })
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      await axios.put(
        `${config.apiBaseUrl}/ledger/${account.ledger_id}/account/${account.account_id}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast({
        title: 'Success',
        description: 'Account updated successfully',
        status: 'success',
        duration: 2000,
        position: 'top',
        isClosable: true,
      })
      onClose()
      onUpdateCompleted()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update account',
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      initialFocusRef={nameInputRef}
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
            Update {account.type === 'asset' ? 'Asset' : 'Liability'} Account
          </ModalHeader>
          <ModalCloseButton 
            color={{ base: "white", sm: "gray.500" }}
            top={{ base: 10, sm: 4 }}
            right={{ base: 4, sm: 4 }}
          />
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
              <FormLabel fontWeight="medium">Account Name</FormLabel>
              <Input
                placeholder={`e.g., ${account.type === 'asset' ? 'Cash, Bank Account' : 'Credit Card, Mortgage'}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                ref={nameInputRef}
                onKeyPress={handleKeyPress}
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                size="md"
                borderRadius="md"
                _hover={{ borderColor: buttonColorScheme + ".300" }}
                _focus={{ borderColor: buttonColorScheme + ".500", boxShadow: "0 0 0 1px " + buttonColorScheme + ".500" }}
              />
              <FormHelperText>
                Update the name of your {account.type} account
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Opening Balance</FormLabel>
              <InputGroup>
                <InputLeftAddon children="$" />
                <Input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value))}
                  placeholder="0.00"
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg={bgColor}
                  size="md"
                  borderRadius="md"
                  _hover={{ borderColor: buttonColorScheme + ".300" }}
                  _focus={{ borderColor: buttonColorScheme + ".500", boxShadow: "0 0 0 1px " + buttonColorScheme + ".500" }}
                />
              </InputGroup>
              <FormHelperText>
                Starting balance for this account
              </FormHelperText>
            </FormControl>

            {/* Show loading spinner while fetching group accounts */}
            {isLoading && groupAccounts.length === 0 && (
              <Flex justify="center" align="center" my={4}>
                <Spinner size="sm" color={buttonColorScheme + ".500"} />
                <Text ml={2} color="gray.500">Loading parent accounts...</Text>
              </Flex>
            )}
            
            {groupAccounts.length > 0 && (
              <FormControl>
                <FormLabel fontWeight="medium">Parent Account (Optional)</FormLabel>
                <Select
                  value={parentAccountId || ''}
                  onChange={(e) => setParentAccountId(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Select parent account"
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg={bgColor}
                  size="md"
                  borderRadius="md"
                  _hover={{ borderColor: buttonColorScheme + ".300" }}
                  _focus={{ borderColor: buttonColorScheme + ".500", boxShadow: "0 0 0 1px " + buttonColorScheme + ".500" }}
                >
                  <option value="">None</option>
                  {groupAccounts.map((group) => (
                    <option key={group.account_id} value={group.account_id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Organize this account under an existing group
                </FormHelperText>
              </FormControl>
            )}
          </VStack>
          
          {/* Mobile-only action buttons that stay at bottom */}
          <Box display={{ base: 'block', sm: 'none' }} mt={6}>
            <Button 
              onClick={handleSubmit}
              colorScheme={buttonColorScheme}
              size="lg"
              width="100%"
              mb={3}
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Account
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
        <ModalFooter display={{ base: 'none', sm: 'flex' }}>
          <Button 
            colorScheme={buttonColorScheme} 
            mr={3} 
            onClick={handleSubmit}
            px={6}
            isLoading={isLoading}
            loadingText="Updating..."
          >
            Update
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UpdateAccountModal
