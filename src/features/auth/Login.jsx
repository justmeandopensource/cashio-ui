import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axios from 'axios'
import { Flex, useToast } from '@chakra-ui/react'
import LoginForm from '@features/auth/components/LoginForm'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const toast = useToast()
  const usernameInputRef = useRef(null)

  useEffect(() => {
    usernameInputRef.current?.focus()
  }, [])

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

    try {
      const response = await axios.post("http://localhost:8000/user/login", formDetails, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.status == 200) {
        localStorage.setItem('access_token', response.data.access_token)
        navigate('/')
      } 
    } catch (error) {
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
    }
  }

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.50">
      <LoginForm
        onSubmit={handleSubmit}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        usernameInputRef={usernameInputRef}
      />
    </Flex>
  )
}

export default Login
