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

const CreateAccountModal = ({ isOpen, onClose, ledgerId, accountType, parentAccountId, fetchAccounts }) => {
  const toast = useToast()
  const [accountName, setAccountName] = useState('')
  const [isGroupAccount, setIsGroupAccount] = useState(false)
  const [parentAccount, setParentAccount] = useState(parentAccountId || '')
  const [openingBalance, setOpeningBalance] = useState('')
  const [groupAccounts, setGroupAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Update parentAccount state when parentAccountId prop changes
  useEffect(() => {
    setParentAccount(parentAccountId || '')
  }, [parentAccountId])

  // Fetch group accounts when the modal is opened
  useEffect(() => {
    if (isOpen && !parentAccountId) {
      fetchGroupAccounts()
    }
  }, [isOpen, accountType, parentAccountId])

  // Fetch group accounts for the selected account type
  const fetchGroupAccounts = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/ledger/${ledgerId}/accounts/group?account_type=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setGroupAccounts(response.data)
    } catch (error) {
      console.error('Error fetching group accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch group accounts.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Reset form fields
  const resetForm = () => {
    setAccountName('')
    setIsGroupAccount(false)
    setParentAccount(parentAccountId || '')
    setOpeningBalance('')
  }

  // Handle form submission
  const handleSubmit = async () => {
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

    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
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

      const response = await axios.post(
        `http://localhost:8000/ledger/${ledgerId}/account/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast({
        title: 'Success',
        description: 'Account created successfully.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      // Refresh the accounts list
      fetchAccounts()

      resetForm()

      // Close the modal
      onClose()
    } catch (error) {
      console.error('Error creating account:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create account.',
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

          {!parentAccountId && groupAccounts.length > 0 && (
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
        </ModalBody>

        <ModalFooter>
          <Button onClick={handleSubmit} isLoading={isLoading}>
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
