'use client'

import { useOnboardingProgress } from '@/components/supplier-onboard/useOnboardingProgress'
import { ActionNeededCallout } from './ActionNeededCallout'

/** Back office note on a form, shown until the supplier submits it again. */
export default function FormActionNeededNotice({ formId, message }: { formId: string; message: string }) {
  const { hydrated, submission } = useOnboardingProgress(formId)
  if (!hydrated || submission) return null
  return (
    <div className="mt-6">
      <ActionNeededCallout>{message}</ActionNeededCallout>
    </div>
  )
}
