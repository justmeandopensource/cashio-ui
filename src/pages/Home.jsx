import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flex,
  Heading,
  Box,
  Spinner,
  VStack,
  Text,
  Link,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiFileText,
  FiLogOut,
  FiPlus,
} from 'react-icons/fi'

const Home = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [ledgers, setLedgers] = useState([])
  const [newLedgerName, setNewLedgerName] = useState('')
  const [newLedgerCurrency, setNewLedgerCurrency] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const sidebarBg = useColorModeValue('teal.500', 'teal.700')
  const sidebarColor = useColorModeValue('white', 'gray.200')

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
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w={{ base: 'full', md: '250px' }}
        bg={sidebarBg}
        color={sidebarColor}
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <VStack align="flex-start" spacing={6}>
          <Heading as="h1" size="lg" mb={6}>
            Cashio
          </Heading>
          <Link href="#" display="flex" alignItems="center">
            <Icon as={FiHome} mr={2} />
            Home
          </Link>
          <Link href="#" display="flex" alignItems="center">
            <Icon as={FiTrendingUp} mr={2} />
            Investments
          </Link>
          <Link href="#" display="flex" alignItems="center">
            <Icon as={FiFileText} mr={2} />
            Reports
          </Link>
        </VStack>

        {/* User Info and Logout */}
        <Box>
          <Text fontSize="sm" mb={2}>
            Username
          </Text>
          <Link
            href="#"
            display="flex"
            alignItems="center"
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} mr={2} />
            Log Out
          </Link>
        </Box>
      </Box>

      {/* Main Panel */}
      <Box flex={1} p={8}>
        {/* Ledger Cards Section */}
        <Box mb={8}>
          { ledgers.length === 0 ? (
              <Box textAlign="center" py={10} px={6}>
                <Icon as={FiFileText} boxSize={12} color="teal.500" mb={4} />
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  No Ledgers Found
                </Text>
                <Text color="gray.600" mb={6}>
                  You don't have any ledgers yet. Create one to get started.
                </Text>
                <Button
                  colorScheme="teal"
                  onClick={onOpen}
                  leftIcon={<FiPlus />}
                >
                  Create Ledger
                </Button>
              </Box>
            ) : (
            <Box>
              <Heading as="h2" size="lg" mb={4} color="teal.500">
                Ledgers
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
                {ledgers.map((ledger) => (
                  <Card key={ledger.ledger_id} bg="teal.50" _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}>
                    <CardBody display="flex" alignItems="center">
                      <Box
                        bg="teal.100"
                        p={3}
                        borderRadius="md"
                        mr={4}
                        fontWeight="bold"
                        fontSize="lg"
                      >
                        {ledger.currency_symbol}
                      </Box>
                      <Text fontSize="lg">{ledger.name}</Text>
                    </CardBody>
                  </Card>
                ))}
                <Card
                  bg="teal.50"
                  _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
                  cursor="pointer"
                  onClick={onOpen}
                >
                  <CardBody display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiPlus} boxSize={6} color="teal.500" />
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>
            )
          }
        </Box>

        {/* Modal for Creating a New Ledger */}
        <Modal 
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Ledger</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Input
                  placeholder="Ledger Name"
                  value={newLedgerName}
                  focusBorderColor="teal.500"
                  onChange={(e) => setNewLedgerName(e.target.value)}
                  autoFocus
                  ref={ledgerNameInputRef}
                />
                <Input
                  placeholder="Currency Symbol"
                  value={newLedgerCurrency}
                  focusBorderColor="teal.500"
                  onChange={(e) => setNewLedgerCurrency(e.target.value)}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={handleCreateLedger}>
                Create
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  )
}

export default Home
