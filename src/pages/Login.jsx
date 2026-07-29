import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginThunk } from '../store/slices/authSlice'
import OtpModal from '../components/OtpModal'
import ForgotPassword from './ForgotPassword'

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
}

export default function Login({ onAuthenticated }) {
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  const [email, setEmail] = useState('superadmin@shieldxkart.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [otpOpen, setOtpOpen] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')

  useEffect(() => {
    if (toastSuccess || toastError) {
      const id = window.setTimeout(() => {
        setToastSuccess('')
        setToastError('')
      }, 2500)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [toastSuccess, toastError])

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

    ;(async () => {
      try {
        const data = await dispatch(loginThunk({ email: email.trim(), password: password.trim() })).unwrap()
        setOtpOpen(true)
        setError('')
        setToastError('')
        setToastSuccess(data?.message || 'OTP sent successfully. Please verify to continue.')
      } catch (err) {
        // thunk rejectWithValue() se err string aa sakta hai
        setOtpOpen(false)
        setToastSuccess('')
        const msg = typeof err === 'string' ? err : err?.message || 'Login failed. Please try again.'
        setToastError(msg)
        setError(msg)
      }
    })()
  }

  if (showForgot) {
    return (
      <ForgotPassword
        onBack={() => setShowForgot(false)}
        onAuthenticated={onAuthenticated}
      />
    )
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
          {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
          {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

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
                setToastSuccess('')
                setToastError('')
              }}
              className="glass-input vendor-field-input"
              placeholder="superadmin@shieldxkart.com"
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
                  setToastSuccess('')
                  setToastError('')
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
            <button type="button" className="link-glow text-xs font-semibold" onClick={() => setShowForgot(true)}>
              Forgot password?
            </button>
          </div>

          {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="login-submit-btn w-full"
            disabled={Boolean(auth?.loading)}
          >
            {auth?.loading ? 'Sending OTP...' : 'Continue'}
          </button>

          <p className="text-center text-[11px] text-slate-500">
            Enter your admin credentials. OTP will be sent to your email for verification.
          </p>
        </form>
      </div>

      <OtpModal
        open={otpOpen}
        email={email.trim()}
        password={password.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={({ email: verifiedEmail, token }) => {
          onAuthenticated?.({ email: verifiedEmail, remember, token })
        }}
      />
    </div>
  )
}
