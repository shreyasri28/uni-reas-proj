import { useState, useEffect } from 'react'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function EmailVerificationModal({ email, onVerify }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(45)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus()
    }
  }

  const handleBackspace = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')

    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setError('')
    setLoading(true)

    try {
      await onVerify(fullCode)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-accent-600" />
            </div>
            <h1 className="text-2xl font-bold text-primary-900 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully.
            </p>
            <div className="animate-spin inline-block w-6 h-6 border-3 border-primary-300 border-t-primary-600 rounded-full"></div>
            <p className="text-gray-500 text-sm mt-4">Redirecting...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Mail className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit verification code for<br />
              <span className="font-semibold">{email}</span>
              <span className="block mt-2 text-xs text-blue-700">Local demo code: 123456 (no email is sent)</span>
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
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleBackspace(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-gray-600 text-sm">
                  Didn't get it? Resend in <span className="font-semibold text-primary-600">0:{timer.toString().padStart(2, '0')}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setTimer(45)}
                  className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || code.some(c => !c)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Change Email */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Wrong email?{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Go back
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
