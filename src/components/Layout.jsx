import { Flex, Box } from "@chakra-ui/react"
import Sidebar from "@components/Sidebar"

const Layout = ({ 
  children, 
  handleLogout,
}) => {

  return (

    <Flex minH="100vh" direction={{ base: "column", md: "row" }}>

      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <Box flex={1} p={{ base: 4, md: 8 }}>
        {children}
      </Box>

    </Flex>

  )
}

export default Layout
