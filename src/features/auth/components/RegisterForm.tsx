import React, { useState, RefObject } from "react";
import { Link as RouterLink } from "react-router-dom";
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
} from "@chakra-ui/react";
import { UserPlus, Eye, EyeOff, Mail, Lock, Info, AtSign } from "lucide-react";

interface RegisterFormProps {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (event: React.FormEvent) => void;
  full_name: string;
  // eslint-disable-next-line no-unused-vars
  setFullName: (name: string) => void;
  username: string;
  // eslint-disable-next-line no-unused-vars
  setUsername: (username: string) => void;
  email: string;
  // eslint-disable-next-line no-unused-vars
  setEmail: (email: string) => void;
  password: string;
  // eslint-disable-next-line no-unused-vars
  setPassword: (password: string) => void;
  fullNameRef: RefObject<HTMLInputElement>;
}

interface TouchedState {
  full_name: boolean;
  username: boolean;
  email: boolean;
  password: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [touched, setTouched] = useState<TouchedState>({
    full_name: false,
    username: false,
    email: false,
    password: false,
  });

  // Password strength indicators
  const getPasswordStrength = (pass: string): number => {
    if (!pass) return 0;

    let strength = 0;
    // Length check
    if (pass.length >= 8) strength += 25;
    // Contains lowercase letters
    if (/[a-z]/.test(pass)) strength += 25;
    // Contains uppercase letters
    if (/[A-Z]/.test(pass)) strength += 25;
    // Contains numbers or special chars
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 25;

    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  // Color modes for better theming
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryColor = "teal.500";

  // Validation errors
  const nameError = touched.full_name && !full_name;
  const usernameError = touched.username && !username;
  const emailError = touched.email && (!email || !/\S+@\S+\.\S+/.test(email));
  const passwordError = touched.password && (!password || password.length < 8);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    // Mark all fields as touched to show validation errors
    setTouched({
      full_name: true,
      username: true,
      email: true,
      password: true,
    });

    // Only submit if there are no errors
    if (
      full_name &&
      username &&
      email &&
      password &&
      password.length >= 8 &&
      /\S+@\S+\.\S+/.test(email)
    ) {
      onSubmit(event);
    }
  };

  // Get color for password strength indicator
  const getStrengthColor = (strength: number): string => {
    if (strength < 50) return "red.400";
    if (strength < 75) return "orange.400";
    return "green.400";
  };

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

          <FormControl isInvalid={nameError}>
            <FormLabel fontSize="sm" fontWeight="medium">
              Full Name
            </FormLabel>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <Info size={18} color="gray" />
              </InputLeftElement>
              <Input
                ref={fullNameRef}
                type="text"
                placeholder="Enter your full name"
                size="lg"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                borderRadius="md"
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}`,
                }}
                autoComplete="name"
              />
            </InputGroup>
            {nameError && (
              <FormErrorMessage>Full name is required</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={usernameError}>
            <FormLabel fontSize="sm" fontWeight="medium">
              Username
            </FormLabel>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <AtSign size={18} color="gray" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Create a username"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderRadius="md"
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}`,
                }}
                autoComplete="username"
              />
            </InputGroup>
            {usernameError && (
              <FormErrorMessage>Username is required</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={emailError}>
            <FormLabel fontSize="sm" fontWeight="medium">
              Email Address
            </FormLabel>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <Mail size={18} color="gray" />
              </InputLeftElement>
              <Input
                type="email"
                placeholder="Enter your email"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderRadius="md"
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}`,
                }}
                autoComplete="email"
              />
            </InputGroup>
            {emailError && (
              <FormErrorMessage>Valid email is required</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={passwordError}>
            <FormLabel fontSize="sm" fontWeight="medium">
              Password
            </FormLabel>
            <InputGroup size="lg">
              <InputLeftElement
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
              >
                <Lock size={18} color="gray" />
              </InputLeftElement>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="md"
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}`,
                }}
                autoComplete="new-password"
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  _hover={{ bg: "transparent" }}
                  size="sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputRightElement>
            </InputGroup>

            {/* Password strength indicator */}
            {password && (
              <Box mt={2}>
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="xs" color="gray.500">
                    Password strength
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color={getStrengthColor(passwordStrength)}
                  >
                    {passwordStrength < 50
                      ? "Weak"
                      : passwordStrength < 75
                        ? "Good"
                        : "Strong"}
                  </Text>
                </Flex>
                <Progress
                  value={passwordStrength}
                  size="xs"
                  colorScheme={
                    passwordStrength < 50
                      ? "red"
                      : passwordStrength < 75
                        ? "orange"
                        : "green"
                  }
                  borderRadius="full"
                />
              </Box>
            )}

            {passwordError && (
              <FormErrorMessage>
                Password must be at least 8 characters
              </FormErrorMessage>
            )}
          </FormControl>

          <Button
            type="submit"
            size="lg"
            w="full"
            colorScheme="teal"
            mt={2}
            loadingText="Creating account"
            borderRadius="md"
            boxShadow="md"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
            _active={{ boxShadow: "md", transform: "translateY(0)" }}
            transition="all 0.2s"
            leftIcon={<UserPlus size={18} />}
          >
            Create Account
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.600" mt={1}>
            Already have an account?{" "}
            <RouterLink to="/login">
              <Text as="span" color={primaryColor} fontWeight="semibold">
                Log In
              </Text>
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </ScaleFade>
  );
};

export default RegisterForm;
