import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Flex,
  Spinner,
  useDisclosure,
  useToast,
  Text,
} from '@chakra-ui/react'
import Layout from '@components/Layout'
import HomeMain from '@features/home/components/HomeMain'

const Home = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // token verification
  const { isLoading: isTokenVerifying, isError: isTokenError } = useQuery({
    queryKey: ['verifyToken'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await fetch('http://localhost:8000/user/verify-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Token verification failed')
      }

      return response.json()
    },
    onError: () => {
      localStorage.removeItem('access_token')
      navigate('/login')
    },
    retry: false, // Disable retries to avoid infinite loops
  })

  // Redirect to login if token verification fails
  useEffect(() => {
    if (isTokenError) {
      localStorage.removeItem('access_token')
      navigate('/login')
    }
  }, [isTokenError, navigate])

  // Fetch ledgers
  const {
    data: ledgers,
    isLoading: isFetchingLedgers,
    isError: isLedgersError,
  } = useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/ledger/list', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch ledgers')
      }

      return response.json()
    },
    enabled: !isTokenVerifying && !isTokenError, // Only fetch ledgers after token verification
  })

  // Create ledger mutation
  const createLedgerMutation = useMutation({
    mutationFn: async ({ name, currency_symbol }) => {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/ledger/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, currency_symbol }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Ledger creation failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update the cached ledgers list with the new ledger
      queryClient.setQueryData(['ledgers'], (oldData) => [...oldData, data])
      onClose()
      toast({
        title: 'Success',
        description: 'Ledger created successfully',
        status: 'success',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      })
      ledgerNameInputRef.current?.focus()
    },
  })

  // handle ledger creation
  const handleCreateLedger = async (newLedgerName, newLedgerCurrency) => {
    if (!newLedgerName || !newLedgerCurrency) {
      toast({
        title: 'Error',
        description: 'All fields required.',
        status: 'error',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      })
      ledgerNameInputRef.current?.focus()
      return
    }

    createLedgerMutation.mutate({
      name: newLedgerName,
      currency_symbol: newLedgerCurrency,
    })
  }

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  if (isTokenVerifying) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (isTokenError) {
    return null
  }

  if (isFetchingLedgers) {
    return (
      <Layout handleLogout={handleLogout}>
        <Flex justify="center" align="center" minH="100vh">
          <Spinner size="xl" />
        </Flex>
      </Layout>
    )
  }

  if (isLedgersError) {
    return (
      <Layout handleLogout={handleLogout}>
        <Flex justify="center" align="center" minH="100vh">
          <Text>Error fetching ledgers. Please try again.</Text>
        </Flex>
      </Layout>
    )
  }

  return (
    <Layout handleLogout={handleLogout}>
      <HomeMain
        ledgers={ledgers || []}
        onOpen={onOpen}
        isOpen={isOpen}
        onClose={onClose}
        handleCreateLedger={handleCreateLedger}
      />
    </Layout>
  )
}

export default Home
