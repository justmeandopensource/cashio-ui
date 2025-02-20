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
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const Register = () => {
  const [full_name, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()
  const fullNameRef = useRef(null)

  useEffect(() => {
    fullNameRef.current?.focus()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!full_name || !username || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        status: 'error',
        position: 'top-right',
        duration: 3000,
      })
      return
    }

  const formDetails = {
    full_name,
    username,
    email,
    password,
  }

    try {
      const response = await axios.post("http://localhost:8000/user/create", formDetails)

      if (response.status == 200) {
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully!',
          status: 'success',
          position: 'top-right',
          duration: 3000,
        })
        navigate('/login')
      } 
    } catch (error) {
      toast({
        title: 'Account creation failed',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        position: 'top-right',
        duration: 3000,
      })
      setFullName('') 
      setUsername('')
      setEmail('')
      setPassword('')
      fullNameRef.current?.focus()
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
            Create an Account
          </Text>

          <FormControl>
            <Input
              ref={fullNameRef}
              type="text"
              placeholder="Name"
              size="lg"
              focusBorderColor="teal.500"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
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
