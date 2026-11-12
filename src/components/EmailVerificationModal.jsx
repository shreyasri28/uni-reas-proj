import { useState, useEffect } from 'react'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function EmailVerificationModal({ email, onVerify, onResend }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => setTimer(value => value - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus()
  }

  const handleBackspace = (index, event) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus()
    }
  }

  const handleVerify = async event => {
    event.preventDefault()
    const fullCode = code.join('')
    if (!/^\d{6}$/.test(fullCode)) {
      setError('Enter the 6-digit code sent to your email.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onVerify(fullCode)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    setResending(true)
    try {
      const result = await onResend()
      setNotice(result?.message || 'A new verification code has been sent.')
      setTimer(60)
      setCode(['', '', '', '', '', ''])
    } catch (err) {
      setError(err.message || 'Could not resend the verification code.')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-accent-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600">Your account has been created successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">Enter the 6-digit verification code sent to</p>
          <p className="font-semibold text-primary-800 mt-1 break-all">{email}</p>
          <p className="text-xs text-gray-500 mt-2">Check your inbox and spam folder. The code expires in 10 minutes.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {notice && <p className="mb-4 text-sm text-green-700 text-center">{notice}</p>}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Verification Code</label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={event => handleCodeChange(index, event.target.value)}
                  onKeyDown={event => handleBackspace(index, event)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={`Verification digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-gray-600 text-sm">You can request another code in <span className="font-semibold text-primary-600">0:{String(timer).padStart(2, '0')}</span></p>
            ) : (
              <button type="button" onClick={handleResend} disabled={resending} className="text-primary-600 hover:text-primary-700 font-semibold text-sm disabled:opacity-50">
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
            )}
          </div>

          <button type="submit" disabled={loading || code.some(value => !value)} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/register" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">Wrong email? Go back</a>
        </div>
      </div>
    </div>
  )
}
