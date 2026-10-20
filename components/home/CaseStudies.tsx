import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { CaseStudy } from '@/lib/conceptHomeTypes'
import { ChevronRightCircleCompact } from '@/components/ui/ClickableChevronCard'

const fr: CSSProperties = { fontFamily: 'Frutiger, Arial, sans-serif' }

function ExternalOrInternalLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const external = /^https?:\/\//.test(href)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/**
 * Reusable case study tile: photo + white title band.
 * Border uses NHS primary clickable card (`.app-card`).
 * When `href` is omitted the card renders static (used for non-interactive home previews).
 */
export function CaseStudyCard({ study, href }: { study: CaseStudy; href?: string }) {
  const Title = (
    <span className="nhsuk-heading-s nhsuk-u-margin-bottom-0" style={{ ...fr, color: 'var(--text-primary)' }}>
      {study.title}
    </span>
  )

  const body = (
    <>
      <div className="relative min-h-[10rem] flex-1 overflow-hidden">
        <Image
          src={study.image}
          alt={study.image_alt ?? ''}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 30vw"
        />
      </div>
      <div className="shrink-0 bg-white px-6 py-4">
        {href ? (
          <span className="flex items-end justify-between gap-4 text-left">
            {Title}
            <ChevronRight className="h-5 w-5 shrink-0" style={{ color: 'var(--nhs-blue)' }} aria-hidden />
          </span>
        ) : (
          <div className="flex items-end justify-between gap-4">{Title}</div>
        )}
        {study.description ? (
          <p className="nhsuk-body-m nhsuk-u-margin-top-2 nhsuk-u-margin-bottom-0">
            {study.description}
          </p>
        ) : null}
      </div>
    </>
  )

  if (href) {
    return (
      <ExternalOrInternalLink
        href={href}
        className="app-card group flex h-full min-h-[15rem] w-full min-w-0 flex-col overflow-hidden no-underline"
      >
        {body}
      </ExternalOrInternalLink>
    )
  }

  return (
    <div className="app-card group flex h-full min-h-[15rem] w-full min-w-0 flex-col overflow-hidden">
      {body}
    </div>
  )
}

/**
 * Large, prominent case study card used for the featured app on the home band.
 * Static (no link) — home case studies are non-interactive in the prototype.
 */
function FeaturedCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className="app-card flex h-full min-h-[22rem] w-full min-w-0 flex-col overflow-hidden">
      <div className="relative min-h-[14rem] flex-1 overflow-hidden">
        <Image
          src={study.image}
          alt={study.image_alt ?? ''}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />
      </div>
      <div className="shrink-0 bg-white px-6 py-6">
        <span className="badge badge-blue mb-2 inline-block">Featured</span>
        <h3 className="nhsuk-heading-m nhsuk-u-margin-bottom-2" style={{ ...fr, color: 'var(--text-primary)' }}>
          {study.title}
        </h3>
        {study.description ? (
          <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">
            {study.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Compact case study card — same look as the NHS chevron card but static
 * (no link, no clickable affordance). Home case studies are non-interactive.
 */
function CompactCaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <div className="nhsuk-card app-card hs-card-chevron">
      <div className="nhsuk-card__content hs-card-chevron__content">
        <h3 className="nhsuk-card__heading nhsuk-heading-s nhsuk-u-margin-bottom-0 hs-card-chevron__heading">
          {study.title}
        </h3>
        <ChevronRightCircleCompact />
      </div>
    </div>
  )
}

/**
 * "Case studies" section for the public home — featured card in a two-thirds
 * column, compact previews in the one-third column. Sits inside the page's NHS
 * width container (no full-bleed band), with a heading-l title and a lede.
 */
export function HomeCaseStudiesBand({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const featured = caseStudies.find((c) => c.id === 'featured-app') ?? caseStudies[0]
  const others = caseStudies.filter((c) => c !== featured).slice(0, 3)
  return (
    <section aria-labelledby="case-studies-heading">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <h2 id="case-studies-heading" className="nhsuk-heading-l">
            Case studies
          </h2>
          <p className="nhsuk-body-m">
            Real-world examples of how NHS systems are commissioning and scaling digital therapeutics.
          </p>
          <p className="nhsuk-body-m">
            <Link href="/resources">See all case studies</Link>
          </p>
        </div>
      </div>
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds nhsuk-u-margin-bottom-4">
          <FeaturedCaseStudyCard study={featured} />
        </div>
        <div className="nhsuk-grid-column-one-third">
          {others.map((study) => (
            <CompactCaseStudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>
    </section>
  )
}
