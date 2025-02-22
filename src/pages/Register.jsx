import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axios from 'axios'
import { Flex, useToast } from '@chakra-ui/react'
import RegisterForm from './components/RegisterForm'

const Register = () => {
  const [full_name, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
      <RegisterForm
        onSubmit={handleSubmit}
        full_name={full_name}
        setFullName={setFullName}
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullNameRef={fullNameRef}
      />
    </Flex>
  )
}

export default Register
