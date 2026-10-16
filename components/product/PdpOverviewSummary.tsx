import type { ReactNode } from 'react'
import type { App } from '@/lib/data'
import type { ProductNarrative } from '@/lib/content/productModel'
import { getDeploymentRegister, summarizeDeployments } from '@/lib/deploymentRegister'
import { pdpSectionPath } from '@/lib/pdpPageModel'
import type { PdpSectionLink } from '@/lib/pdpOnThisPage'
import { pdpSectionTitle, type PdpSectionId } from '@/lib/pdpSections'
import { PdpShareRegion } from '@/components/PdpSharePrintContext'
import ActionLink from '@/components/ActionLink'
import PdpRegulatoryPosition from '@/components/product/PdpRegulatoryPosition'
import { computeIllustrativeWorth, formatGbp } from '@/lib/pdpWorth'

/**
 * Summary-style product overview: one short block per section page, each
 * ending in an NHS action link to the full section. Used in place of the
 * commissioning snapshot for products flagged in lib/pdpSummary.ts.
 *
 * Server component — no client boundary.
 */

/* Body copy inherits the NHS body-m size/leading from <body>; only the colour is set. */
const bodyStyle = { color: 'var(--text-secondary)' } as const

function Block({
  slug,
  sectionId,
  sectionLabel,
  title,
  children,
}: {
  slug: string
  sectionId: PdpSectionId
  /** Side-nav label of the section page the action link points at. */
  sectionLabel: string
  title: string
  children: ReactNode
}) {
  const headingId = `pdp-summary-${sectionId}`
  return (
    <section aria-labelledby={headingId} className="hs-pdp-summary-block">
      <h2 id={headingId} className="nhsuk-heading-l hs-pdp-heading">
        {title}
      </h2>
      <div className="nhsuk-u-margin-bottom-4">{children}</div>
      {/* Bottom margin lives on the action link; the last block's link has none (see globals.css). */}
      <ActionLink href={pdpSectionPath(slug, sectionId)} className="hs-pdp-summary-block__link">
        {`Learn more about ${sectionLabel}`}
      </ActionLink>
    </section>
  )
}

