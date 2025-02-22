import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flex,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import Layout from './components/Layout'
import HomeMain from './components/HomeMain'

const Home = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [ledgers, setLedgers] = useState([])
  const [newLedgerName, setNewLedgerName] = useState('')
  const [newLedgerCurrency, setNewLedgerCurrency] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const ledgerNameInputRef = useRef(null)

  // token verification
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch("http://localhost:8000/user/verify-token", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Token verification failed')
        }
        const data = await response.json()
        console.log('token verified:', data)
      } catch (error) {
        console.error('Token verification error:', error)
        localStorage.removeItem('access_token')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [navigate])

  // fetch ledgers
  const fetchLedgers = async () => {
    try {
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
      const data = await response.json()
      setLedgers(data)
    } catch (error) {
      console.error('Error fetching ledgers')
    } 
  }

  // handle ledger creation
  const handleCreateLedger = async () => {
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
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/ledger/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLedgerName,
          currency_symbol: newLedgerCurrency,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || 'Ledger creation failed'
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        })
        ledgerNameInputRef.current?.focus()
        return
      }

      const data = await response.json()
      setLedgers([...ledgers, data])
      onClose()
      toast({
        title: 'Success',
        description: 'Ledger created successfully',
        status: 'success',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      })
    } catch (error) {
      console.error('Error creating ledger:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      })
    } finally {
      setNewLedgerName('')
      setNewLedgerCurrency('')
    }
  }

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  // Fetch ledgers after token verification
  useEffect(() => {
    if (!isLoading) {
      fetchLedgers()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    )
  }

  return (
    <Layout handleLogout={handleLogout}>
      <HomeMain
        ledgers={ledgers}
        onOpen={onOpen}
        isOpen={isOpen}
        onClose={onClose}
        newLedgerName={newLedgerName}
        setNewLedgerName={setNewLedgerName}
        newLedgerCurrency={newLedgerCurrency}
        setNewLedgerCurrency={setNewLedgerCurrency}
        handleCreateLedger={handleCreateLedger}
        ledgerNameInputRef={ledgerNameInputRef}
      />
    </Layout>
  )
}

export default Home
