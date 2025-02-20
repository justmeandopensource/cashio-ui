import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axios from 'axios'
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
  const usernameInputRef = useRef(null)

  useEffect(() => {
    usernameInputRef.current?.focus()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        status: 'error',
        position: 'top-right',
        duration: 2000,
      })
      return
    }

    const formDetails = new URLSearchParams()
    formDetails.append("username", username)
    formDetails.append("password", password)

    try {
      const response = await axios.post("http://localhost:8000/user/login", formDetails, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.status == 200) {
        localStorage.setItem('access_token', response.data.access_token)
        navigate('/')
      } 
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        position: 'top-right',
        duration: 2000,
      })
      setUsername('')
      setPassword('')
      usernameInputRef.current?.focus()
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
              ref={usernameInputRef}
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
            New user?{' '}
            <RouterLink to="/register">
              <Text as="span" color="teal.500" fontWeight="semibold">
                Create an account
              </Text>
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
}

export default Login
