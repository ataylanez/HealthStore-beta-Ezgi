import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { ClickableChevronCard } from '@/components/ui/ClickableChevronCard'

export const metadata = { title: 'Resource library — NHS HealthStore' }

const RESOURCES = [
  {
    href: '/resources/guidance',
    title: 'Training and guidance',
    description: 'Core training materials and guidance for recommending and deploying digital therapeutics.',
  },
  {
    href: '/resources/preparing-to-recommend',
    title: 'Preparing to recommend a DTx',
    description: 'What to check before recommending a digital therapeutic — suitability, pathway fit and local readiness.',
  },
  {
    href: '/resources/prior-to-appointment',
    title: 'Prior to patient appointment',
    description: 'Preparation steps before the consultation, including patient information and enrolment readiness.',
  },
  {
    href: '/resources/during-appointment',
    title: 'During patient appointment',
    description: 'How to introduce, explain and enrol a patient onto a digital therapeutic in clinic.',
  },
  {
    href: '/resources/after-appointment',
    title: 'After a patient appointment',
    description: 'Follow-up actions after enrolment — documentation, support contacts and early engagement checks.',
  },
  {
    href: '#',
    title: 'Long-term management of a DTx',
    description: 'Ongoing monitoring, review and pathway management once a digital therapeutic is in use.',
  },
] as const

export default function ResourcesPage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb items={[{ label: 'Resource library' }]} />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h1 className="nhsuk-heading-xl">Resource library</h1>
            <p className="nhsuk-lede-text">
              Training and practical guidance for recommending, enrolling and managing digital therapeutics with patients.
            </p>
          </div>
        </div>

        {/* [Provenance: NHS] Secondary cards in a card group — same pattern as nhs.uk/nhs-services */}
        <ul className="nhsuk-grid-row nhsuk-card-group">
          {RESOURCES.map(item => (
            <li key={item.title} className="nhsuk-grid-column-one-third nhsuk-card-group__item">
              <ClickableChevronCard
                variant="secondary"
                href={item.href}
                title={item.title}
                description={item.description}
                headingLevel={2}
                className="flex h-full w-full flex-col"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
