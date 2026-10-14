import { getWhereLiveSummary, type WhereLiveApp } from '@/lib/whereLiveSummary'

export type { WhereLiveApp }

/**
 * Fourth callout card in the commissioning snapshot grid — "Live NHSE sites".
 * Links to the NHS experience section when `href` is provided; otherwise renders
 * as a plain (non-link) card. Summary comes from the deployment register.
 */
export function PdpWhereLiveSegment({ app, href }: { app: WhereLiveApp; href?: string }) {
  const { sitesText, siteCount } = getWhereLiveSummary(app)

  if (siteCount == null && !sitesText) return null

  const inner = (
    <>
      <h2 className={`hs-snapshot-strip__heading${href ? ' hs-snapshot-strip__heading--linked' : ''}`}>
        Live NHSE sites
      </h2>
      <div className="hs-snapshot-strip__body">
        <span className="hs-text-card-title-sm hs-font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {siteCount ?? sitesText}
        </span>
      </div>
    </>
  )

  if (href) {
    return (
      <a href={href} className="hs-snapshot-strip__segment hs-snapshot-strip__segment--link">
        {inner}
      </a>
    )
  }

  return <article className="hs-snapshot-strip__segment">{inner}</article>
}
