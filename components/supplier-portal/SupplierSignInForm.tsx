'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ErrorSummary } from '@/components/eoi/journey/shared'
import type { FieldError } from '@/components/eoi/journey/EoiJourneyProvider'
import { Button } from '@/components/ui/Button'
import { FormField, TextInput } from '@/components/ui/FormField'
import { PORTAL_BASE_PATH, PORTAL_PATHS } from '@/lib/supplierPortal'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Supplier sign in. [Provenance: NHS]
 *
 * Prototype: any email address and password are accepted. Validation only
 * checks the fields are filled in (NHS error summary plus inline errors).
 */
export default function SupplierSignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { hydrated, signedIn, signIn } = useSupplierPortal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldError[]>([])

  const nextParam = params.get('next') ?? ''
  const next = nextParam.startsWith(PORTAL_BASE_PATH) && nextParam !== PORTAL_PATHS.signIn ? nextParam : PORTAL_PATHS.dashboard

  useEffect(() => {
    if (hydrated && signedIn) router.replace(next)
  }, [hydrated, signedIn, next, router])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found: FieldError[] = []
    if (!email.trim()) found.push({ field: 'email', message: 'Enter your email address' })
    if (!password) found.push({ field: 'password', message: 'Enter your password' })
    setErrors(found)
    if (found.length > 0) return
    signIn(email.trim())
  }

  const errorFor = (field: string) => errors.find((er) => er.field === field)?.message

  return (
    <div className="hs-page">
      <div className="max-w-2xl">
        <ErrorSummary errors={errors} />
        <h1 className="page-title-h1">Sign in to the Supplier portal</h1>
        <p className="nhsuk-body-m">
          Use the email address and password the NHS HealthStore team sent you. This prototype accepts any email address
          and password.
        </p>
        <form noValidate onSubmit={handleSubmit}>
          <FormField id="email" label="Email address" error={errorFor('email')}>
            {(field) => (
              <TextInput
                {...field}
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                className="nhsuk-input--width-20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </FormField>
          <FormField id="password" label="Password" error={errorFor('password')}>
            {(field) => (
              <TextInput
                {...field}
                name="password"
                type="password"
                autoComplete="current-password"
                className="nhsuk-input--width-20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </FormField>
          <Button type="submit">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
