'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, isAuthenticated, logout } from '../../lib/auth'
import axios from 'axios'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const userData = getUser()
    setUser(userData)
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/medications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('phenol_token')}`,
        },
        withCredentials: true,
      })

      setMedications(response.data)
    } catch (error) {
      console.error('Failed to fetch medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="container">
      <div className="card mb-4">
        <div className="card-header">
          <h1 className="card-title">Welcome, {user.firstName}!</h1>
          <p className="text-muted">Role: {user.role}</p>
        </div>
        
        <div className="mb-4">
          <h2>Quick Actions</h2>
          <div className="d-flex gap-3">
            <button 
              onClick={() => router.push('/checklists')}
              className="btn btn-primary"
            >
              New Checklist
            </button>
            <button 
              onClick={() => router.push('/medications')}
              className="btn btn-secondary"
            >
              View Medications
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Medications</h2>
        </div>
        
        {loading ? (
          <div className="text-center">Loading medications...</div>
        ) : (
          <div className="medications-grid">
            {medications.slice(0, 6).map((med: any) => (
              <div key={med.id} className="card mb-3">
                <div className="card-body">
                  <h3>{med.name}</h3>
                  <p className="text-muted">{med.description}</p>
                  <div className="medication-details">
                    <span className="badge">{med.concentration}</span>
                    <span className="badge">{med.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <style jsx>{`
        .medications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .medication-details {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .badge {
          background-color: var(--color-info);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.875rem;
        }
        
        .d-flex {
          display: flex;
        }
        
        .gap-3 {
          gap: 0.75rem;
        }
      `}</style>
    </div>
  )
}
