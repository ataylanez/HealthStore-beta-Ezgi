import { notFound } from 'next/navigation'
import CheckAnswersPage from '@/components/supplier-onboard/CheckAnswersPage'
import { SERVICE_NAME } from '@/lib/supplierOnboarding'
import { ONBOARDING_FORMS, findOnboardingForm } from '@/lib/supplierPortal'

type Params = Promise<{ formId: string }>

export const metadata = { title: `Check your answers — ${SERVICE_NAME}` }

export function generateStaticParams() {
  return ONBOARDING_FORMS.map((f) => ({ formId: f.id }))
}

/** Static segment: takes precedence over the .../[formId]/[task] route. */
export default async function SupplierOnboardCheckAnswersPage({ params }: { params: Params }) {
  const { formId } = await params
  if (!findOnboardingForm(formId)) notFound()
  return <CheckAnswersPage formId={formId} />
}
