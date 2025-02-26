import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Spinner, useToast } from '@chakra-ui/react'
import AccountMainHeader from "@features/account/components/AccountMainHeader"
import AccountMainTransactions from "@features/account/components/AccountMainTransactions"
import CreateTransactionModal from '@components/modals/CreateTransactionModal'
import TransferFundsModal from '@components/modals/TransferFundsModal'

const AccountMain = () => {
  const { ledgerId, accountId } = useParams()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total_transactions: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 25,
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const toast = useToast()

  // Fetch account details
  const fetchAccount = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`http://localhost:8000/ledger/${ledgerId}/account/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setAccount(response.data)
    } catch (error) {
      console.error('Error fetching account:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch account details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Fetch transactions
  const fetchTransactions = async (page) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/ledger/${ledgerId}/account/${accountId}/transactions?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setTransactions(response.data.transactions)
      setPagination({
        total_transactions: response.data.total_transactions,
        total_pages: response.data.total_pages,
        current_page: response.data.current_page,
        per_page: response.data.per_page,
      })
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch account transactions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Fetch account details and transactions when the component mounts or accountId changes
  useEffect(() => {
    const fetchAccountAndTransactions = async () => {
      setIsLoading(true)
      await fetchAccount()
      await fetchTransactions(pagination.current_page)
      setIsLoading(false)
    }

    fetchAccountAndTransactions()
  }, [accountId])

  // Function to refresh account and transactions after a new transaction is added
  const refreshData = async () => {
    await fetchAccount()
    await fetchTransactions(pagination.current_page)
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  if (!account) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          Account not found
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Account Details Section */}
      <AccountMainHeader
        account={account}
        onAddTransaction={() => setIsCreateModalOpen(true)}
        onTransferFunds={() => setIsTransferModalOpen(true)}
      />

      {/* Transactions Section */}
      <AccountMainTransactions
        transactions={transactions}
        account={account}
        fetchTransactions={fetchTransactions}
        pagination={pagination}
        onAddTransaction={() => setIsCreateModalOpen(true)}
      />

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        ledgerId={ledgerId}
        accountId={accountId}
        onTransactionAdded={refreshData}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ledgerId={ledgerId}
        accountId={accountId}
        onTransferCompleted={refreshData}
      />
    </Box>
  )
}

export default AccountMain
