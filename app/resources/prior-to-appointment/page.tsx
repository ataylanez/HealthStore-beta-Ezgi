import Link from 'next/link'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'

export const metadata = { title: 'Prior to patient appointment — NHS HealthStore' }

const PRIOR_LINKS = [
  {
    href: '/resources/prior-to-appointment/ardens-templates',
    title: 'Ensuring Ardens templates are updated to include digital therapeutics',
  },
  {
    href: '/resources/prior-to-appointment/self-management-and-remote-care',
    title: 'What we mean by Self-management, Remote Management and Remote Monitoring',
  },
  {
    href: '/resources/prior-to-appointment/patient-challenges',
    title: 'Recognition of the challenges that patients might have',
  },
] as const

export default function PriorToAppointmentPage() {
  return (
    <div className="nhsuk-width-container">
      <PageBreadcrumb
        items={[
          { label: 'Resource library', href: '/resources' },
          { label: 'Prior to patient appointment' },
        ]}
      />
      <div className="nhsuk-main-wrapper nhsuk-main-wrapper--s">
      <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">
      <h1 className="nhsuk-heading-xl">Prior to patient appointment</h1>
      <p className="nhsuk-lede-text">
        Preparation before the consultation — making sure your templates capture digital therapeutics, understanding
        the different models of remote care, and recognising the barriers some patients face.
      </p>

      <ul className="nhsuk-list nhsuk-list--bullet">
        {PRIOR_LINKS.map(item => (
          <li key={item.title}>
            <Link href={item.href}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      </div>
      </div>
      </div>
    </div>
  )
}
