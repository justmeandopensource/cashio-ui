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
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import CreateTransactionModal from '@components/modals/CreateTransactionModal'

const AccountMainTransactions = ({ transactions, account, fetchTransactions, pagination, onAddTransaction }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Destructure pagination data
  const { total_transactions, total_pages, current_page, per_page } = pagination

  // Function to handle page change
  const handlePageChange = (page) => {
    fetchTransactions(page)
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
                <Th width="10%">Date</Th>
                <Th width="15%">Category</Th>
                <Th width="15%">Tags</Th>
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
                <Tr key={transaction.transaction_id}>
                  <Td width="10%">{new Date(transaction.date).toISOString().split('T')[0].replace(/-/g, '/')}</Td>
                  <Td width="15%">{transaction.category_name}</Td>
                  {/* Tags Column */}
                  <Td width="15%">
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
