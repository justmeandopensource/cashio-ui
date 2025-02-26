import React from 'react'
import { Box, Heading, Text, Button, Flex, useColorModeValue } from '@chakra-ui/react'
import { AddIcon, ArrowForwardIcon } from '@chakra-ui/icons'

const AccountMainHeader = ({ account, onAddTransaction, onTransferFunds }) => {
  // Determine the color for the balance based on its value
  const balanceColor = account.net_balance >= 0 ? 'gray.600' : 'red.500'

  // Use Chakra's color mode for consistent styling
  const bgColor = useColorModeValue('white', 'gray.700')
  const buttonColorScheme = useColorModeValue('teal', 'blue')

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      boxShadow="md"
      mb={8}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Heading as="h2" size="lg" color="teal.500" mb={2}>
            {account.name}
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color={balanceColor}>
            {account.net_balance.toFixed(2)}
          </Text>
        </Box>

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
          <Button
            rightIcon={<ArrowForwardIcon />}
            colorScheme={buttonColorScheme}
            variant="outline"
            onClick={onTransferFunds}
          >
            Transfer Funds
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default AccountMainHeader
