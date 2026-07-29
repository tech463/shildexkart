import { useEffect, useState } from 'react'
import ForgotOtpModal from '../components/ForgotOtpModal'
import { forgotPasswordAPI, resetPasswordAPI } from '../services/authService'

export default function ForgotPassword({ onBack, onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [otpOpen, setOtpOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetOtp, setResetOtp] = useState('')
  const [resetToken, setResetToken] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (!toastSuccess && !toastError) return undefined
    const id = window.setTimeout(() => {
      setToastSuccess('')
      setToastError('')
    }, 2500)
    return () => window.clearTimeout(id)
  }, [toastSuccess, toastError])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    const run = async () => {
      setSendingOtp(true)
      setError('')
      setToastSuccess('')
      setToastError('')
      try {
        const data = await forgotPasswordAPI({ email: email.trim() })
        if (!data?.success) {
          const msg = data?.message || 'Failed to send OTP.'
          setError(msg)
          setToastError(msg)
          return
        }
        const msg = data?.message || 'OTP sent. Please verify to reset your password.'
        setToastSuccess(msg)
        setOtpOpen(true)
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to send OTP.'
        setError(msg)
        setToastError(msg)
      } finally {
        setSendingOtp(false)
      }
    }

    run()
  }

  const handleResetPassword = (event) => {
    event.preventDefault()

    const emailTrim = email.trim()
    if (!emailTrim) {
      setError('Email is missing.')
      return
    }
    if (!resetToken) {
      setError('Reset token is missing. Please verify OTP again.')
      return
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please enter new password.')
      return
    }
    if (newPassword.trim().length < 4) {
      setError('New password must be at least 4 characters.')
      return
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('New password and confirm password do not match.')
      return
    }

    const run = async () => {
      setResetting(true)
      setError('')
      setToastSuccess('')
      setToastError('')
      try {
        const data = await resetPasswordAPI({
          email: emailTrim,
          resetToken,
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        })

        if (!data?.success) {
          const msg = data?.message || 'Password reset failed.'
          setError(msg)
          setToastError(msg)
          return
        }

        const msg = data?.message || 'Password reset successfully.'
        setToastSuccess(msg)
        setResetOpen(false)
        setOtpOpen(false)
        setResetOtp('')
        setResetToken('')
        setNewPassword('')
        setConfirmPassword('')
        onBack?.()
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Password reset failed.'
        setError(msg)
        setToastError(msg)
      } finally {
        setResetting(false)
      }
    }

    run()
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

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

        {!resetOpen ? (
          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <h2 className="login-form-title">Forgot password?</h2>
              <p className="login-form-copy">
                Enter your email and we&apos;ll send you an OTP to continue.
              </p>
            </div>

            <div>
              <label htmlFor="forgot-email" className="vendor-field-label">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                  setToastError('')
                  setToastSuccess('')
                }}
                className="glass-input vendor-field-input"
                placeholder="superadmin@shieldxkart.com"
                autoComplete="username"
                autoFocus
              />
            </div>

            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}

            <button
              type="submit"
              className="login-submit-btn w-full"
              disabled={sendingOtp}
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </button>

            <button
              type="button"
              className="link-glow text-xs font-semibold text-center w-full"
              onClick={onBack}
            >
              Back to Sign in
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleResetPassword}>
            <div>
              <h2 className="login-form-title">Reset password</h2>
              <p className="login-form-copy">OTP verified. Set your new password.</p>
            </div>

            <div>
              <label htmlFor="reset-new-password" className="vendor-field-label">New Password</label>
              <input
                id="reset-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  setError('')
                  setToastError('')
                  setToastSuccess('')
                }}
                className="glass-input vendor-field-input"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="vendor-field-label">Confirm Password</label>
              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setError('')
                  setToastError('')
                  setToastSuccess('')
                }}
                className="glass-input vendor-field-input"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}

            <button
              type="submit"
              className="login-submit-btn w-full"
              disabled={resetting}
            >
              {resetting ? 'Updating...' : 'Update Password'}
            </button>

            <button
              type="button"
              className="link-glow text-xs font-semibold text-center w-full"
              onClick={() => {
                setResetOpen(false)
                setOtpOpen(false)
                setResetOtp('')
                setResetToken('')
                setNewPassword('')
                setConfirmPassword('')
                setError('')
                setToastError('')
                setToastSuccess('')
              }}
            >
              Back
            </button>
          </form>
        )}
      </div>

      <ForgotOtpModal
        open={otpOpen}
        email={email.trim()}
        onClose={() => setOtpOpen(false)}
        onVerified={({ otp, resetToken: verifiedResetToken }) => {
          setOtpOpen(false)
          setResetOpen(true)
          setResetOtp(otp)
          setResetToken(verifiedResetToken || '')
        }}
      />
    </div>
  )
}
