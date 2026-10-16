import OnboardingFormsTable from '@/components/supplier-portal/OnboardingFormsTable'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Product onboarding — ${PORTAL_SERVICE_NAME}` }

export default function ProductOnboardingPage() {
  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <PortalBreadcrumb items={[{ label: 'Product management', href: PORTAL_PATHS.products }, { label: 'Product onboarding' }]} />
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <div className="hs-section">
            <h1 className="nhsuk-heading-xl">Product onboarding</h1>
            <p className="nhsuk-body-l hs-measure">
              Each product below has its own onboarding form. Your answers are saved as a draft until you submit the form
              for review by the NHS HealthStore team.
            </p>
          </div>
          <OnboardingFormsTable />
        </div>
      </div>
    </div>
  )
}
