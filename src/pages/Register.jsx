import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { AuthContext } from '../App'
import EmailVerificationModal from '../components/EmailVerificationModal'

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

export default function Register() {
  const [step, setStep] = useState('details') // details, verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setIsAuthenticated, setCurrentUser } = useContext(AuthContext)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.name.trim()) throw new Error('Name is required')
      if (!formData.email.includes('@')) throw new Error('Valid email is required')
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters')
      if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStep('verification')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (code) => {
    try {
      // Demo-only verification. Replace this with authService.verifyEmail when a backend exists.
      if (code !== '123456') {
        throw new Error('Invalid verification code. For local demo, enter 123456.')
      }
      await new Promise(resolve => setTimeout(resolve, 300))

      const mockUser = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        department: formData.department.trim(),
        profileComplete: false,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name.trim())}`
      }

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      if (users.some(user => user.email === mockUser.email)) {
        throw new Error('An account with this email already exists. Please sign in.')
      }
      users.push({ ...mockUser, password: formData.password })
      localStorage.setItem('registeredUsers', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(mockUser))
      setCurrentUser(mockUser)
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      throw err
    }
  }

  if (step === 'verification') {
    return <EmailVerificationModal email={formData.email} onVerify={handleVerifyEmail} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join the research community
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
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="yourname...."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Student</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value="faculty"
                    checked={formData.role === 'faculty'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Faculty/Researcher</span>
                </label>
              </div>
            </div>

            {/* Department Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department/Organization
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Biology"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input type="checkbox" className="w-4 h-4 mt-1 rounded border-gray-300" required />
              <span className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
