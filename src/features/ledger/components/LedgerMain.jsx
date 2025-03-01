import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Spinner, useToast } from '@chakra-ui/react'
import LedgerMainHeader from '@features/ledger/components/LedgerMainHeader'
import LedgerMainAccounts from '@features/ledger/components/LedgerMainAccounts'
import CreateTransactionModal from '@components/modals/CreateTransactionModal'
import TransferFundsModal from '@components/modals/TransferFundsModal'

const LedgerMain = () => {
  const { ledgerId } = useParams()
  const [ledger, setLedger] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const toast = useToast()

  // Add a state to store the selected accountId
  const [selectedAccountId, setSelectedAccountId] = useState(null)

  // Function to fetch accounts
  const fetchAccounts = async () => {
    const token = localStorage.getItem('access_token')
    try {
      const accountsResponse = await axios.get(`http://localhost:8000/ledger/${ledgerId}/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAccounts(accountsResponse.data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch account details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Fetch ledger details and accounts
  useEffect(() => {
    const fetchLedgerAndAccounts = async () => {
      const token = localStorage.getItem('access_token')
      try {
        // Fetch ledger details
        const ledgerResponse = await axios.get(`http://localhost:8000/ledger/${ledgerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setLedger(ledgerResponse.data)

        // Fetch accounts for the ledger
        const accountsResponse = await axios.get(`http://localhost:8000/ledger/${ledgerId}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setAccounts(accountsResponse.data)
      } catch (error) {
        console.error('Error fetching ledger or accounts:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch ledger or account details.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLedgerAndAccounts()
  }, [ledgerId, toast])

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  if (!ledger) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          Ledger not found
        </Text>
      </Box>
    )
  }

  const handleAddTransaction = (accountId = null) => {
    setSelectedAccountId(accountId)
    setIsCreateModalOpen(true)
  }

  const handleTransferFunds = (accountId = null) => {
    setSelectedAccountId(accountId)
    setIsTransferModalOpen(true)
  }

  return (
    <Box>
      {/* Ledger Details Section */}
      <LedgerMainHeader
        ledger={ledger}
        onAddTransaction={() => handleAddTransaction(null)}
        onTransferFunds={() => handleTransferFunds(null)}
        hasAccounts={accounts.length > 0}
      />

      {/* Accounts Section */}
      <LedgerMainAccounts
        accounts={accounts}
        ledger={ledger}
        onAddTransaction={handleAddTransaction}
        onTransferFunds={handleTransferFunds}
        fetchAccounts={fetchAccounts}
      />

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        ledgerId={ledgerId}
        accountId={selectedAccountId}
        onTransactionAdded={fetchAccounts}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ledgerId={ledgerId}
        accountId={selectedAccountId}
        onTransferCompleted={fetchAccounts}
      />

    </Box>
  )
}

export default LedgerMain
