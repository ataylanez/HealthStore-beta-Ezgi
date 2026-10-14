import { notFound } from 'next/navigation'
import OnboardingConfirmationPage from '@/components/supplier-onboard/OnboardingConfirmationPage'
import { SERVICE_NAME } from '@/lib/supplierOnboarding'
import { ONBOARDING_FORMS, findOnboardingForm } from '@/lib/supplierPortal'

type Params = Promise<{ formId: string }>

export const metadata = { title: `Onboarding form submitted — ${SERVICE_NAME}` }

export function generateStaticParams() {
  return ONBOARDING_FORMS.map((f) => ({ formId: f.id }))
}

/** Static segment: takes precedence over the .../[formId]/[task] route. */
export default async function SupplierOnboardConfirmationPage({ params }: { params: Params }) {
  const { formId } = await params
  if (!findOnboardingForm(formId)) notFound()
  return <OnboardingConfirmationPage formId={formId} />
}
