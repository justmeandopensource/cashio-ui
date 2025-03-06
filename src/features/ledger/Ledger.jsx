import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Spinner } from '@chakra-ui/react'
import Layout from '@components/Layout'
import LedgerMain from '@features/ledger/components/LedgerMain'

const Ledger = () => {
  const navigate = useNavigate()

  // Token verification
  const { isLoading: isTokenVerifying } = useQuery({
    queryKey: ['verifyToken'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch('http://localhost:8000/user/verify-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Token verification failed')
      }

      return response.json()
    },
    onError: () => {
      localStorage.removeItem('access_token')
      navigate('/login')
    },
    retry: false, // Disable retries to avoid infinite loops
  })

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  if (isTokenVerifying) {
    return (
      <Layout handleLogout={handleLogout}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="teal.500" />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout handleLogout={handleLogout}>
      <LedgerMain />
    </Layout>
  )
}

export default Ledger
