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
      p={{ base: 4, md: 8 }}
      borderRadius="lg"
      boxShadow="lg"
      maxW="md"
      w="full"
    >
      <VStack as="form" spacing={{ base: 4, md: 6 }} onSubmit={handleSubmit}>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="teal.500">
          Welcome Back
        </Text>

        <FormControl>
          <Input
            ref={usernameInputRef}
            type="text"
            placeholder="Username"
            size={{ base: "md", md: "lg" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              size={{ base: "md", md: "lg" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement h="full" pr={2}>
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
          size={{ base: "md", md: "lg" }}
          w="full"
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
