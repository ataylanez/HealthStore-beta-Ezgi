import OnboardingFormsTable from '@/components/supplier-portal/OnboardingFormsTable'
import { PortalBreadcrumb } from '@/components/supplier-portal/PortalBreadcrumb'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME } from '@/lib/supplierPortal'

export const metadata = { title: `Product onboarding — ${PORTAL_SERVICE_NAME}` }

export default function ProductOnboardingPage() {
  return (
    <div className="hs-page">
      <PortalBreadcrumb items={[{ label: 'Product management', href: PORTAL_PATHS.products }, { label: 'Product onboarding' }]} />
      <div className="max-w-3xl">
        <div className="hs-section">
          <h1 className="page-title-h1">Product onboarding</h1>
          <p className="m-0 hs-measure leading-relaxed" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            Each product below has its own onboarding form. Your answers are saved as a draft until you submit the form
            for review by the NHS HealthStore team.
          </p>
        </div>
        <OnboardingFormsTable />
      </div>
    </div>
  )
}
