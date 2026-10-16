import { getAllFunding } from '@/lib/data'
import { FundingDirectoryCard } from '@/components/FundingDirectoryCard'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

export const metadata = { title: 'Funding index — NHS HealthStore' }

export default function FundingPage() {
  const funding = getAllFunding()

  // Live (open) and Future (upcoming/periodic) share one unheaded list; closed stays under its own heading.
  const active = funding.filter(
    f => f.status === 'open' || f.status === 'upcoming' || f.status === 'periodic',
  )
  const closed = funding.filter(f => f.status === 'closed' || f.status === 'closed_confirm')

  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb items={[{ label: 'Funding index' }]} />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h1 className="nhsuk-heading-xl">Funding index</h1>
            <p className="nhsuk-lede-text">
              This Funding Index provides information on funding opportunities and integration support for NHS commissioners purchasing digital therapeutics (DTx). We encourage commissioners to confirm the availability of funding opportunities before submitting a business case applying for funding.
            </p>

            {active.length > 0 && (
              <section className="nhsuk-u-margin-bottom-7" aria-label="Funding opportunities">
                {active.map(f => (
                  <FundingDirectoryCard key={f.id} f={f} />
                ))}
              </section>
            )}

            {closed.length > 0 && (
              <section aria-labelledby="funding-section-closed">
                <h2 id="funding-section-closed" className="nhsuk-heading-m">
                  Closed (confirm current status)
                  <span className="badge nhsuk-u-margin-left-2" style={{ background: '#7A480022', color: '#7A4800', verticalAlign: 'middle' }}>
                    {closed.length}
                  </span>
                </h2>
                {closed.map(f => (
                  <FundingDirectoryCard key={f.id} f={f} />
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
