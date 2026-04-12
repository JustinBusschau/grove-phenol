import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../../src/app/login/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock fetch API
global.fetch = jest.fn()

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock response
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'test-token',
        user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CLINICIAN' }
      })
    })
  })

  it('renders login form elements', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    // Delay the fetch response so we can observe the loading state
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'test-token',
          user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CLINICIAN' }
        })
      }), 100)
    }))

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Check loading state immediately after clicking
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Logging in...')

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent('Login')
    })
  })

  it('validates required fields', () => {
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    expect(screen.getByLabelText(/email/i)).toBeRequired()
    expect(screen.getByLabelText(/password/i)).toBeRequired()
  })
})
