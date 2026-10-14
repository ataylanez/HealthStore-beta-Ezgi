import DashboardAttentionList from '@/components/supplier-portal/DashboardAttentionList'
import { PortalCardGrid } from '@/components/supplier-portal/PortalCardGrid'
import { PORTAL_PATHS, PORTAL_SERVICE_NAME, SAMPLE_SUPPLIER } from '@/lib/supplierPortal'

export const metadata = { title: `Dashboard — ${PORTAL_SERVICE_NAME}` }

/** Supplier portal dashboard — landing page after sign-in and entry point to every section. */
export default function SupplierPortalDashboardPage() {
  return (
    <div className="hs-page">
      <div className="hs-section">
        <span className="nhsuk-caption-l">{SAMPLE_SUPPLIER.name}</span>
        <h1 className="page-title-h1">Dashboard</h1>
        <p className="m-0 hs-measure leading-relaxed" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
          Keep your product information and documents up to date, and manage the pages buyers see on the NHS
          Commissioning Store.
        </p>
      </div>

      <div className="max-w-3xl">
        <DashboardAttentionList />
      </div>

      <section aria-labelledby="sections-heading" className="hs-section">
        <h2 id="sections-heading" className="nhsuk-u-visually-hidden">
          Portal sections
        </h2>
        <PortalCardGrid
          cards={[
            {
              href: PORTAL_PATHS.company,
              title: 'Company information',
              description: 'Manage company information and documents.',
            },
            {
              href: PORTAL_PATHS.products,
              title: 'Product management',
              description: 'Onboard and manage product assurance information and documents.',
            },
            {
              href: PORTAL_PATHS.published,
              title: 'Published pages',
              description: 'Publish and manage pages visible on the Commissioning Store.',
            },
            {
              href: PORTAL_PATHS.contact,
              title: 'Contact',
              description: 'Contact the HealthStore Team.',
            },
            {
              href: PORTAL_PATHS.account,
              title: 'Account management',
              description: 'Manage access and your password.',
            },
          ]}
        />
      </section>
    </div>
  )
}
