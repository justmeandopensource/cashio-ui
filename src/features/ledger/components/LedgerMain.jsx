import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Box, Spinner, useToast } from '@chakra-ui/react'
import LedgerMainHeader from '@features/ledger/components/LedgerMainHeader'
import LedgerMainAccounts from '@features/ledger/components/LedgerMainAccounts'
import CreateTransactionModal from '@components/modals/CreateTransactionModal'
import TransferFundsModal from '@components/modals/TransferFundsModal'
import { currencySymbols } from '@components/shared/currencyUtils'
import config from '@/config'

const LedgerMain = () => {
  const { ledgerId } = useParams()
  const toast = useToast()
  const queryClient = useQueryClient()

  // State for modals and selected account
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState(null)

  // Fetch ledger details
  const {
    data: ledger,
    isLoading: isLedgerLoading,
    isError: isLedgerError,
  } = useQuery({
    queryKey: ['ledger', ledgerId],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${config.apiBaseUrl}/ledger/${ledgerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch ledger details')
      }

      return response.json()
    },
  })

  // Fetch accounts for the ledger
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
  } = useQuery({
    queryKey: ['accounts', ledgerId],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${config.apiBaseUrl}/ledger/${ledgerId}/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }

      return response.json()
    },
  })

  const handleAddTransaction = (accountId = null) => {
    setSelectedAccountId(accountId)
    setIsCreateModalOpen(true)
  }

  const handleTransferFunds = (accountId = null) => {
    setSelectedAccountId(accountId)
    setIsTransferModalOpen(true)
  }

  if (isLedgerLoading || isAccountsLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Box>
    )
  }

  if (isLedgerError || isAccountsError) {
    toast({
      title: 'Error',
      description: 'Failed to fetch ledger or account details.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
    return null
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
        accounts={accounts || []}
        ledger={ledger}
        onAddTransaction={handleAddTransaction}
        onTransferFunds={handleTransferFunds}
      />

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        ledgerId={ledgerId}
        accountId={selectedAccountId}
        currencySymbol={currencySymbols[ledger.currency_symbol]}
        onTransactionAdded={() => queryClient.invalidateQueries(['accounts', ledgerId])}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ledgerId={ledgerId}
        accountId={selectedAccountId}
        currencySymbol={currencySymbols[ledger.currency_symbol]}
        onTransferCompleted={() => queryClient.invalidateQueries(['accounts', ledgerId])}
      />

    </Box>
  )
}

export default LedgerMain
