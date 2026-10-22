'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { PROTOTYPE_OTP, useEoiJourney, useStepGuard, type FieldError } from '../EoiJourneyProvider'
import { BackLink, ErrorSummary, useStepHeadingFocus } from '../shared'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'

export default function VerifyStep() {
  const router = useRouter()
  const { data, update, nextHref, backHref } = useEoiJourney()
  const headingRef = useStepHeadingFocus()

  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<FieldError[]>([])

  /** Seconds until the prototype code can be resent; every (re)send starts a 30s cooldown. */
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendConfirmation, setResendConfirmation] = useState('')
  /** The imaginary code is first "sent" when the user lands on this step. */
  const codeSentRef = useRef(false)

  useStepGuard('verify')

  useEffect(() => {
    if (!codeSentRef.current) {
      codeSentRef.current = true
      setResendCooldown(30)
    }
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  function handleResendCode() {
    if (resendCooldown > 0) return
    setResendCooldown(30)
    setResendConfirmation(
      `We have sent a new code to ${data.email.trim() || 'your NHS work email address'}. In this prototype the code is still ${PROTOTYPE_OTP}.`,
    )
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault()
    if (otp.trim() !== PROTOTYPE_OTP) {
      setErrors([{ field: 'eoi-otp', message: 'Enter the correct one-time code' }])
      return
    }
    setErrors([])
    update({ verified: true })
    router.push(nextHref('verify'))
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={backHref('verify')} />
          <ErrorSummary errors={errors} />
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Verify your email
          </h1>
          <div className="nhsuk-inset-text">
            <span className="nhsuk-u-visually-hidden">Information: </span>
            <p>
              Prototype: enter code <strong>{PROTOTYPE_OTP}</strong>. In a live service we would
              email a one-time code to {data.email.trim() || 'your NHS work email address'}.
            </p>
          </div>
          <form noValidate onSubmit={handleVerify}>
            <FormField id="eoi-otp" label="One-time code" required error={errors[0]?.message}>
              {(field) => (
                <TextInput
                  {...field}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  className="nhsuk-input--width-5"
                />
              )}
            </FormField>
            <Button type="submit">Continue</Button>
          </form>
          <details className="nhsuk-details mt-6">
            <summary className="nhsuk-details__summary">
              <span className="nhsuk-details__summary-text">I did not receive an email</span>
            </summary>
            <div className="nhsuk-details__text">
              <p>
                It can take a few minutes for the email to arrive. You need to wait 30 seconds
                before a new code can be sent.
              </p>
              <p>
                Check your junk or spam folder — emails from the NHS HealthStore can sometimes end
                up there.
              </p>
              <Button variant="secondary" onClick={handleResendCode} disabled={resendCooldown > 0}>
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
              </Button>
              {resendConfirmation ? (
                <p role="status" style={{ marginTop: 8 }}>
                  {resendConfirmation}
                </p>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
