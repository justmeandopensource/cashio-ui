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

const LoginForm = ({
  onSubmit,
  username, setUsername,
  password, setPassword,
  usernameInputRef
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
  )
}

export default LoginForm
