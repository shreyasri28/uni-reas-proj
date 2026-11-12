import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { AuthContext } from '../App'
import { authService } from '../services/api'

function safeReadStoredUser() {
  try {
    const storedUser = localStorage.getItem('currentUser')
    if (!storedUser) return null
    const parsed = JSON.parse(storedUser)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (error) {
    localStorage.removeItem('currentUser')
    return null
  }
}

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setIsAuthenticated, setCurrentUser } = useContext(AuthContext)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email')
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      try {
        const response = await authService.signin(email, password)
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('currentUser', JSON.stringify(response.user))
        setCurrentUser(response.user)
        setIsAuthenticated(true)
        navigate('/dashboard')
        return
      } catch (backendError) {
        const fallbackUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
        const normalizedEmail = email.trim().toLowerCase()
        const isAdminDemo = normalizedEmail === 'admin@university.edu' && password === 'admin123'
        const isDemoAccount = normalizedEmail === 'demo@university.edu' && password === 'password123'
        const registeredUser = fallbackUsers.find(user => user.email?.toLowerCase() === normalizedEmail)

        if (!isDemoAccount && !isAdminDemo && !registeredUser) {
          throw new Error(backendError.message || 'Account not found. Please create an account first.')
        }
        if (!isDemoAccount && !isAdminDemo && registeredUser.password !== password) {
          throw new Error('Incorrect email or password.')
        }

        const mockUser = isAdminDemo
          ? {
              id: 'demo-admin',
              name: 'Portal Administrator',
              email: 'admin@university.edu',
              role: 'admin',
              department: 'Administration',
              profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PortalAdmin'
            }
          : isDemoAccount
          ? {
              id: 'demo-user',
              name: 'Demo User',
              email: 'demo@university.edu',
              role: 'student',
              department: 'Computer Science',
              profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser'
            }
          : (({ password: _password, ...publicUser }) => publicUser)(registeredUser)

        localStorage.setItem('currentUser', JSON.stringify(mockUser))
        setCurrentUser(mockUser)
        setIsAuthenticated(true)
        navigate('/dashboard')
      }
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              Research Portal
            </h1>
            <p className="text-gray-600">
              University Collaboration Hub
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">New user?</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/register"
            className="w-full block text-center bg-gray-50 hover:bg-gray-100 text-primary-600 font-semibold py-2.5 rounded-lg border border-gray-200 transition duration-200"
          >
            Create Account
          </Link>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-2">💡 Tip:</p>
            <p className="text-xs text-blue-600">Student demo: demo@university.edu / password123. Admin demo: admin@university.edu / admin123.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
