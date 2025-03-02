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
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import ChakraDatePicker from '@components/shared/ChakraDatePicker'

const TransferFundsModal = ({ isOpen, onClose, ledgerId, accountId, onTransferCompleted }) => {
  const [date, setDate] = useState(new Date())
  const [fromAccountId, setFromAccountId] = useState(accountId || '')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isDifferentLedger, setIsDifferentLedger] = useState(false)
  const [destinationLedgerId, setDestinationLedgerId] = useState('')
  const [destinationAmount, setDestinationAmount] = useState('')
  const [ledgers, setLedgers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [destinationAccounts, setDestinationAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const resetForm = () => {
    setDate(new Date())
    setFromAccountId(accountId || '')
    setToAccountId('')
    setAmount('')
    setNotes('')
    setIsDifferentLedger(false)
    setDestinationLedgerId('')
    setDestinationAmount('')
  }

  useEffect(() => {
    if (isOpen) {
      resetForm()
      fetchLedgers()
      fetchAccounts()
    }
  }, [isOpen])

  useEffect(() => {
    if (isDifferentLedger && destinationLedgerId) {
      fetchDestinationAccounts(destinationLedgerId)
    }
  }, [isDifferentLedger, destinationLedgerId])

  const fetchLedgers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://localhost:8000/ledger/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setLedgers(response.data)
    } catch (error) {
      console.error('Error fetching ledgers:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch ledgers.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/ledger/${ledgerId}/accounts?ignore_group=true`,
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
        description: 'Failed to fetch accounts.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchDestinationAccounts = async (ledgerId) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`http://localhost:8000/ledger/${ledgerId}/accounts?ignore_group=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setDestinationAccounts(response.data)
    } catch (error) {
      console.error('Error fetching destination accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch destination accounts.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Filter out the current ledger from the "destination ledger" dropdown
  const getFilteredLedgers = (ledgers) => {
    return ledgers.filter((ledger) => ledger.ledger_id != ledgerId)
  }

  // Filter out the current account from the "to account" dropdown
  const getFilteredAccounts = (accounts) => {
    return accounts.filter((account) => account.account_id != fromAccountId)
  }

  const handleSubmit = async () => {
    if (!fromAccountId || !toAccountId || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields.',
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
        source_account_id: parseInt(fromAccountId, 10),
        destination_account_id: parseInt(toAccountId, 10),
        date: date.toISOString(),
        source_amount: parseFloat(amount),
        notes: notes || 'Fund Transfer',
        destination_amount: destinationAmount ? parseFloat(destinationAmount) : null,
      }

      await axios.post(`http://localhost:8000/ledger/${ledgerId}/transaction/transfer`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast({
        title: 'Success',
        description: 'Transfer completed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onClose()
      onTransferCompleted()
    } catch (error) {
      console.error('Error transferring funds:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Transfer failed',
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
        <ModalHeader>Transfer Funds</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <ChakraDatePicker selected={date} onChange={(date) => setDate(date)} />

            {!accountId && (
              <FormControl>
                <FormLabel>From Account</FormLabel>
                <Select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                >
                  <option value="">Select an account</option>
                  {/* Group for Asset Accounts */}
                  <optgroup label="Asset Accounts">
                    {accounts
                      .filter((account) => account.type === 'asset')
                      .map((account) => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.name}
                        </option>
                      ))}
                  </optgroup>
                  {/* Group for Liability Accounts */}
                  <optgroup label="Liability Accounts">
                    {accounts
                      .filter((account) => account.type === 'liability')
                      .map((account) => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.name}
                        </option>
                      ))}
                  </optgroup>
                </Select>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Transfer to Different Ledger</FormLabel>
              <Switch
                isChecked={isDifferentLedger}
                onChange={(e) => setIsDifferentLedger(e.target.checked)}
              />
            </FormControl>

            {isDifferentLedger && (
              <FormControl>
                <FormLabel>Destination Ledger</FormLabel>
                <Select
                  value={destinationLedgerId}
                  onChange={(e) => setDestinationLedgerId(e.target.value)}
                >
                  <option value="">Select a ledger</option>
                  {getFilteredLedgers(ledgers).map((ledger) => (
                    <option key={ledger.ledger_id} value={ledger.ledger_id}>
                      {ledger.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>To Account</FormLabel>
              <Select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
              >
                <option value="">Select an account</option>
                  {/* Group for Asset Accounts */}
                  <optgroup label="Asset Accounts">
                    {getFilteredAccounts(isDifferentLedger ? destinationAccounts : accounts, fromAccountId)
                      .filter((account) => account.type === 'asset')
                      .map((account) => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.name}
                        </option>
                      ))}
                  </optgroup>
                  {/* Group for Liability Accounts */}
                  <optgroup label="Liability Accounts">
                    {getFilteredAccounts(isDifferentLedger ? destinationAccounts : accounts, fromAccountId)
                      .filter((account) => account.type === 'liability')
                      .map((account) => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.name}
                        </option>
                      ))}
                  </optgroup>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </FormControl>

            {isDifferentLedger && (
              <FormControl>
                <FormLabel>Destination Amount</FormLabel>
                <Input
                  type="number"
                  value={destinationAmount}
                  onChange={(e) => setDestinationAmount(e.target.value)}
                  placeholder="0.00"
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSubmit} isLoading={isLoading}>
            Transfer
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TransferFundsModal
