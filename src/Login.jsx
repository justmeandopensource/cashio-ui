import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const validateForm = () => {
    if (!username || !password) {
      setError("Username and password are required")
      return False
    }
    setError("")
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const formDetails = new URLSearchParams()
    formDetails.append("username", username)
    formDetails.append("password", password)

    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: 'Post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDetails,
      })

      setLoading(false)

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        navigate('/')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Authentication failed!')
      }
    } catch (error) {
      setLoading(false)
      setError('Error logging in: ' + (error.response?.data?.detail || error.message))
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in..' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}

export default Login
