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
  IconButton,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Stack,
  Divider,
  useBreakpointValue
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiPlus, FiRepeat, FiChevronsRight } from 'react-icons/fi'
import CreateAccountModal from '@components/modals/CreateAccountModal'
import { currencySymbols, formatNumberAsCurrency } from '@components/shared/currencyUtils'
import config from '@/config'

const LedgerMainAccounts = ({ accounts, ledger, onAddTransaction, onTransferFunds, fetchAccounts }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [accountType, setAccountType] = useState(null)
  const [parentAccountId, setParentAccountId] = useState(null)
  const [showZeroBalanceAssets, setShowZeroBalanceAssets] = useState(false)
  const [showZeroBalanceLiabilities, setShowZeroBalanceLiabilities] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState({})
  const queryClient = useQueryClient()
  const toast = useToast()
  
  // Determine display mode based on screen size
  const displayMode = useBreakpointValue({
    base: 'card',
    md: 'card',
    lg: 'card',
    xl: 'table'
  }, {
    ssr: true,
    fallback: 'card'
  })

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

  // Toggle expansion of group accounts
  const toggleGroupExpansion = (accountId, event) => {
    // Stop propagation to prevent navigation if this is inside a link
    event.stopPropagation()
    setExpandedGroups(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
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

  // Open modal for creating a new account
  const handleCreateAccountClick = (type, parentId = null) => {
    setAccountType(type)
    setParentAccountId(parentId)
    onOpen()
  }

  // Function to render accounts in table format (for larger screens)
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
                  <ChakraLink
                    as={RouterLink}
                    to={`/ledger/${ledger.ledger_id}/account/${account.account_id}`}
                    state={{ currencySymbol: ledger.currency_symbol }}
                    hover={{ textDecoration: 'none' }}
                  >
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
                  {formatNumberAsCurrency(balance, ledger.currency_symbol)}
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

  // Function to render accounts in card format (for mobile/tablet)
  const renderAccountsAccordion = (accounts, parentId = null, level = 0, showZeroBalance) => {
    const filteredAccounts = accounts
      .filter((account) => account.parent_account_id === parentId)
      .filter((account) => showZeroBalance || (account.is_group ? computeGroupBalance(account.account_id) !== 0 : account.net_balance !== 0))
    
    if (filteredAccounts.length === 0) return null
    
    return (
      <Stack spacing={3} pl={level > 0 ? 4 : 0} mt={level > 0 ? 3 : 0} mb={level > 0 ? 3 : 0}>
        {filteredAccounts.map((account) => {
          const balance = account.is_group ? computeGroupBalance(account.account_id) : account.net_balance
          const balanceColor = getBalanceColor(balance, account.type, account.is_group)
          const hasChildren = accounts.some(a => a.parent_account_id === account.account_id)
          const isExpanded = expandedGroups[account.account_id]
          
          return (
            <Card 
              key={account.account_id}
              variant={account.is_group ? "filled" : "outline"}
              bg={account.is_group ? "teal.50" : "white"}
              borderColor={account.is_group ? "teal.200" : "gray.200"}
              size="sm"
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
            >
              <CardHeader 
                py={2} 
                px={3} 
                onClick={account.is_group && hasChildren ? (e) => toggleGroupExpansion(account.account_id, e) : undefined}
                cursor={account.is_group && hasChildren ? "pointer" : "default"}
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Flex direction="column" flex="1">
                    <Flex alignItems="center" gap={2} mb={1}>
                      {!account.is_group ? (
                        <ChakraLink 
                          as={RouterLink} 
                          to={`/ledger/${ledger.ledger_id}/account/${account.account_id}`}
                          state={{ currencySymbol: ledger.currency_symbol }}
                          _hover={{ textDecoration: 'none' }}
                        >
                          <Text
                            fontWeight={account.is_group ? "medium" : "normal"}
                            color={account.is_group ? "teal.700" : "gray.700"}
                          >
                            {account.name}
                          </Text>
                        </ChakraLink>
                      ) : (
                        <Text
                          fontWeight="medium"
                          color="teal.700"
                        >
                          {account.name}
                        </Text>
                      )}
                    </Flex>
                    
                    <Text
                      fontWeight={account.is_group ? "medium" : "normal"}
                      color={balanceColor}
                    >
                      {formatNumberAsCurrency(balance, ledger.currency_symbol)}
                    </Text>
                  </Flex>
                  
                  {/* Action icons based on account type */}
                  {!account.is_group ? (
                    <Flex gap={1} align="center" justify="flex-end">
                      <IconButton
                        icon={<FiPlus />}
                        size="xs"
                        colorScheme="teal"
                        variant="ghost"
                        aria-label="Add Transaction"
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddTransaction(account.account_id)
                        }}
                      />
                      <IconButton
                        icon={<FiRepeat />}
                        size="xs"
                        colorScheme="teal"
                        variant="ghost"
                        aria-label="Transfer Funds"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTransferFunds(account.account_id)
                        }}
                      />
                    </Flex>
                  ) : (
                    <IconButton
                      icon={<FiPlus />}
                      size="xs"
                      colorScheme="teal"
                      variant="ghost"
                      aria-label="Add Account"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateAccountClick(account.type, account.account_id)
                      }}
                    />
                  )}
                </Flex>
              </CardHeader>
              
              {/* For group accounts with children, render children only if expanded */}
              {account.is_group && hasChildren && isExpanded && (
                <Box px={3} pb={3}>
                  {renderAccountsAccordion(accounts, account.account_id, level + 1, showZeroBalance)}
                </Box>
              )}
            </Card>
          )
        })}
      </Stack>
    )
  }

  // Empty state component
  const EmptyState = ({ title, message, buttonText, onClick }) => (
    <Box textAlign="center" py={6} px={4}>
      <Text fontSize="lg" fontWeight="medium" mb={2}>
        {title}
      </Text>
      <Text color="gray.600" mb={4} fontSize="sm">
        {message}
      </Text>
      <Button leftIcon={<FiPlus />} onClick={onClick} size="sm" colorScheme="teal">
        {buttonText}
      </Button>
    </Box>
  )

  return (
    <Box bg="gray.50" p={{ base: 3, md: 4, lg: 6 }} borderRadius="lg">
      {/* Responsive Grid for Assets and Liabilities */}
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
        {/* Assets Section */}
        <Box
          bg="white"
          p={{ base: 3, md: 4 }}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: 'md', transition: 'all 0.2s' }}
        >
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            mb={4}
            flexWrap={{ base: 'wrap', sm: 'nowrap' }}
            gap={2}
          >
            <Heading size="md" color="teal.500" mb={{ base: 1, sm: 0 }}>
              Assets
            </Heading>
            
            <Flex align="center" gap={2} ml="auto">
              <Button
                size="xs"
                variant="ghost"
                colorScheme="teal"
                onClick={() => setShowZeroBalanceAssets(!showZeroBalanceAssets)}
              >
                {showZeroBalanceAssets ? 'Hide zero balances' : 'Show zero balances'}
              </Button>
              
              <IconButton
                icon={<FiPlus />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                aria-label="Add Asset Account"
                onClick={() => handleCreateAccountClick('asset')}
              />
            </Flex>
          </Flex>

          {/* Conditional rendering for Assets */}
          {assetAccounts.length === 0 ? (
            <EmptyState
              title="No Asset Accounts"
              message="You don't have any asset accounts yet."
              buttonText="Create Asset Account"
              onClick={() => handleCreateAccountClick('asset')}
            />
          ) : displayMode === 'table' ? (
            <Table variant="simple" size="sm">
              <Tbody>
                {renderAccountsTable(assetAccounts, null, 0, showZeroBalanceAssets)}
              </Tbody>
            </Table>
          ) : (
            renderAccountsAccordion(assetAccounts, null, 0, showZeroBalanceAssets)
          )}
        </Box>

        {/* Liabilities Section */}
        <Box
          bg="white"
          p={{ base: 3, md: 4 }}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: 'md', transition: 'all 0.2s' }}
        >
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            mb={4}
            flexWrap={{ base: 'wrap', sm: 'nowrap' }}
            gap={2}
          >
            <Heading size="md" color="teal.500" mb={{ base: 1, sm: 0 }}>
              Liabilities
            </Heading>
            
            <Flex align="center" gap={2} ml="auto">
              <Button
                size="xs"
                variant="ghost"
                colorScheme="teal"
                onClick={() => setShowZeroBalanceLiabilities(!showZeroBalanceLiabilities)}
              >
                {showZeroBalanceLiabilities ? 'Hide zero balances' : 'Show zero balances'}
              </Button>
              
              <IconButton
                icon={<FiPlus />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                aria-label="Add Liability Account"
                onClick={() => handleCreateAccountClick('liability')}
              />
            </Flex>
          </Flex>

          {/* Conditional rendering for Liabilities */}
          {liabilityAccounts.length === 0 ? (
            <EmptyState
              title="No Liability Accounts"
              message="You don't have any liability accounts yet."
              buttonText="Create Liability Account"
              onClick={() => handleCreateAccountClick('liability')}
            />
          ) : displayMode === 'table' ? (
            <Table variant="simple" size="sm">
              <Tbody>
                {renderAccountsTable(liabilityAccounts, null, 0, showZeroBalanceLiabilities)}
              </Tbody>
            </Table>
          ) : (
            renderAccountsAccordion(liabilityAccounts, null, 0, showZeroBalanceLiabilities)
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
