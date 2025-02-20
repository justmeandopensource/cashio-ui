import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Link,
  Flex,
  Heading,
  Box,
  Spinner
} from '@chakra-ui/react'

const Home = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

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

        const data = await response.json()
        console.log('Token verified:', data)
      } catch (error) {
        localStorage.removeItem('access_token')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [navigate])

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    )
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      bg="gray.50"
      pt={8}
    >
      <Box textAlign="center">
        <Heading as="h1" size="2xl" color="teal.500">
          Dashboard
        </Heading>
        <Box mt={4}>
          <Link
            color="teal.500"
            fontWeight="semibold"
            href="#"
            onClick={handleLogout}
            _hover={{ textDecoration: 'underline' }}
          >
            Log Out
          </Link>
        </Box>
      </Box>
    </Flex>
  )
}

export default Home
