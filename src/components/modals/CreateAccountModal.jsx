import React, { useState, useEffect } from 'react'
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
  Input,
  Select,
  Checkbox,
  Button,
  useToast,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import config from '@/config'

const CreateAccountModal = ({ isOpen, onClose, ledgerId, accountType, parentAccountId, onCreateAccount }) => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [accountName, setAccountName] = useState('')
  const [isGroupAccount, setIsGroupAccount] = useState(false)
  const [parentAccount, setParentAccount] = useState(parentAccountId || '')
  const [openingBalance, setOpeningBalance] = useState('')

  // Update parentAccount state when parentAccountId prop changes
  useEffect(() => {
    setParentAccount(parentAccountId || '')
  }, [parentAccountId])

  // Fetch group accounts when the modal is opened
  const {
    data: groupAccounts,
    isLoading: isGroupAccountsLoading,
    isError: isGroupAccountsError,
  } = useQuery({
    queryKey: ['groupAccounts', ledgerId, accountType],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts/group?account_type=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch group accounts')
      }

      return response.json()
    },
    enabled: isOpen && !parentAccountId, // Only fetch group accounts when the modal is open and no parentAccountId is provided
  })

  // Reset form fields
  const resetForm = () => {
    setAccountName('')
    setIsGroupAccount(false)
    setParentAccount(parentAccountId || '')
    setOpeningBalance('')
  }

  // Mutation for creating a new account
  const createAccountMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${config.apiBaseUrl}/ledger/${ledgerId}/account/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to create account')
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Account created successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      resetForm()
      onClose()
      queryClient.invalidateQueries(['accounts', ledgerId]); // Refetch accounts list
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
  })

  // Handle form submission
  const handleSubmit = () => {
    if (!accountName) {
      toast({
        title: 'Error',
        description: 'Account name required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const payload = {
      name: accountName,
      is_group: isGroupAccount,
      parent_account_id: parentAccount || null,
      type: accountType,
    }

    // Add opening_balance only if it's provided and the account is not a group account
    if (!isGroupAccount && openingBalance) {
      payload.opening_balance = parseFloat(openingBalance)
    }

    createAccountMutation.mutate(payload)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create {accountType === 'asset' ? 'Asset' : 'Liability'} Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Account Name</FormLabel>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter account name"
            />
          </FormControl>

          <FormControl mb={4}>
            <Checkbox
              isChecked={isGroupAccount}
              onChange={(e) => setIsGroupAccount(e.target.checked)}
            >
              Is this a group account?
            </Checkbox>
          </FormControl>

          {!isGroupAccount && (
            <FormControl mb={4}>
              <FormLabel>Opening Balance</FormLabel>
              <Input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
              />
            </FormControl>
          )}

          {/* Show loading spinner while fetching group accounts */}
          {isGroupAccountsLoading && (
            <Flex justify="center" align="center" my={4}>
              <Spinner size="sm" />
            </Flex>
          )}
          {!parentAccountId && groupAccounts && groupAccounts.length > 0 && (
            <FormControl mb={4}>
              <FormLabel>Parent Account</FormLabel>
              <Select
                value={parentAccount}
                onChange={(e) => setParentAccount(e.target.value)}
                placeholder="Select parent account"
              >
                {groupAccounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          {/* Show error message if fetching group accounts fails */}
          {isGroupAccountsError && (
            <Text color="red.500" fontSize="sm" mb={4}>
              Failed to load group accounts. Please try again.
            </Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={handleSubmit} isLoading={createAccountMutation.isLoading}>
            Create Account
          </Button>
          <Button variant="ghost" onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateAccountModal
