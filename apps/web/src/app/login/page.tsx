'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  console.log('Login page component loaded!')

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called!', e)
    e.preventDefault()
    console.log('FORM SUBMITTED!', { email, password })
    setIsLoading(true)
    setError('')
    
    try {
      // Direct fetch call to test
      console.log('Making direct API call...')
      const response = await fetch('http://localhost:23001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        localStorage.setItem('phenol_token', data.access_token)
        localStorage.setItem('phenol_user', JSON.stringify(data.user))
        console.log('Login successful, redirecting...')
        router.push('/dashboard')
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div className="card-header">
        <h1 className="card-title">Login</h1>
      </div>
      
      {/* Test button to verify JavaScript */}
      <button 
        onClick={() => console.log('TEST BUTTON CLICKED! JavaScript is working!')}
        style={{ marginBottom: '1rem', background: 'orange', color: 'white' }}
      >
        Test JavaScript
      </button>
      
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
