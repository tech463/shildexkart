import { useEffect, useRef, useState } from 'react'
import { forgotPasswordAPI, verifyPasswordOtpAPI } from '../services/authService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const closePath = 'M6 18 18 6M6 6l12 12'

export default function ForgotOtpModal({ open, email, onClose, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(30)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const inputsRef = useRef([])

  useEffect(() => {
    if (!open) return undefined
    setDigits(['', '', '', '', '', ''])
    setError('')
    setSeconds(30)
    setVerifying(false)
    setResending(false)

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

    setVerifying(true)
    setError('')

    ;(async () => {
      try {
        const data = await verifyPasswordOtpAPI({ email, otp: otpValue })
        if (!data?.success) {
          setError(data?.message || 'OTP verification failed.')
          setVerifying(false)
          return
        }

        // Reset-password flow ke liye resetToken carry karenge
        onVerified?.({
          email,
          otp: otpValue,
          resetToken: data?.resetToken || data?.token,
        })
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'OTP verification failed.'
        setError(msg)
        setVerifying(false)
      }
    })()
  }

  const resendOtp = () => {
    if (seconds > 0 || resending) return
    setResending(true)
    setError('')

    ;(async () => {
      try {
        const data = await forgotPasswordAPI({ email })
        if (!data?.success) {
          setError(data?.message || 'Failed to resend OTP.')
          setResending(false)
          return
        }

        setSeconds(30)
        setDigits(['', '', '', '', '', ''])
        inputsRef.current[0]?.focus()
        setResending(false)
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to resend OTP.'
        setError(msg)
        setResending(false)
      }
    })()
  }

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal login-otp-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-otp-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="forgot-otp-modal-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">OTP </span>
            <span className="vendor-modal-title-accent">Verification</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={closePath} />
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
                  key={`forgot-otp-${index}`}
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
              <span className="text-slate-500">Check your email for OTP.</span>
              <button
                type="button"
                className={`login-resend-btn${seconds > 0 ? ' is-disabled' : ''}`}
                onClick={resendOtp}
                disabled={seconds > 0 || resending}
              >
                {seconds > 0 ? `Resend in ${seconds}s` : resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>
          </div>

          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-glass vendor-btn-submit login-submit-btn w-full !min-w-0"
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

