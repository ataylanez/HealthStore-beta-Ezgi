import Link from 'next/link'
import Image from 'next/image'
import {
  getDashboardContent,
  getHomeNews,
  getHomeCampaigns,
  getHomeCaseStudies,
} from '@/lib/data'
import HomePublicContent from '@/components/home/HomePublicContent'

export default async function HomePage() {
  const dash = getDashboardContent()
  const news = getHomeNews()
  const campaigns = getHomeCampaigns()
  const caseStudies = getHomeCaseStudies()

  return (
    <div>
      {/* [Provenance: NHS] Hero — service-manual.nhs.uk/design-system/components/hero.
          Copy in a two-thirds column, illustration in the remaining third. */}
      <section className="nhsuk-hero hs-home-hero">
        <div className="nhsuk-width-container nhsuk-hero--border">
          <div className="nhsuk-grid-row">
            <div className="nhsuk-grid-column-two-thirds">
              <div className="nhsuk-hero__wrapper">
                <h1 className="nhsuk-heading-xl nhsuk-u-margin-bottom-3">{dash.hero.headline}</h1>
                <p className="nhsuk-body-l">{dash.hero.subheadline}</p>
                <Link href="/about" className="nhsuk-button nhsuk-button--reverse nhsuk-u-margin-bottom-0 max-sm:w-full">
                  About the NHS HealthStore
                </Link>
              </div>
            </div>
            <div className="nhsuk-grid-column-one-third hs-home-hero__media">
              <Image
                src="/images/home-hero-illustration-v4.png"
                alt="Person using a health app at home with their dog"
                width={1024}
                height={721}
                sizes="(max-width: 768px) 100vw, 20rem"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <HomePublicContent
        dash={dash}
        news={news}
        campaigns={campaigns}
        caseStudies={caseStudies}
      />
    </div>
  )
}
