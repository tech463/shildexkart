import { useEffect, useRef, useState } from 'react'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const paths = {
  eye: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  eyePupil: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff: 'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88',
  close: 'M6 18 18 6M6 6l12 12',
  shield: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
}

const DEMO_OTP = '123456'

function OtpModal({ open, email, onClose, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(30)
  const inputsRef = useRef([])

  useEffect(() => {
    if (!open) return undefined
    setDigits(['', '', '', '', '', ''])
    setError('')
    setSeconds(30)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const timer = window.setTimeout(() => inputsRef.current[0]?.focus(), 50)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || seconds <= 0) return undefined
    const id = window.setInterval(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearInterval(id)
  }, [open, seconds])

  if (!open) return null

  const otpValue = digits.join('')

  const updateDigit = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    setDigits((current) => {
      const next = [...current]
      next[index] = cleaned
      return next
    })
    setError('')
    if (cleaned && index < 5) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '')
    setDigits(next)
    setError('')
    const focusIndex = Math.min(pasted.length, 5)
    inputsRef.current[focusIndex]?.focus()
  }

  const verifyOtp = (event) => {
    event.preventDefault()
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }
    if (otpValue !== DEMO_OTP) {
      setError('Invalid OTP. Use 123456 for demo.')
      return
    }
    onVerified()
  }

  const resendOtp = () => {
    if (seconds > 0) return
    setSeconds(30)
    setDigits(['', '', '', '', '', ''])
    setError('')
    inputsRef.current[0]?.focus()
  }

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal login-otp-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="otp-modal-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">OTP </span>
            <span className="vendor-modal-title-accent">Verification</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>

        <form onSubmit={verifyOtp}>
          <div className="vendor-modal-body space-y-5">
            <p className="text-sm text-slate-400">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-slate-200">{email}</span>
            </p>

            <div className="login-otp-row" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={`otp-${index}`}
                  ref={(node) => { inputsRef.current[index] = node }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className="login-otp-input"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}

            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">Demo OTP: {DEMO_OTP}</span>
              <button
                type="button"
                className={`login-resend-btn${seconds > 0 ? ' is-disabled' : ''}`}
                onClick={resendOtp}
                disabled={seconds > 0}
              >
                {seconds > 0 ? `Resend in ${seconds}s` : 'Resend OTP'}
              </button>
            </div>
          </div>

          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit login-submit-btn w-full !min-w-0">
              Verify & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Login({ onAuthenticated }) {
  const [email, setEmail] = useState('admin@shieldx.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [otpOpen, setOtpOpen] = useState(false)

  const handleLogin = (event) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    setError('')
    setOtpOpen(true)
  }

  return (
    <div className="login-page">
      <div className="login-shell neo-card glass-card">
        <span className="card-accent" aria-hidden="true" />

        <div className="login-brand">
          <div className="login-logo-wrap">
            <img src="/shieldx-logo.png" alt="ShieldX logo" className="login-logo" />
          </div>
          <h1 className="login-brand-title">ShieldX</h1>
          <p className="login-brand-sub">Ecommerce Admin</p>
          <p className="login-tagline">Secure · Defend · Protect</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div>
            <h2 className="login-form-title">Sign in</h2>
            <p className="login-form-copy">Enter your credentials to access the admin panel.</p>
          </div>

          <div>
            <label htmlFor="login-email" className="vendor-field-label">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              className="glass-input vendor-field-input"
              placeholder="admin@shieldx.com"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="login-password" className="vendor-field-label">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                className="glass-input vendor-field-input pr-11"
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="account-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <Icon path={paths.eyeOff} />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={paths.eye} />
                    <path strokeLinecap="round" strokeLinejoin="round" d={paths.eyePupil} />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="link-glow text-xs font-semibold">
              Forgot password?
            </button>
          </div>

          {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}

          <button type="submit" className="login-submit-btn w-full">
            Continue
          </button>

          <p className="text-center text-[11px] text-slate-500">
            Use any password (min 4 chars), then OTP <span className="text-slate-300">123456</span>
          </p>
        </form>
      </div>

      <OtpModal
        open={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={() => onAuthenticated?.({ email: email.trim(), remember })}
      />
    </div>
  )
}
