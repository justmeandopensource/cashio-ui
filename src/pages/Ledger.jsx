import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import LedgerMain from './components/LedgerMain'

const Ledger = () => {
  const navigate = useNavigate()

  // Token verification
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
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

        const data = await response.json()
        console.log('Token verified:', data)
      } catch (error) {
        console.error('Token verification error:', error)
        localStorage.removeItem('access_token')
        navigate('/login')
      }
    }

    verifyToken()
  }, [navigate])

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  return (
    <Layout handleLogout={handleLogout}>
      <LedgerMain />
    </Layout>
  )
}

export default Ledger
