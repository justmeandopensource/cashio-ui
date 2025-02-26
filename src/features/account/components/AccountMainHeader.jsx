import React from 'react'
import { Box, Heading, Text, Button, Flex, useColorModeValue, IconButton } from '@chakra-ui/react'
import { AddIcon, ArrowForwardIcon, ArrowBackIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'

const AccountMainHeader = ({ account, onAddTransaction, onTransferFunds }) => {
  const navigate = useNavigate()

  // Determine the color for the balance based on its value
  const balanceColor = account.net_balance >= 0 ? 'gray.600' : 'red.500'

  // Use Chakra's color mode for consistent styling
  const bgColor = useColorModeValue('white', 'gray.700')
  const buttonColorScheme = useColorModeValue('teal', 'blue')

  const handleBackToLedger = () => {
    navigate(`/ledger/${account.ledger_id}`)
  }

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      boxShadow="md"
      mb={8}
    >
      <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
        {/* Left Section: Back Icon and Account Name */}
        <Box display="flex" alignItems="flex-start">
          {/* Back to Ledger Icon with Light Teal Hover Effect */}
          <IconButton
            aria-label="Back to Ledger"
            icon={<ArrowBackIcon boxSize={6} />}
            variant="ghost"
            color="teal.500"
            size="lg"
            mr={3}
            onClick={handleBackToLedger}
            _hover={{ bg: 'teal.50' }}
          />
          <Box>
            <Heading as="h2" size="lg" color="teal.500" mb={2}>
              {account.name}
            </Heading>
            <Text fontSize="2xl" fontWeight="bold" color={balanceColor}>
              {account.net_balance.toFixed(2)}
            </Text>
          </Box>
        </Box>

        {/* Right Section: Add Transaction and Transfer Funds Buttons */}
        <Flex>
          {/* Button to Add a New Transaction */}
          <Button
            leftIcon={<AddIcon />}
            colorScheme={buttonColorScheme}
            variant="solid"
            mr={4}
            onClick={onAddTransaction}
          >
            Add Transaction
          </Button>

          {/* Button to Transfer Funds */}
          {account.net_balance > 0 && (
            <Button
              rightIcon={<ArrowForwardIcon />}
              colorScheme={buttonColorScheme}
              variant="outline"
              onClick={onTransferFunds}
            >
              Transfer Funds
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

export default AccountMainHeader
