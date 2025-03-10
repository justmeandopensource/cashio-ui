import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Icon,
  useDisclosure,
  useToast,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Spinner,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  useBreakpointValue,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Circle,
} from '@chakra-ui/react'
import { 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCreditCard, 
  FiTag, 
  FiInfo, 
  FiCalendar,
  FiFolder,
  FiFileText,
  FiChevronDown
} from 'react-icons/fi'
import { Square } from '@chakra-ui/react'
import CreateTransactionModal from '@components/modals/CreateTransactionModal'
import { useQueryClient } from '@tanstack/react-query'
import config from '@/config'

const AccountMainTransactions = ({ transactions, account, fetchTransactions, pagination, onAddTransaction }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const queryClient = useQueryClient()

  // State to store split transactions and transfer details
  const [splitTransactions, setSplitTransactions] = useState([])
  const [transferDetails, setTransferDetails] = useState(null)
  const [expandedTransaction, setExpandedTransaction] = useState(null)

  // Loading states
  const [isSplitLoading, setIsSplitLoading] = useState(false)
  const [isTransferLoading, setIsTransferLoading] = useState(false)

  // Destructure pagination data
  const { total_transactions, total_pages, current_page } = pagination

  // Responsive layout switch - updated to account for iPad portrait/landscape
  const viewMode = useBreakpointValue({ 
    base: "mobile",
    sm: "mobile",
    md: "tablet",
    lg: "desktop",
    xl: "desktop" 
  })
  
  // Detect portrait/landscape orientation for tablets
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  )

  // Effect to listen for orientation changes
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth)
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      
      // Initial check
      handleResize()
      
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // Determine if we should use card view based on device and orientation
  const useCardView = viewMode === "mobile" || (viewMode === "tablet" && isPortrait)

  // Function to handle page change
  const handlePageChange = (page) => {
    fetchTransactions(page)
  }

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0].replace(/-/g, '/')
  }

  // Format amount with proper sign and color
  const formatAmount = (credit, debit) => {
    if (credit > 0) {
      return { value: parseFloat(credit).toFixed(2), color: 'teal.500', prefix: '+' }
    } else {
      return { value: parseFloat(debit).toFixed(2), color: 'red.500', prefix: '-' }
    }
  }

  // Toggle expanded transaction on tap
  const toggleExpand = (transactionId, e) => {
    // Don't toggle if clicking on buttons inside the card
    if (e.target.tagName === 'BUTTON' || 
        e.target.closest('button') || 
        e.target.tagName === 'svg' || 
        e.target.tagName === 'path') {
      return
    }
    
    if (expandedTransaction === transactionId) {
      setExpandedTransaction(null)
      setTransferDetails(null)
    } else {
      setExpandedTransaction(transactionId)
      setTransferDetails(null)
    }
  }

  // Fetch split transactions using fetch
  const fetchSplitTransactions = async (transactionId) => {
    setIsSplitLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${account.ledger_id}/transaction/${transactionId}/splits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch split transactions')
      }

      const data = await response.json()
      setSplitTransactions(data)
    } catch (error) {
      console.error('Error fetching split transactions:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch split transactions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSplitLoading(false)
    }
  }

  // Fetch transfer details using fetch
  const fetchTransferDetails = async (transferId) => {
    setIsTransferLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${config.apiBaseUrl}/ledger/transfer/${transferId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transfer details')
      }

      const data = await response.json()
      setTransferDetails(data)
    } catch (error) {
      console.error('Error fetching transfer details:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch transfer details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsTransferLoading(false)
    }
  }

  // Mobile/Tablet transaction card component
  const TransactionCard = ({ transaction }) => {
    const amount = formatAmount(transaction.credit, transaction.debit)
    const isExpanded = expandedTransaction === transaction.transaction_id
    
    return (
      <Box 
        p={4} 
        borderWidth="1px" 
        borderRadius="lg" 
        mb={3} 
        bg="white" 
        boxShadow="sm"
        onClick={(e) => toggleExpand(transaction.transaction_id, e)}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ bg: "gray.50" }}
      >
        {/* Main row with essential info */}
        <Flex justify="space-between" align="flex-start">
          {/* Left side with date, category and notes */}
          <VStack align="flex-start" spacing={1} maxW="70%">
            <HStack spacing={2}>
              <Icon as={FiCalendar} color="gray.500" />
              <Text fontSize="sm" color="gray.600">
                {formatDate(transaction.date)}
              </Text>
              
              {/* Transaction type indicators */}
              {(transaction.is_split || transaction.is_transfer) && (
                <HStack spacing={1}>
                  {transaction.is_split && (
                    <Tooltip label="Split Transaction">
                      <Square size="8px" bg="purple.400" borderRadius="md" />
                    </Tooltip>
                  )}
                  {transaction.is_transfer && (
                    <Tooltip label="Transfer">
                      <Square size="8px" bg="blue.400" borderRadius="md" />
                    </Tooltip>
                  )}
                </HStack>
              )}
            </HStack>
            
            <Text fontWeight="medium">
              {transaction.category_name}
            </Text>
            
            {/* Notes section - visible by default */}
            {transaction.notes && (
              <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                {transaction.notes}
              </Text>
            )}
          </VStack>
          
          {/* Right side with amount */}
          <Box textAlign="right">
            <Text 
              fontWeight="bold" 
              fontSize="lg" 
              color={amount.color}
            >
              {amount.prefix}{amount.value}
            </Text>
          </Box>
        </Flex>
        
        {/* Expandable section */}
        {isExpanded && (
          <Box mt={4} pt={3} borderTopWidth="1px">
            {/* Tags section */}
            {transaction.tags && transaction.tags.length > 0 && (
              <Box mt={1}>
                <HStack mb={1}>
                  <Icon as={FiTag} color="gray.500" />
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">TAGS</Text>
                </HStack>
                <Wrap spacing={2} ml={6}>
                  {transaction.tags.map((tag) => (
                    <WrapItem key={tag.tag_id}>
                      <Tag size="sm" borderRadius="md" variant="subtle" colorScheme="teal">
                        <TagLabel>{tag.name}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
            
            {/* Split transaction details */}
            {transaction.is_split && (
              <Box mt={3}>
                <Button
                  size="xs"
                  leftIcon={<FiInfo />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    fetchSplitTransactions(transaction.transaction_id)
                  }}
                  mb={2}
                >
                  View Split Details
                </Button>
                
                {isSplitLoading ? (
                  <Flex justify="center" align="center" h="100px">
                    <Spinner />
                  </Flex>
                ) : splitTransactions.length > 0 && (
                  <Box borderWidth="1px" borderRadius="md" p={2} bg="purple.50">
                    {splitTransactions.map((split) => (
                      <Flex
                        key={split.split_id}
                        justify="space-between"
                        p={2}
                        borderBottomWidth={splitTransactions.indexOf(split) !== splitTransactions.length - 1 ? "1px" : "0"}
                      >
                        <Text fontSize="sm" fontWeight="medium">{split.category_name}</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          ${split.debit.toFixed(2)}
                        </Text>
                      </Flex>
                    ))}
                  </Box>
                )}
              </Box>
            )}
            
            {/* Transfer details */}
            {transaction.is_transfer && (
              <Box mt={3}>
                <Button
                  size="xs"
                  leftIcon={<FiCreditCard />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    fetchTransferDetails(transaction.transfer_id)
                  }}
                  mb={2}
                >
                  View Transfer Details
                </Button>
                
                {isTransferLoading ? (
                  <Flex justify="center" align="center" h="100px">
                    <Spinner />
                  </Flex>
                ) : transferDetails && (
                  <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50">
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      {transaction.debit > 0 ? 'Transferred to:' : 'Transferred from:'}
                    </Text>
                    <Text fontSize="md" fontWeight="bold">
                      {transaction.debit > 0
                        ? transferDetails.destination_account_name || 'N/A'
                        : transferDetails.source_account_name || 'N/A'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {transaction.debit > 0
                        ? transferDetails.destination_ledger_name || 'N/A'
                        : transferDetails.source_ledger_name || 'N/A'}
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box bg="gray.50" p={useCardView ? 3 : 6} borderRadius="lg">
      {/* No Transactions State */}
      {(!transactions || transactions.length === 0) ? (
        <Box textAlign="center" py={useCardView ? 6 : 10} px={useCardView ? 3 : 6}>
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            No Transactions Found
          </Text>
          <Text color="gray.600" mb={6}>
            You don't have any transactions for this account yet.
          </Text>
          <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={onAddTransaction}>
            Add Transaction
          </Button>
        </Box>
      ) : (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize={useCardView ? "lg" : "xl"} fontWeight="bold">
              Transactions
            </Text>
          </Flex>

          {/* Table View (Desktop & Tablet Landscape) */}
          {!useCardView && (
            <>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th width="8%">Date</Th>
                    <Th width="15%">Category</Th>
                    <Th width="20%">Tags</Th>
                    <Th width="3%">Type</Th>
                    <Th>Notes</Th>
                    <Th width="10%" isNumeric>
                      Credit
                    </Th>
                    <Th width="10%" isNumeric>
                      Debit
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((transaction) => (
                    <Tr key={transaction.transaction_id} _hover={{ bg: 'gray.100' }}>
                      <Td width="8%">{formatDate(transaction.date)}</Td>
                      <Td width="15%">{transaction.category_name}</Td>
                      <Td width="20%">
                        <Wrap spacing={2}>
                          {transaction.tags?.map((tag) => (
                            <WrapItem key={tag.tag_id}>
                              <Tag size="sm" borderRadius="md" variant="subtle" colorScheme="teal">
                                <TagLabel>{tag.name}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Td>
                      <Td width="3%">
                        {transaction.is_split && (
                          <Popover onOpen={() => fetchSplitTransactions(transaction.transaction_id)}>
                            <PopoverTrigger>
                              <Box display="inline-block" p={1}>
                                <Square size="10px" bg="purple.400" cursor="pointer" borderRadius="md" />
                              </Box>
                            </PopoverTrigger>
                            <PopoverContent bg="teal.100" color="white">
                              <PopoverArrow bg="teal.100" />
                              <PopoverBody>
                                {isSplitLoading ? (
                                  <Flex justify="center" align="center" minH="100px">
                                    <Spinner />
                                  </Flex>
                                ) : (
                                  <Table variant="simple" size="sm">
                                    <Thead>
                                      <Tr bgGradient="linear(to-r, teal.400, teal.600)">
                                        <Th color="white">Category</Th>
                                        <Th color="white" isNumeric>
                                          Debit
                                        </Th>
                                        <Th color="white">Notes</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      {splitTransactions.map((split) => (
                                        <Tr key={split.split_id} _hover={{ bg: 'teal.50' }}>
                                          <Td color="teal.900">{split.category_name}</Td>
                                          <Td color="teal.900" isNumeric>
                                            {split.debit.toFixed(2)}
                                          </Td>
                                          <Td color="teal.900">{split.notes}</Td>
                                        </Tr>
                                      ))}
                                    </Tbody>
                                  </Table>
                                )}
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        )}
                        {transaction.is_transfer && (
                          <Popover onOpen={() => fetchTransferDetails(transaction.transfer_id)}>
                            <PopoverTrigger>
                              <Box display="inline-block" p={1}>
                                <Square size="10px" bg="blue.400" cursor="pointer" borderRadius="md" />
                              </Box>
                            </PopoverTrigger>
                            <PopoverContent bg="teal.100" color="white" maxW="300px">
                              <PopoverArrow bg="teal.100" />
                              <PopoverHeader
                                bgGradient="linear(to-r, teal.400, teal.600)"
                                color="white"
                                borderTopRadius="md"
                                py={3}
                                px={4}
                              >
                                <Flex align="center">
                                  <Icon as={FiCreditCard} mr={2} />
                                  <Text fontWeight="bold">
                                    {transaction.debit > 0 ? 'Funds transferred to' : 'Funds transferred from'}
                                  </Text>
                                </Flex>
                              </PopoverHeader>
                              <PopoverBody>
                                {isTransferLoading ? (
                                  <Flex justify="center" align="center" minH="100px">
                                    <Spinner />
                                  </Flex>
                                ) : transferDetails ? (
                                  <Stack spacing={4} py={2}>
                                    <Box
                                      p={4}
                                      borderWidth="1px"
                                      borderRadius="md"
                                      bg="teal.50"
                                      boxShadow="sm"
                                      textAlign="center"
                                    >
                                      <Text fontSize="lg" fontWeight="bold" color="teal.900" mb={2}>
                                        {transaction.debit > 0
                                          ? transferDetails.destination_account_name || 'N/A'
                                          : transferDetails.source_account_name || 'N/A'}
                                      </Text>
                                      <Text fontSize="sm" color="teal.700">
                                        {transaction.debit > 0
                                          ? transferDetails.destination_ledger_name || 'N/A'
                                          : transferDetails.source_ledger_name || 'N/A'}
                                      </Text>
                                    </Box>
                                  </Stack>
                                ) : (
                                  <Text color="teal.900">No transfer details available.</Text>
                                )}
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        )}
                      </Td>
                      <Td>{transaction.notes}</Td>
                      <Td width="10%" isNumeric>
                        {transaction.credit !== 0 && (
                          <Text color="teal.500">{parseFloat(transaction.credit).toFixed(2)}</Text>
                        )}
                      </Td>
                      <Td width="10%" isNumeric>
                        {transaction.debit !== 0 && (
                          <Text color="red.500">{parseFloat(transaction.debit).toFixed(2)}</Text>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}

          {/* Card View (Mobile & Tablet Portrait) */}
          {useCardView && (
            <VStack spacing={3} align="stretch">
              {transactions.map((transaction) => (
                <TransactionCard 
                  key={transaction.transaction_id} 
                  transaction={transaction} 
                />
              ))}
            </VStack>
          )}

          {/* Pagination Controls */}
          {total_pages > 1 && (
            <Flex justifyContent="center" mt={6} alignItems="center">
              <IconButton
                icon={<FiChevronLeft />}
                isDisabled={current_page === 1}
                onClick={() => handlePageChange(current_page - 1)}
                variant="ghost"
                size={useCardView ? "sm" : "md"}
                aria-label="Previous page"
              />
              <Text mx={4} fontSize={useCardView ? "sm" : "md"}>
                {current_page} / {total_pages}
              </Text>
              <IconButton
                icon={<FiChevronRight />}
                isDisabled={current_page === total_pages}
                onClick={() => handlePageChange(current_page + 1)}
                variant="ghost"
                size={useCardView ? "sm" : "md"}
                aria-label="Next page"
              />
            </Flex>
          )}
        </>
      )}
    </Box>
  )
}

export default AccountMainTransactions
