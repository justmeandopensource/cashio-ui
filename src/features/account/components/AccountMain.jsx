import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Box, Spinner, useToast, Text } from '@chakra-ui/react'
import AccountMainHeader from "@features/account/components/AccountMainHeader"
import AccountMainTransactions from "@features/account/components/AccountMainTransactions"
import CreateTransactionModal from '@components/modals/CreateTransactionModal'
import TransferFundsModal from '@components/modals/TransferFundsModal'
import UpdateAccountModal from '@components/modals/UpdateAccountModal'
import { currencySymbols } from '@components/shared/currencyUtils'
import config from '@/config'

const AccountMain = ({ currencySymbolCode }) => {
  const { ledgerId, accountId } = useParams()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const toast = useToast()
  const queryClient = useQueryClient()

  // Pagination state
  const [pagination, setPagination] = useState({
    total_transactions: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 25,
  })

  // Fetch account
  const fetchAccount = async () => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${config.apiBaseUrl}/ledger/${ledgerId}/account/${accountId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch account details')
    }

    return response.json()
  }

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(
      `${config.apiBaseUrl}/ledger/${ledgerId}/account/${accountId}/transactions?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }

    return response.json()
  }

  // Fetch account
  const {
    data: account,
    isLoading: isAccountLoading,
    isError: isAccountError,
  } = useQuery({
    queryKey: ['account', accountId],
    queryFn: fetchAccount,
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to fetch account details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
  })

  // Fetch transactions
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useQuery({
    queryKey: ['transactions', accountId, pagination.current_page],
    queryFn: () => fetchTransactions(pagination.current_page),
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to fetch account transactions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
  })

  // Update pagination when transactions data is fetched
  useEffect(() => {
    if (transactionsData) {
      setPagination({
        total_transactions: transactionsData.total_transactions,
        total_pages: transactionsData.total_pages,
        current_page: transactionsData.current_page,
        per_page: transactionsData.per_page,
      })
    }
  }, [transactionsData])

  // Function to handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }))
  }

  // Function to refresh account and transactions data
  const refreshAccountAndTransactionsData = async () => {
    await queryClient.invalidateQueries(['account', accountId])
    await queryClient.invalidateQueries(['transactions', accountId, pagination.current_page])
  }

  // Function to refresh account data
  const refreshAccountData = async () => {
    await queryClient.invalidateQueries(['account', accountId])
  }

  // Show loading spinner while data is being fetched
  if (isAccountLoading || isTransactionsLoading || !transactionsData) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  // Show error message if account or transactions fetch fails
  if (isAccountError || isTransactionsError) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          Failed to load account data.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      {/* Account Details Section */}
      <AccountMainHeader
        account={account}
        currencySymbolCode={currencySymbolCode}
        onAddTransaction={() => setIsCreateModalOpen(true)}
        onTransferFunds={() => setIsTransferModalOpen(true)}
        onUpdateAccount={() => setIsUpdateModalOpen(true)}
      />

      {/* Transactions Section */}
      <AccountMainTransactions
        transactions={transactionsData?.transactions || []}
        account={account}
        currencySymbolCode={currencySymbolCode}
        fetchTransactions={handlePageChange}
        pagination={pagination}
        onAddTransaction={() => setIsCreateModalOpen(true)}
      />

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        ledgerId={ledgerId}
        accountId={accountId}
        currencySymbol={currencySymbols[currencySymbolCode]}
        onTransactionAdded={refreshAccountAndTransactionsData}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ledgerId={ledgerId}
        accountId={accountId}
        currencySymbol={currencySymbols[currencySymbolCode]}
        onTransferCompleted={refreshAccountAndTransactionsData}
      />

      {/* Update Account Modal */}
      <UpdateAccountModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        account={account}
        currencySymbol={currencySymbols[currencySymbolCode]}
        onUpdateCompleted={refreshAccountData}
      />
    </Box>
  )
}

export default AccountMain
