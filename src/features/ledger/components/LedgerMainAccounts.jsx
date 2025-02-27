import React, { useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Button, Icon, useDisclosure, SimpleGrid, Link as ChakraLink } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import CreateAccountModal from '@components/modals/CreateAccountModal'

const LedgerMainAccounts = ({ accounts, ledger, fetchAccounts }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [accountType, setAccountType] = useState(null)
  const [parentAccountId, setParentAccountId] = useState(null)

  // Separate accounts into Assets and Liabilities
  const assetAccounts = accounts.filter((account) => account.type === 'asset')
  const liabilityAccounts = accounts.filter((account) => account.type === 'liability')

  // Helper function to format balance with currency symbol
  const formatBalance = (balance, currencySymbol) => {
    const formattedBalance = Number(balance).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return `${formattedBalance} ${currencySymbol}`
  }

  // Function to compute the balance for group accounts
  const computeGroupBalance = (accountId) => {
    let totalBalance = 0

    // Find all child accounts
    const childAccounts = accounts.filter((account) => account.parent_account_id === accountId)

    // Sum the balances of child accounts
    childAccounts.forEach((childAccount) => {
      if (childAccount.is_group) {
        // If the child is a group account, recursively compute its balance
        totalBalance += computeGroupBalance(childAccount.account_id)
      } else {
        // If the child is a real account, add its balance
        totalBalance += childAccount.net_balance || 0
      }
    })

    return totalBalance
  }

  // Function to render accounts in a nested table format
  const renderAccountsTable = (accounts, parentId = null, level = 0) => {
    return accounts
      .filter((account) => account.parent_account_id === parentId)
      .map((account) => {
        const balance = account.is_group ? computeGroupBalance(account.account_id) : account.net_balance
        return (
          <React.Fragment key={account.account_id}>
            {/* Row for the current account */}
            <Tr
              bg={account.is_group ? 'teal.50' : 'transparent'}
              _hover={!account.is_group ? { bg: 'gray.50' } : undefined} // No hover for group accounts
            >
              <Td pl={`${level * 4 + 4}px`}>
                {!account.is_group ? (
                  <ChakraLink as={RouterLink} to={`/ledger/${ledger.ledger_id}/account/${account.account_id}`} _hover={{ textDecoration: 'none' }}>
                    <Text
                      fontWeight="normal"
                      color="gray.700"
                      fontSize="sm"
                      _hover={{ color: 'teal.500' }}
                    >
                      {account.name}
                    </Text>
                  </ChakraLink>
                ) : (
                  <Text
                    fontWeight="bold"
                    color="teal.600"
                    fontSize="md"
                  >
                    {account.name}
                  </Text>
                )}
              </Td>
              <Td isNumeric>
                <Text
                  fontWeight={account.is_group ? 'bold' : 'normal'}
                  color={account.is_group ? 'teal.600' : 'gray.700'}
                  fontSize={account.is_group ? 'md' : 'sm'}
                >
                  {formatBalance(balance, ledger.currency_symbol)} {/* Format balance */}
                </Text>
              </Td>
              <Td>
                <Box display="flex" gap={2}>
                  {/* Add Child Account Button (for group accounts) */}
                  {account.is_group && (
                    <ChakraLink onClick={() => handleCreateAccountClick(account.type, account.account_id)} _hover={{ textDecoration: 'none' }}>
                      <Icon as={FiPlus} boxSize={4} color="teal.500" _hover={{ color: 'teal.600' }} />
                    </ChakraLink>
                  )}
                </Box>
              </Td>
            </Tr>

            {/* Recursively render child accounts */}
            {renderAccountsTable(accounts, account.account_id, level + 1)}
          </React.Fragment>
        )

      })
  }

  // Open modal for creating a new account
  const handleCreateAccountClick = (type, parentId = null) => {
    setAccountType(type)
    setParentAccountId(parentId)
    onOpen()
  }

  return (
    <Box bg="gray.50" p={6} borderRadius="lg"> {/* Aesthetic background color and padding */}
      {/* Responsive Grid for Assets and Liabilities Tables */}
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={6}>
        {/* Assets Table */}
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: 'md', transition: 'all 0.2s' }} // Hover effect
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="teal.500">
              Assets
            </Text>
            <ChakraLink onClick={() => handleCreateAccountClick('asset')} _hover={{ textDecoration: 'none' }}>
              <Icon as={FiPlus} boxSize={5} color="teal.500" _hover={{ color: 'teal.600' }} />
            </ChakraLink>
          </Box>
          {assetAccounts.length === 0 ? (
            <Box textAlign="center" py={10} px={6}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                No Asset Accounts Found
              </Text>
              <Text color="gray.600" mb={6}>
                You don't have any asset accounts yet.
              </Text>
              <Button leftIcon={<FiPlus />} onClick={() => handleCreateAccountClick('asset')}>
                Create Asset Account
              </Button>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>
                {renderAccountsTable(assetAccounts)}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Liabilities Table */}
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: 'md', transition: 'all 0.2s' }} // Hover effect
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="teal.500">
              Liabilities
            </Text>
            <ChakraLink onClick={() => handleCreateAccountClick('liability')} _hover={{ textDecoration: 'none' }}>
              <Icon as={FiPlus} boxSize={5} color="teal.500" _hover={{ color: 'teal.600' }} />
            </ChakraLink>
          </Box>
          {liabilityAccounts.length === 0 ? (
            <Box textAlign="center" py={10} px={6}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                No Liability Accounts Found
              </Text>
              <Text color="gray.600" mb={6}>
                You don't have any liability accounts yet.
              </Text>
              <Button leftIcon={<FiPlus />} onClick={() => handleCreateAccountClick('liability')}>
                Create Liability Account
              </Button>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>
                {renderAccountsTable(liabilityAccounts)}
              </Tbody>
            </Table>
          )}
        </Box>
      </SimpleGrid>
      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isOpen}
        onClose={onClose}
        ledgerId={ledger.ledger_id}
        accountType={accountType}
        parentAccountId={parentAccountId}
        fetchAccounts={fetchAccounts}
      />
    </Box>
  )
}

export default LedgerMainAccounts
