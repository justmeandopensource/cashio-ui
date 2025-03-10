import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  Heading,
  Flex,
  Image,
  ScaleFade,
  FormErrorMessage,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from '@chakra-ui/icons'

const LoginForm = ({
  onSubmit,
  username, setUsername,
  password, setPassword,
  usernameInputRef,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })
  
  // Derived validation states
  const usernameError = touched.username && !username
  const passwordError = touched.password && !password
  
  // Color modes for better theming
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const primaryColor = 'teal.500'
  
  const handleSubmit = (event) => {
    event.preventDefault()
    // Mark all fields as touched to show validation errors
    setTouched({ username: true, password: true })
    
    // Only submit if there are no errors
    if (username && password) {
      onSubmit(event)
    }
  }

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <Box
        bg={bgColor}
        p={{ base: 6, md: 8 }}
        borderRadius="xl"
        boxShadow="xl"
        maxW="md"
        w="full"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack as="form" spacing={{ base: 5, md: 6 }} onSubmit={handleSubmit}>
          {/* Logo/Brand */}
          <Flex justify="center" mb={2}>
            <Image 
              src="/cashio.svg" 
              alt="Cashio Logo"
              boxSize="60px"
              objectFit="contain"
            />
          </Flex>
          
          <Heading fontSize={{ base: "xl", md: "2xl" }} color={primaryColor}>
            Welcome Back
          </Heading>
          
          <FormControl isInvalid={usernameError} isRequired>
            <FormLabel fontSize="sm" fontWeight="medium">Username</FormLabel>
            <InputGroup>
              <InputLeftElement 
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <EmailIcon color="gray.400" />
              </InputLeftElement>
              <Input
                ref={usernameInputRef}
                type="text"
                placeholder="Enter your username"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderRadius="md"
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                autoComplete="username"
              />
            </InputGroup>
            {usernameError && (
              <FormErrorMessage>Username is required</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={passwordError} isRequired>
            <FormLabel fontSize="sm" fontWeight="medium">Password</FormLabel>
            <InputGroup size="lg">
              <InputLeftElement 
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <LockIcon color="gray.400" />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="md"
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                autoComplete="current-password"
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  _hover={{ bg: 'transparent' }}
                  size="sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {passwordError && (
              <FormErrorMessage>Password is required</FormErrorMessage>
            )}
          </FormControl>

          <Button
            type="submit"
            size="lg"
            w="full"
            colorScheme="teal"
            mt={2}
            isLoading={isLoading}
            loadingText="Logging in"
            borderRadius="md"
            boxShadow="md"
            _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
            _active={{ boxShadow: 'md', transform: 'translateY(0)' }}
            transition="all 0.2s"
          >
            Log In
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.600" mt={2}>
            New user?{' '}
            <RouterLink to="/register">
              <Text as="span" color={primaryColor} fontWeight="semibold">
                Create an account
              </Text>
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </ScaleFade>
  )
}

export default LoginForm
