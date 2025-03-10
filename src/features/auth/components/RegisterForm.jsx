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
  InputLeftElement,
  VStack,
  Text,
  Image,
  Heading,
  Flex,
  FormErrorMessage,
  ScaleFade,
  useColorModeValue,
  Progress,
} from '@chakra-ui/react'
import { 
  ViewIcon, 
  ViewOffIcon, 
  EmailIcon, 
  LockIcon, 
  InfoIcon,
  AtSignIcon 
} from '@chakra-ui/icons'

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
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ 
    full_name: false, 
    username: false, 
    email: false, 
    password: false 
  })
  
  // Password strength indicators
  const getPasswordStrength = (pass) => {
    if (!pass) return 0
    
    let strength = 0
    // Length check
    if (pass.length >= 8) strength += 25
    // Contains lowercase letters
    if (/[a-z]/.test(pass)) strength += 25
    // Contains uppercase letters
    if (/[A-Z]/.test(pass)) strength += 25
    // Contains numbers or special chars
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 25
    
    return strength
  }
  
  const passwordStrength = getPasswordStrength(password)
  
  // Color modes for better theming
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const primaryColor = 'teal.500'
  
  // Validation errors
  const nameError = touched.full_name && !full_name
  const usernameError = touched.username && !username
  const emailError = touched.email && (!email || !/\S+@\S+\.\S+/.test(email))
  const passwordError = touched.password && (!password || password.length < 8)
  
  const handleSubmit = (event) => {
    event.preventDefault()
    // Mark all fields as touched to show validation errors
    setTouched({ 
      full_name: true, 
      username: true, 
      email: true, 
      password: true 
    })
    
    // Only submit if there are no errors
    if (full_name && username && email && password && password.length >= 8 && /\S+@\S+\.\S+/.test(email)) {
      onSubmit(event)
    }
  }

  // Get color for password strength indicator
  const getStrengthColor = (strength) => {
    if (strength < 50) return "red.400"
    if (strength < 75) return "orange.400"
    return "green.400"
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
        <VStack as="form" spacing={{ base: 4, md: 5 }} onSubmit={handleSubmit}>
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
            Create Account
          </Heading>
          
          <FormControl isInvalid={nameError} isRequired>
            <FormLabel fontSize="sm" fontWeight="medium">Full Name</FormLabel>
            <InputGroup>
              <InputLeftElement 
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <InfoIcon color="gray.400" />
              </InputLeftElement>
              <Input
                ref={fullNameRef}
                type="text"
                placeholder="Enter your full name"
                size="lg"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                borderRadius="md"
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                autoComplete="name"
              />
            </InputGroup>
            {nameError && (
              <FormErrorMessage>Full name is required</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={usernameError} isRequired>
            <FormLabel fontSize="sm" fontWeight="medium">Username</FormLabel>
            <InputGroup>
              <InputLeftElement 
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <AtSignIcon color="gray.400" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Create a username"
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

          <FormControl isInvalid={emailError} isRequired>
            <FormLabel fontSize="sm" fontWeight="medium">Email Address</FormLabel>
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
                type="email"
                placeholder="Enter your email"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderRadius="md"
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                autoComplete="email"
              />
            </InputGroup>
            {emailError && (
              <FormErrorMessage>Valid email is required</FormErrorMessage>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="md"
                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                autoComplete="new-password"
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
            
            {/* Password strength indicator */}
            {password && (
              <Box mt={2}>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="xs" color="gray.500">Password strength</Text>
                  <Text fontSize="xs" fontWeight="medium" color={getStrengthColor(passwordStrength)}>
                    {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Good" : "Strong"}
                  </Text>
                </Flex>
                <Progress 
                  value={passwordStrength} 
                  size="xs" 
                  colorScheme={
                    passwordStrength < 50 ? "red" : 
                    passwordStrength < 75 ? "orange" : "green"
                  }
                  borderRadius="full"
                />
              </Box>
            )}
            
            {passwordError && (
              <FormErrorMessage>Password must be at least 8 characters</FormErrorMessage>
            )}
          </FormControl>

          <Button
            type="submit"
            size="lg"
            w="full"
            colorScheme="teal"
            mt={2}
            isLoading={isLoading}
            loadingText="Creating account"
            borderRadius="md"
            boxShadow="md"
            _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
            _active={{ boxShadow: 'md', transform: 'translateY(0)' }}
            transition="all 0.2s"
          >
            Create Account
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.600" mt={1}>
            Already have an account?{' '}
            <RouterLink to="/login">
              <Text as="span" color={primaryColor} fontWeight="semibold">
                Log In
              </Text>
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </ScaleFade>
  )
}

export default RegisterForm
