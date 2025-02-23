import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const RegisterForm = ({
  onSubmit,
  full_name,
  setFullName,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  fullNameRef,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(event)
  }

  return (
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
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <Input
            type="text"
            placeholder="Username"
            size="lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <Input
            type="email"
            placeholder="Email"
            size="lg"
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
          size="lg"
          w="full"
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
  )
}

export default RegisterForm
