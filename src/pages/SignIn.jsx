import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { AuthContext } from '../App'
import { authService } from '../services/api'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setIsAuthenticated, setCurrentUser } = useContext(AuthContext)

  const handleSignIn = async event => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!email.includes('@')) throw new Error('Please enter a valid email address.')
      if (!password) throw new Error('Please enter your password.')
      const response = await authService.signin(email.trim(), password)
      setCurrentUser(response.user)
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Research Portal</h1>
            <p className="text-gray-600">University Collaboration Hub</p>
          </div>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@university.edu" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm">New user?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <Link to="/register" className="w-full block text-center bg-gray-50 hover:bg-gray-100 text-primary-600 font-semibold py-2.5 rounded-lg border border-gray-200">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
