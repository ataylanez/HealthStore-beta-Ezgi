import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ConceptFeaturedContent, ConceptGridContent } from '@/lib/conceptHomeTypes'
import type { App } from '@/lib/data'
import type { HomeCampaignItem, HomeNewsItem } from '@/lib/homeContentTypes'
import { EditorialPillRow } from '@/components/Badges'
import { EditorialImage } from '../EditorialImage'
import { formatHomeDate } from '../formatDate'
import type { HomeFragmentsProps } from '../HomeFragments'

const fr: CSSProperties = { fontFamily: 'Frutiger, Arial, sans-serif' }

/** Dashboard variant props — the live home/dashboard concept surfaces share this shape. */
export type HomeLayoutV4Props = HomeFragmentsProps & {
  conceptGrid: ConceptGridContent
  conceptFeatured: ConceptFeaturedContent
  featuredApp: App | undefined
}

function ExternalConceptLink({
  href,
  className,
  style,
  children,
}: {
  href: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const external = /^https?:\/\//.test(href)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  )
}

export function NewsListConcept({
  news,
  title = 'Latest news',
  hrefless = false,
  seeAllHref,
}: {
  news: HomeNewsItem[]
  title?: string
  hrefless?: boolean
  seeAllHref?: string
}) {
  return (
    <div className="hs-surface-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="hs-text-card-title-sm hs-font-bold" style={{ ...fr, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="shrink-0 hs-text-label hs-font-bold text-[var(--nhs-blue)] underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: 'var(--nhs-blue)' }}
          >
            See all news →
          </Link>
        )}
      </div>
      <ul className="m-0 list-none p-0">
        {news.map((item) => (
          <li key={item.id} className="border-t border-[var(--border)] pt-6 first:border-t-0 first:pt-0">
            <EditorialPillRow topics={item.topic_tags} conditions={item.condition_tags} />
            <time className="mt-1 block hs-text-caption" style={{ color: 'var(--text-muted)' }} dateTime={item.date}>
              {formatHomeDate(item.date)}
            </time>
            {hrefless ? (
              <span className="mt-1 block hs-font-bold text-[var(--text-primary)]">{item.title}</span>
            ) : (
              <ExternalConceptLink href={item.href} className="mt-1 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: 'var(--nhs-blue)' }}>
                <span className="hs-font-bold text-[var(--text-primary)] hover:text-[var(--nhs-blue)]">{item.title}</span>
              </ExternalConceptLink>
            )}
            <p className="mt-1 mb-0 hs-text-label leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {item.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CampaignsColumnConcept({
  campaigns,
  hrefless = false,
  seeAllHref,
}: {
  campaigns: HomeCampaignItem[]
  hrefless?: boolean
  seeAllHref?: string
}) {
  const featured = campaigns.find((c) => c.featured) ?? campaigns[0]
  const rest = campaigns.filter((c) => c !== featured)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 md:px-1">
        <h3 className="hs-text-card-title-sm hs-font-bold" style={{ ...fr, color: 'var(--text-primary)' }}>
          Campaigns and initiatives
        </h3>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="shrink-0 hs-text-label hs-font-bold text-[var(--nhs-blue)] underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: 'var(--nhs-blue)' }}
          >
            See all campaigns →
          </Link>
        )}
      </div>
      {featured && (
        <div className="overflow-hidden rounded-xl bg-[#003087]">
          <div className="relative aspect-[2/1] w-full min-h-[120px] max-h-[180px] overflow-hidden sm:aspect-[21/8]">
            <EditorialImage
              itemId={featured.id}
              imageKey={featured.image_key}
              alt=""
              className="object-cover object-[82%_center] sm:object-[80%_center]"
              priority
            />
          </div>
          <div className="px-6 py-4">
            <span className="mb-2 inline-block rounded bg-white/15 px-2 py-1 hs-text-caption hs-font-bold text-white">Featured</span>
            {hrefless ? (
              <span className="block hs-font-bold text-white" style={fr}>
                {featured.title}
              </span>
            ) : (
              <ExternalConceptLink href={featured.href} className="flex items-start justify-between gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <span className="hs-font-bold text-white" style={fr}>
                  {featured.title}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-white" aria-hidden />
              </ExternalConceptLink>
            )}
            <p className="mt-2 mb-0 hs-text-label text-white/80">{featured.summary}</p>
          </div>
        </div>
      )}
      <ul className="m-0 list-none space-y-4 p-0">
        {rest.map((item) => (
          <li key={item.id} className="hs-surface-card-sm p-4">
            <EditorialPillRow topics={item.topic_tags} conditions={item.condition_tags} className="mb-1" />
            {hrefless ? (
              <span className="block hs-font-bold text-[var(--text-primary)]">{item.title}</span>
            ) : (
              <ExternalConceptLink href={item.href} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: 'var(--nhs-blue)' }}>
                <span className="hs-font-bold text-[var(--text-primary)] hover:text-[var(--nhs-blue)]">{item.title}</span>
              </ExternalConceptLink>
            )}
            <p className="mt-1 mb-0 hs-text-label" style={{ color: 'var(--text-secondary)' }}>
              {item.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
