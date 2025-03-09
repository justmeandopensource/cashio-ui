import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Flex, useToast } from '@chakra-ui/react'
import LoginForm from '@features/auth/components/LoginForm'
import config from '@/config'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const toast = useToast()
  const usernameInputRef = useRef(null)

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, [])

  const loginMutation = useMutation({
    mutationFn: (formDetails) =>
      axios.post(`${config.apiBaseUrl}/user/login`, formDetails, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token)
      navigate('/')
    },
    onError: (error) => {
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
    },
  })

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

    loginMutation.mutate(formDetails)
  }

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.50" px={{ base: 4, md: 0 }}>
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
  )
}

export default Login
