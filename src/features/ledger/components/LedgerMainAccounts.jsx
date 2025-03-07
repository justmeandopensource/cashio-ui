import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Icon,
  useDisclosure,
  useToast,
  SimpleGrid,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiPlus, FiRepeat } from 'react-icons/fi'
import CreateAccountModal from '@components/modals/CreateAccountModal'
import config from '@/config'

const LedgerMainAccounts = ({ accounts, ledger, onAddTransaction, onTransferFunds, fetchAccounts }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [accountType, setAccountType] = useState(null)
  const [parentAccountId, setParentAccountId] = useState(null)
  const [showZeroBalanceAssets, setShowZeroBalanceAssets] = useState(false)
  const [showZeroBalanceLiabilities, setShowZeroBalanceLiabilities] = useState(false)
  const queryClient = useQueryClient()
  const toast = useToast()

  // Mutation for creating a new account
  const createAccountMutation = useMutation({
    mutationFn: async ({ name, type, parentAccountId }) => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${config.apiBaseUrl}/ledger/${ledger.ledger_id}/accounts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, parent_account_id: parentAccountId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create account')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate the accounts query to refetch the data
      queryClient.invalidateQueries(['accounts', ledger.ledger_id])
      onClose()
      toast({
        title: 'Success',
        description: 'Account created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    },
  })

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

  // Helper function to determine text color based on account type, balance, and whether it's a group account
  const getBalanceColor = (balance, accountType, isGroup) => {
    if (accountType === 'asset') {
      if (isGroup && balance >= 0) {
        return 'teal.600' // Group account with non-negative balance in Assets table
      } else if (balance < 0) {
        return 'red.400' // Negative balance in Assets table
      }
    } else if (accountType === 'liability') {
      if (isGroup && balance < 0) {
        return 'teal.600' // Group account with negative balance in Liabilities table
      } else if (balance > 0) {
        return 'red.400' // Positive balance in Liabilities table
      }
    }
    return 'gray.700' // Default color
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
  const renderAccountsTable = (accounts, parentId = null, level = 0, showZeroBalance) => {
    return accounts
      .filter((account) => account.parent_account_id === parentId)
      .filter((account) => showZeroBalance || (account.is_group ? computeGroupBalance(account.account_id) !== 0 : account.net_balance !== 0))
      .map((account) => {
        const balance = account.is_group ? computeGroupBalance(account.account_id) : account.net_balance
        const balanceColor = getBalanceColor(balance, account.type, account.is_group)
        return (
          <React.Fragment key={account.account_id}>
            {/* Row for the current account */}
            <Tr
              bg={account.is_group ? 'teal.50' : 'transparent'}
              _hover={{ bg: 'gray.50' }}
              position="relative"
              sx={!account.is_group ? {
                '&:hover .action-icons': {
                  opacity: 1
                }
              } : {}}
            >
              <Td pl={`${level * 24 + 8}px`}>
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
                  color={balanceColor}
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
                  {/* Icons for non-group accounts (shown on hover) */}
                  {!account.is_group && (
                    <Flex gap={2} opacity={0} transition="opacity 0.2s" className='action-icons'>
                      {/* Add Transaction Icon */}
                      <ChakraLink onClick={() => onAddTransaction(account.account_id)} _hover={{ textDecoration: 'none' }}>
                        <Icon as={FiPlus} boxSize={4} color="teal.500" _hover={{ color: 'teal.600' }} />
                      </ChakraLink>

                      {/* Transfer Funds Icon */}
                      <ChakraLink onClick={() => onTransferFunds(account.account_id)} _hover={{ textDecoration: 'none' }}>
                        <Icon as={FiRepeat} boxSize={4} color="teal.500" _hover={{ color: 'teal.600' }} />
                      </ChakraLink>
                    </Flex>
                  )}
                </Box>
              </Td>
            </Tr>
            {/* Recursively render child accounts */}
            {renderAccountsTable(accounts, account.account_id, level + 1, showZeroBalance)}
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
            <Flex align="center" gap={4}>
              <Text fontSize="xl" fontWeight="bold" color="teal.500">
                Assets
              </Text>
              <ChakraLink
                onClick={() => setShowZeroBalanceAssets(!showZeroBalanceAssets)}
                _hover={{ textDecoration: 'none', color: 'teal.600' }}
                color="teal.500"
                fontSize="sm"
                fontWeight="medium"
              >
                {showZeroBalanceAssets ? 'Hide zero balance accounts' : 'Show zero balance accounts'}
              </ChakraLink>
            </Flex>
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
                {renderAccountsTable(assetAccounts, null, 0, showZeroBalanceAssets)}
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
            <Flex align="center" gap={4}>
              <Text fontSize="xl" fontWeight="bold" color="teal.500">
                Liabilities
              </Text>
              <ChakraLink
                onClick={() => setShowZeroBalanceLiabilities(!showZeroBalanceLiabilities)}
                _hover={{ textDecoration: 'none', color: 'teal.600' }}
                color="teal.500"
                fontSize="sm"
                fontWeight="medium"
              >
                {showZeroBalanceLiabilities ? 'Hide zero balance accounts' : 'Show zero balance accounts'}
              </ChakraLink>
            </Flex>
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
                {renderAccountsTable(liabilityAccounts, null, 0, showZeroBalanceLiabilities)}
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
        onCreateAccount={createAccountMutation.mutate}
      />
    </Box>
  )
}

export default LedgerMainAccounts
