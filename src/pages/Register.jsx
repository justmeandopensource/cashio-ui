import React from 'react'
import { useState } from "react"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const Register = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name || !username || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        status: 'error',
        position: 'top-right',
        duration: 2000,
      })
      return
    }

    // TODO: Implement the API call for sign-up
    console.log('Sign Up Details:', { name, username, email, password });

    // Show success toast (for now)
    toast({
      title: 'Account Created',
      description: 'Your account has been created successfully!',
      status: 'success',
      position: 'top-right',
      duration: 2000,
    })

    navigate('/login')
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
            Create an Account
          </Text>

          <FormControl>
            <Input
              type="text"
              placeholder="Name"
              size="lg"
              focusBorderColor="teal.500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

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
            <Input
              type="email"
              placeholder="Email"
              size="lg"
              focusBorderColor="teal.500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Create Account
          </Button>

          <Text textAlign="center">
            Already have an account?{' '}
            <RouterLink to="/login">
              <Text as="span" color="teal.500" fontWeight="semibold">
                Log In
              </Text>
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
}

export default Register
