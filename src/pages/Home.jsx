import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch("http://localhost:8000/user/verify-token", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          localStorage.removeItem('access_token')
          throw new Error('Token verification failed')
        }

        return await response.json()
      } catch (error) {
        localStorage.removeItem('access_token')
        navigate('/login')
      }
    }

    verifyToken()
  }, [navigate])

  return (
    <div>
      <h1> Home </h1>
    </div>
  )
}

export default Home
