import {
  Box,
  Flex,
  VStack,
  Heading,
  Link,
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

const Sidebar = ({ handleLogout }) => {

  const sidebarBg = useColorModeValue('teal.500', 'teal.700')
  const sidebarColor = useColorModeValue('white', 'gray.200')

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
          <Link href="#" display="flex" alignItems="center">
            <Icon as={FiHome} mr={2} />
            Home
          </Link>
          <Link href="#" display="flex" alignItems="center">
            <Icon as={FiTrendingUp} mr={2} />
            Investments
          </Link>
          <Link href="#" display="flex" alignItems="center">
            <Icon as={FiFileText} mr={2} />
            Reports
          </Link>
        </VStack>

        {/* User Info and Logout */}
        <Box>
          <Text fontSize="sm" mb={2}>
            Username
          </Text>
          <Link
            href="#"
            display="flex"
            alignItems="center"
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} mr={2} />
            Log Out
          </Link>
        </Box>
      </Box>
  )
}

export default Sidebar
