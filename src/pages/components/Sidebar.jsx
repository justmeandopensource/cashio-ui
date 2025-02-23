import {
  Box,
  Flex,
  VStack,
  Heading,
  Link as ChakraLink,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"

import {
  FiHome,
  FiTrendingUp,
  FiFileText,
  FiLogOut,
} from 'react-icons/fi'

import { useNavigate } from 'react-router-dom'

const Sidebar = ({ handleLogout }) => {

  const sidebarBg = useColorModeValue('teal.500', 'teal.700')
  const sidebarColor = useColorModeValue('white', 'gray.200')
  const navigate = useNavigate()

  const handleHomeClick = () => {
    navigate('/')
  }

  return (
      <Box
        w={{ base: 'full', md: '250px' }}
        bg={sidebarBg}
        color={sidebarColor}
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <VStack align="flex-start" spacing={6}>
          <Heading as="h1" size="lg" mb={6}>
            Cashio
          </Heading>
          <ChakraLink display="flex" alignItems="center" onClick={handleHomeClick}>
            <Icon as={FiHome} mr={2} />
            Home
          </ChakraLink>
        </VStack>

        {/* User Info and Logout */}
        <Box>
          <Text fontSize="sm" mb={2}>
            Username
          </Text>
          <ChakraLink
            display="flex"
            alignItems="center"
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} mr={2} />
            Log Out
          </ChakraLink>
        </Box>
      </Box>
  )
}

export default Sidebar
