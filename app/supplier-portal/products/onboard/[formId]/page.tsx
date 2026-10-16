import { notFound } from 'next/navigation'
import SupplierOnboardingTaskList from '@/components/supplier-onboard/SupplierOnboardingTaskList'
import FormActionNeededNotice from '@/components/supplier-portal/FormActionNeededNotice'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { ONBOARDING_NOTICE, SERVICE_NAME } from '@/lib/supplierOnboarding'
import { ONBOARDING_FORMS, PORTAL_PATHS, findOnboardingForm } from '@/lib/supplierPortal'

type Params = Promise<{ formId: string }>

export function generateStaticParams() {
  return ONBOARDING_FORMS.map((f) => ({ formId: f.id }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const form = findOnboardingForm((await params).formId)
  return { title: `${form ? `${form.productName} — ` : ''}${SERVICE_NAME} — NHS HealthStore` }
}

/**
 * Product onboarding form — task list page for one product.
 * NHS "Complete multiple tasks" pattern:
 * https://service-manual.nhs.uk/design-system/patterns/complete-multiple-tasks
 */
export default async function SupplierOnboardFormPage({ params }: { params: Params }) {
  const form = findOnboardingForm((await params).formId)
  if (!form) notFound()

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb
        items={[
          { label: 'Product management', href: PORTAL_PATHS.products },
          { label: 'Product onboarding', href: PORTAL_PATHS.onboard },
          { label: form.productName },
        ]}
      />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <span className="nhsuk-caption-l">{form.productName}</span>
            <h1 className="nhsuk-heading-xl">{SERVICE_NAME}</h1>
            <p className="nhsuk-body-l">
              Complete each task below to onboard your product to the NHS HealthStore. You can
              complete the tasks in any order and return to this page at any time.
            </p>
            {/* NHS inset text for the onboarding notice. */}
            <div className="nhsuk-inset-text">
              <span className="nhsuk-u-visually-hidden">Information: </span>
              <p className="nhsuk-u-margin-bottom-0">
                {ONBOARDING_NOTICE}
              </p>
            </div>
            {form.actionNeeded && <FormActionNeededNotice formId={form.id} message={form.actionNeeded} />}
          </div>
          <SupplierOnboardingTaskList formId={form.id} />
        </div>
      </div>
    </div>
  )
}
