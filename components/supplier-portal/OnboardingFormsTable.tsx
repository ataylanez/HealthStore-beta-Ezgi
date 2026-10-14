'use client'

import { formBasePath } from '@/lib/supplierOnboarding'
import { useOnboardingFormSummaries } from './portalStatus'
import { StatusTable } from './StatusTable'

/** Products awaiting onboarding and the status of each one's form. */
export default function OnboardingFormsTable() {
  const { hydrated, summaries } = useOnboardingFormSummaries()
  if (!hydrated) return null
  if (summaries.length === 0) {
    return <p className="nhsuk-body-m">There are no products awaiting onboarding.</p>
  }
  return (
    <StatusTable
      caption="Products awaiting onboarding and the status of each onboarding form"
      nameHeading="Product"
      dateHeading="Last saved"
      rows={summaries.map((s) => ({
        id: s.form.id,
        name: s.form.productName,
        href: formBasePath(s.form.id),
        status: s.status,
        date: s.lastSaved,
      }))}
    />
  )
}