/** Join a list in plain English: "a, b and c". */
function listInEnglish(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** Distinct care settings, lower-cased, with parenthetical qualifiers removed. */
function careSettings(app: App): string[] {
  const seen = new Set<string>()
  for (const row of getDeploymentRegister(app)) {
    const raw = row.care_setting?.replace(/\s*\(.*?\)\s*/g, '').trim()
    if (!raw) continue
    for (const part of raw.split(/\s*(?:&|and)\s*/i)) {
      const setting = part.trim().toLowerCase().replace(/\s+care$/, '')
      if (setting) seen.add(setting)
    }
  }
  return [...seen].map((s) => `${s} care`)
}

export default function PdpOverviewSummary({
  app,
  narrative,
  sections,
}: {
  app: App
  narrative: ProductNarrative
  /** Section pages that exist for this product; blocks are only shown for these. */
  sections: PdpSectionLink[]
}) {
  const name: string = app.app_name
  const labels = new Map(sections.map((s) => [s.id, s.label]))
  const block = (sectionId: PdpSectionId, title: string, children: ReactNode) => {
    const sectionLabel = labels.get(sectionId)
    if (!sectionLabel) return null
    return (
      <Block slug={app.slug} sectionId={sectionId} sectionLabel={sectionLabel} title={title}>
        {children}
      </Block>
    )
  }
  const bullets = narrative.what_it_does_bullets ?? []
  const tariffNote = narrative.commissioner_economics?.tariff_note
  const impl = narrative.implementation
  const commercial = narrative.commercial_readiness
  const deployments = getDeploymentRegister(app)
  const deploymentSummary = summarizeDeployments(deployments)
  const settings = careSettings(app)
  const hasRegulatory = !!narrative.regulatory_position
  const worth = computeIllustrativeWorth()

  return (
    <PdpShareRegion
      shareKey="overview"
      label={`Overview of ${name}`}
      description="Short summary of each section with links to the detail."
    >
      {bullets.length > 0 &&
        block(
          'how-it-helps',
          `How ${name} can change a treatment pathway`,
          <ul className="nhsuk-list nhsuk-list--bullet" style={{ ...bodyStyle, margin: 0 }}>
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>,
        )}

      {block(
        'local-impact',
        `${name}'s local impact`,
        <>
          <div className="nhsuk-inset-text" style={{ marginTop: 0, marginBottom: 24 }}>
            <span className="nhsuk-u-visually-hidden">Information: </span>
            <p style={{ margin: 0 }}>
              Illustrative economics for a 500-patient cohort. Cash and capacity are reported separately.
            </p>
          </div>
          <ul className="nhsuk-list nhsuk-list--bullet" style={{ ...bodyStyle, margin: 0 }}>
            <li>
              <strong>{formatGbp(worth.capacity)}</strong> capacity released per year — freed acute beds and clinician time
            </li>
            <li>
              <strong>{formatGbp(worth.cash)}</strong> cash-releasing per year — about 40% of capacity converted to elective
            </li>
            <li>
              <strong>
                {formatGbp(worth.netLow)} to {formatGbp(worth.netHigh)}
              </strong>{' '}
              net position per year, across the indicative price band
            </li>
          </ul>
        </>,
      )}

      {tariffNote &&
        block(
          'funding-levers',
          'Funding levers and tariffs',
          <p className="nhsuk-body-m" style={{ ...bodyStyle, margin: 0 }}>
            {fundingTeaser(tariffNote)}
          </p>,
        )}

      {hasRegulatory &&
        block('assurance', pdpSectionTitle('assurance'), <PdpRegulatoryPosition narrative={narrative} heading={null} />)}

      {impl?.workforce &&
        block(
          'implementation',
          pdpSectionTitle('implementation'),
          <p className="nhsuk-body-m" style={{ ...bodyStyle, margin: 0 }}>
            {impl.workforce}
          </p>,
        )}

      {deployments.length > 0 &&
        block(
          'nhs-experience',
          pdpSectionTitle('nhs-experience'),
          <p className="nhsuk-body-m" style={{ ...bodyStyle, margin: 0 }}>
            {name} has {deploymentSummary.total} recorded NHS deployment{deploymentSummary.total === 1 ? '' : 's'}
            {deploymentSummary.liveCount > 0 ? ` (${deploymentSummary.liveCount} live` : ''}
            {deploymentSummary.liveCount > 0 && deploymentSummary.pilotCount > 0
              ? `, ${deploymentSummary.pilotCount} pilot`
              : ''}
            {deploymentSummary.liveCount > 0 ? ')' : ''}
            {settings.length > 0 ? `, across ${listInEnglish(settings)}.` : '.'}
          </p>,
        )}

      {commercial &&
        block(
          'how-to-buy',
          pdpSectionTitle('how-to-buy', { appName: name }),
          <ul className="nhsuk-list nhsuk-list--bullet" style={{ ...bodyStyle, margin: 0 }}>
            {[
              { label: 'Recommended route', value: commercial.route_status },
              { label: 'Buyer pack', value: commercial.buyer_pack_status },
            ]
              .filter((f) => !!f.value)
              .map((f) => (
                <li key={f.label}>
                  <strong>{f.label}:</strong> {f.value}
                </li>
              ))}
          </ul>,
        )}
    </PdpShareRegion>
  )
}

/**
 * The overview quotes only the incentive part of the tariff note (QOF, BPT,
 * virtual ward tariff) — the emergency-tariff caveat stays on the section page.
 */
function fundingTeaser(tariffNote: string): string {
  const idx = tariffNote.indexOf('QOF indicator')
  return idx >= 0 ? tariffNote.slice(idx).trim() : tariffNote
}
