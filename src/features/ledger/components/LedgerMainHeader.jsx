import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'

const LedgerMainHeader = ({ ledger }) => {
  return (
    <Box mb={8}>
      <Heading as="h2" size="lg" mb={4} color="teal.500">
        {ledger.name}
      </Heading>
    </Box>
  )
}

export default LedgerMainHeader
