import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Link,
  Flex,
  Heading,
  Box
} from '@chakra-ui/react'

function Home() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch("http://localhost:8000/user/verify-token", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          localStorage.removeItem('access_token')
          throw new Error('Token verification failed')
        }

        return await response.json()
      } catch (error) {
        localStorage.removeItem('access_token')
        navigate('/login')
      }
    }

    verifyToken()
  }, [navigate])

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      bg="gray.50"
      pt={8} // Add padding at the top
    >
      <Box textAlign="center">
        <Heading as="h1" size="2xl" color="teal.500">
          Dashboard
        </Heading>
        {/* Add spacing here */}
        <Box mt={4}> {/* Add margin-top for space */}
          <Link
            color="teal.500"
            fontWeight="semibold"
            href="#" // Add href to make it a valid link
            onClick={handleLogout} // Handle logout on click
            _hover={{ textDecoration: 'underline' }} // Add hover effect
          >
            Log Out
          </Link>
        </Box>
      </Box>
    </Flex>
  )
}

export default Home
