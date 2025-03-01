import React from 'react'
import { Box, Heading, Text, Button, Flex, useColorModeValue, IconButton } from '@chakra-ui/react'
import { AddIcon, ArrowForwardIcon, ArrowBackIcon, EditIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'

const LedgerMainHeader = ({ ledger, hasAccounts }) => {
  const navigate = useNavigate()

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
      <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
        {/* Left Section: Back Icon and Ledger Name */}
        <Box display="flex" alignItems="flex-start">
          {/* Back to Home Icon with Light Teal Hover Effect */}
          <IconButton
            aria-label="Back to Home"
            icon={<ArrowBackIcon boxSize={6} />}
            variant="ghost"
            color="teal.500"
            size="lg"
            mr={3}
            onClick={() => navigate('/')}
            _hover={{ bg: 'teal.50' }}
          />
          <Box>
            <Flex alignItems="center">
              <Heading as="h2" size="lg" color="teal.500" mb={2} mr={2}>
                {ledger.name}
              </Heading>
              <IconButton
                aria-label="Edit Account"
                icon={<EditIcon boxSize={4} />}
                variant="ghost"
                color="teal.500"
                size="sm"
              />
            </Flex>
          </Box>
        </Box>

        {/* Right Section: Add Transaction and Transfer Funds Buttons */}
        {hasAccounts && (
          <Flex>
            {/* Button to Add a New Transaction */}
            <Button
              leftIcon={<AddIcon />}
              colorScheme={buttonColorScheme}
              variant="solid"
              mr={4}
            >
              Add Transaction
            </Button>

            {/* Button to Transfer Funds */}
            <Button
              rightIcon={<ArrowForwardIcon />}
              colorScheme={buttonColorScheme}
              variant="outline"
            >
              Transfer Funds
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

export default LedgerMainHeader
