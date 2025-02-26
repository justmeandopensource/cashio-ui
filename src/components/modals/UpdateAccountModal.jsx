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
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'

const UpdateAccountModal = ({ isOpen, onClose, account, onUpdateCompleted }) => {
  const [name, setName] = useState(account.name)
  const [openingBalance, setOpeningBalance] = useState(account.opening_balance)
  const [parentAccountId, setParentAccountId] = useState(account.parent_account_id)
  const [groupAccounts, setGroupAccounts] = useState([])
  const toast = useToast()

  // Fetch group accounts based on the account type
  useEffect(() => {
    const fetchGroupAccounts = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(
          `http://localhost:8000/ledger/${account.ledger_id}/accounts/group?account_type=${account.type}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setGroupAccounts(response.data)
      } catch (error) {
        toast({
          title: 'Error fetching group accounts',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    if (isOpen) {
      fetchGroupAccounts()
    }
  }, [isOpen, account.ledger_id, account.type, toast])

  const handleSubmit = async () => {
    const payload = {}

    // Add only the fields that have changed
    if (name !== account.name) payload.name = name
    if (openingBalance !== account.opening_balance) payload.opening_balance = openingBalance
    if (parentAccountId !== account.parent_account_id) payload.parent_account_id = parentAccountId

    // If no fields have changed, show an error toast
    if (Object.keys(payload).length === 0) {
      toast({
        title: 'No changes detected',
        description: 'Please update at least one field.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      await axios.put(
        `http://localhost:8000/ledger/${account.ledger_id}/account/${account.account_id}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast({
        title: 'Account updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
      onUpdateCompleted()
    } catch (error) {
      toast({
        title: 'Error updating account',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Account Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Opening Balance</FormLabel>
            <Input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(parseFloat(e.target.value))}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Parent Account</FormLabel>
            <Select
              value={parentAccountId || ''}
              onChange={(e) => setParentAccountId(parseInt(e.target.value))}
            >
              <option value="">None</option>
              {groupAccounts.map((group) => (
                <option key={group.account_id} value={group.account_id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
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

export default UpdateAccountModal
