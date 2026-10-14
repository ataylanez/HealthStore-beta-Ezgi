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
    <span className="hs-text-body hs-font-bold leading-snug md:hs-text-card-title-sm" style={{ ...fr, color: 'var(--text-primary)' }}>
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
          <p className="mt-2 mb-0 hs-text-label leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
        <h3 className="hs-text-lede hs-font-bold leading-snug md:hs-text-section-alt" style={{ ...fr, color: 'var(--text-primary)' }}>
          {study.title}
        </h3>
        {study.description ? (
          <p className="mt-2 mb-0 hs-text-label leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
        <h3 className="nhsuk-card__heading nhsuk-body-s nhsuk-u-font-weight-bold hs-card-chevron__heading">
          {study.title}
        </h3>
        <ChevronRightCircleCompact />
      </div>
    </div>
  )
}

/** Full-width "Case studies" band for the public home — featured app card plus smaller previews, links to /case-studies. */
export function HomeCaseStudiesBand({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const featured = caseStudies.find((c) => c.id === 'featured-app') ?? caseStudies[0]
  const others = caseStudies.filter((c) => c !== featured).slice(0, 3)
  return (
    <section
      className="relative overflow-x-clip py-12 md:py-16"
      style={{ background: 'var(--nhs-blue)' }}
      aria-labelledby="case-studies-heading"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="case-studies-heading" className="hs-text-section-alt hs-font-bold leading-tight text-white md:hs-text-section" style={fr}>
              Case studies
            </h2>
            <p className="mt-4 mb-0 hs-text-body leading-relaxed text-white/85">
              Real-world examples of how NHS systems are commissioning and scaling digital therapeutics.
            </p>
          </div>
          <Link
            href="/resources"
            className="inline-flex shrink-0 items-center gap-1 hs-text-label hs-font-bold text-white underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            See all case studies
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <div className="lg:col-span-2">
            <FeaturedCaseStudyCard study={featured} />
          </div>
          <div className="flex flex-col gap-4">
            {others.map((study) => (
              <CompactCaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
