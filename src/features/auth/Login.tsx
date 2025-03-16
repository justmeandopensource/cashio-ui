import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Flex, useToast } from "@chakra-ui/react";
import LoginForm from "@features/auth/components/LoginForm";
import config from "@/config";

interface LoginResponse {
  access_token: string;
}

interface ErrorResponse {
  detail?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();
  const toast = useToast();
  const usernameInputRef = useRef<HTMLInputElement>(null as any);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const loginMutation = useMutation({
    mutationFn: (formDetails: URLSearchParams) =>
      axios.post<LoginResponse>(
        `${config.apiBaseUrl}/user/login`,
        formDetails,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      ),
    onSuccess: (response: AxiosResponse<LoginResponse>) => {
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message,
        status: "error",
        position: "top-right",
        duration: 2000,
      });
      setUsername("");
      setPassword("");
      usernameInputRef.current?.focus();
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        status: "error",
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    const formDetails = new URLSearchParams();
    formDetails.append("username", username);
    formDetails.append("password", password);

    loginMutation.mutate(formDetails);
  };

  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.50"
      px={{ base: 4, md: 0 }}
    >
      <LoginForm
        onSubmit={handleSubmit}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        usernameInputRef={usernameInputRef}
        maxW="400px"
        w="100%"
      />
    </Flex>
  );
};

export default Login;
