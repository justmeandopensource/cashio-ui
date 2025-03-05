import React, { useState } from 'react'
import {
  Box,
  Text,
  Table,
  Thead, Tbody,
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
} from '@chakra-ui/react'
import {
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
} from 'react-icons/fi'
import { Square } from '@chakra-ui/react'
import CreateTransactionModal from '@components/modals/CreateTransactionModal'
import axios from 'axios'

const AccountMainTransactions = ({ transactions, account, fetchTransactions, pagination, onAddTransaction }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [splitTransactions, setSplitTransactions] = useState([])
  const [transferDetails, setTransferDetails] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  // Destructure pagination data
  const { total_transactions, total_pages, current_page, per_page } = pagination

  // Function to handle page change
  const handlePageChange = (page) => {
    fetchTransactions(page)
  }

  // Function to fetch split transactions
  const fetchSplitTransactions = async (transactionId) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/ledger/${account.ledger_id}/transaction/${transactionId}/splits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setSplitTransactions(response.data)
    } catch (error) {
      console.error('Error fetching split transactions:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch split transactions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch transfer transactions
  const fetchTransferDetails = async (transferId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `http://localhost:8000/ledger/transfer/${transferId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setTransferDetails(response.data)
    } catch (error) {
      console.error('Error fetching transfer transactions:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch transfer transactions.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box bg="gray.50" p={6} borderRadius="lg">
      {/* No Transactions State */}
      {total_transactions === 0 ? (
        <Box textAlign="center" py={10} px={6}>
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
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Transactions
          </Text>
          {/* Transactions Table */}
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
                <Tr
                    key={transaction.transaction_id}
                    _hover={{ bg: 'gray.100' }}
                  >
                  <Td width="8%">{new Date(transaction.date).toISOString().split('T')[0].replace(/-/g, '/')}</Td>
                  <Td width="15%">{transaction.category_name}</Td>
                  {/* Tags Column */}
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
                  {/* Type Column */}
                  <Td width="3%">
                  {transaction.is_split && (
                    <Popover onOpen={() => fetchSplitTransactions(transaction.transaction_id)}>
                      <PopoverTrigger>
                        <Box display="inline-block" p={1}>
                          <Square size="10px" bg="purple.400" cursor="pointer" borderRadius="md" /> {/* Filled circle for split */}
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent bg="teal.100" color="white">
                        <PopoverArrow bg="teal.100" />
                        <PopoverBody>
                          {isLoading ? (
                            <Flex justify="center" align="center" minH="100px">
                              <Spinner />
                            </Flex>
                          ) : (
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr bgGradient="linear(to-r, teal.400, teal.600)">
                                  <Th color="white">Category</Th>
                                  <Th color="white" isNumeric>Debit</Th>
                                  <Th color="white">Notes</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {splitTransactions.map((split) => (
                                  <Tr key={split.split_id} _hover={{ bg: 'teal.50' }}>
                                    <Td color="teal.900">{split.category_name}</Td>
                                    <Td color="teal.900" isNumeric>{split.debit.toFixed(2)}</Td>
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
                    <PopoverContent bg="teal.100" color="white"> {/* Set a maximum width for the popover */}
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
                          <Text fontWeight="bold">Funds transferred to</Text>
                        </Flex>
                      </PopoverHeader>
                      <PopoverBody>
                        {isLoading ? (
                          <Flex justify="center" align="center" minH="100px">
                            <Spinner />
                          </Flex>
                        ) : transferDetails ? (
                          <Stack spacing={4} py={2}>
                            {/* Destination Account and Ledger */}
                            <Box
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              bg="teal.50"
                              boxShadow="sm"
                              textAlign="center"
                            >
                              <Text fontSize="lg" fontWeight="bold" color="teal.900" mb={2}>
                                {transferDetails.destination_account_name || 'N/A'}
                              </Text>
                              <Text fontSize="sm" color="teal.700">
                                {transferDetails.destination_ledger_name || 'N/A'}
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

          {/* Pagination Controls */}
          {total_pages > 1 && (
            <Flex justifyContent="center" mt={6}>
              <Button
                isDisabled={current_page === 1}
                onClick={() => handlePageChange(current_page - 1)}
                mr={2}
                leftIcon={<FiChevronLeft />}
                variant="link"
              />
              <Text mx={4}>
                Page {current_page} of {total_pages}
              </Text>
              <Button
                isDisabled={current_page === total_pages}
                onClick={() => handlePageChange(current_page + 1)}
                ml={2}
                rightIcon={<FiChevronRight />}
                variant="link"
              />
            </Flex>
          )}
        </>
      )}
    </Box>
  )
}

export default AccountMainTransactions
