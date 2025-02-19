import React from 'react'
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const formDetails = new URLSearchParams()
    formDetails.append("username", username)
    formDetails.append("password", password)

    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: 'Post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDetails,
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        navigate('/')
      } else {
        const errorData = await response.json()
        toast({
          title: 'Login Failed',
          description: errorData.detail || 'Invalid username or password.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred while logging in. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
    }
  }

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.50">
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        maxW="md"
        w="full"
      >
        <VStack as="form" spacing={6} onSubmit={handleSubmit}>
          <Text fontSize="2xl" fontWeight="bold" color="teal.500">
            Welcome Back
          </Text>

          <FormControl>
            <Input
              type="text"
              placeholder="Username"
              size="lg"
              focusBorderColor="teal.500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                size="lg"
                focusBorderColor="teal.500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  _hover={{ bg: 'transparent' }}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            w="full"
            _hover={{ bg: 'teal.600' }}
          >
            Log In
          </Button>

          <Text textAlign="center">
            <Link href="#" color="teal.500" fontWeight="semibold">
              Create an account
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
}

export default Login
