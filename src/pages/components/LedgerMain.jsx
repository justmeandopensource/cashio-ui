import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Spinner, useToast } from '@chakra-ui/react'
import LedgerMainHeader from './LedgerMainHeader'
import LedgerMainAccounts from './LedgerMainAccounts'

const LedgerMain = () => {
  const { ledgerId } = useParams()
  const [ledger, setLedger] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

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

  return (
    <Box>
      {/* Ledger Details Section */}
      <LedgerMainHeader ledger={ledger} />

      {/* Accounts Section */}
      <LedgerMainAccounts accounts={accounts} ledger={ledger} fetchAccounts={fetchAccounts} />
    </Box>
  )
}

export default LedgerMain
