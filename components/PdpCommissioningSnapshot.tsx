import type { ReactNode } from 'react'
import type {
  CommissioningSnapshotCard,
  FundingSnapshotCard,
  InteropSnapshotItem,
  RegulationSnapshotPill,
} from '@/lib/commissioningSnapshot'
import { PdpWhereLiveSegment } from '@/components/PdpWhereLive'
import type { WhereLiveApp } from '@/lib/whereLiveSummary'

const INTEGRATION_READY_KEYS = ['fhir', 'emis'] as const

function interopItemsInOrder(items: InteropSnapshotItem[], keys: readonly string[]): InteropSnapshotItem[] {
  return keys.flatMap(k => {
    const item = items.find(i => i.key === k)
    return item && item.integrated === true ? [item] : []
  })
}

function SnapshotText({ children }: { children: ReactNode }) {
  return (
    <span className="nhsuk-body-s nhsuk-u-secondary-text-color">{children}</span>
  )
}

function SnapshotTextList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <p className="nhsuk-body-s nhsuk-u-margin-bottom-0" style={{ color: 'var(--text-secondary)' }}>
      {items.join(' · ')}
    </p>
  )
}

/**
 * Snapshot tile. When `href` is set the whole card is the link (no nested
 * heading link) so it matches NHS clickable-card behaviour.
 * Set `linkHeading` false to keep the title in primary (black) text — e.g. Platform,
 * where the blue affordance is a body line like "Demo available".
 */
function SegmentShell({
  label,
  href,
  linkHeading = true,
  footer,
  children,
}: {
  label: string
  href?: string
  linkHeading?: boolean
  footer?: ReactNode
  children: ReactNode
}) {
  const headingLinked = Boolean(href) && linkHeading
  const inner = (
    <>
      <h2 className={`hs-snapshot-strip__heading${headingLinked ? ' hs-snapshot-strip__heading--linked' : ''}`}>
        {label}
      </h2>
      <div className="hs-snapshot-strip__body">{children}</div>
      {footer ? <div className="hs-snapshot-strip__footer">{footer}</div> : null}
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

function GovernanceSegment({
  label,
  href,
  pills,
}: {
  label: string
  href: string
  pills: RegulationSnapshotPill[]
}) {
  return (
    <SegmentShell label={label} href={href}>
      <ul className="m-0 flex list-none flex-wrap gap-x-2 gap-y-1 p-0">
        {pills.map((p, i) => (
          <li key={p.label} className="inline">
            {i > 0 ? (
              <span className="hs-text-label" style={{ color: 'var(--text-muted)' }} aria-hidden>
                {' · '}
              </span>
            ) : null}
            <SnapshotText>{p.label}</SnapshotText>
          </li>
        ))}
      </ul>
    </SegmentShell>
  )
}

function CostSegment({
  card,
}: {
  card: Extract<CommissioningSnapshotCard, { kind: 'cost' }>
}) {
  if (card.modelPills.length === 0) return null

  return (
    <SegmentShell label={card.label} href={card.href}>
      <div>
        <SnapshotTextList items={card.modelPills} />
        {card.indicativeNote ? (
          <p className="nhsuk-body-s nhsuk-u-secondary-text-color nhsuk-u-margin-top-1 nhsuk-u-margin-bottom-0">
            {card.indicativeNote}
          </p>
        ) : null}
      </div>
      {card.subline ? (
        <p className="nhsuk-body-m nhsuk-u-margin-top-2 nhsuk-u-margin-bottom-0">
          {card.subline}
        </p>
      ) : null}
    </SegmentShell>
  )
}

function FundingFullWidthSegment({ card }: { card: FundingSnapshotCard }) {
  const href = card.opportunitiesLink?.href
  const inner = (
    <div className="hs-snapshot-strip__row hs-snapshot-strip__row--funding">
      <h2 className="sr-only">{card.label}</h2>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <SnapshotTextList items={card.pills} />
      </div>
      {card.opportunitiesLink ? (
        <span
          className="shrink-0 whitespace-nowrap hs-text-label hs-font-normal underline-offset-2"
          style={{ color: 'var(--nhs-blue)' }}
        >
          {card.opportunitiesLink.label}
        </span>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <a href={href} className="hs-snapshot-strip__segment hs-snapshot-strip__segment--row hs-snapshot-strip__segment--link">
        {inner}
      </a>
    )
  }

  return (
    <article className="hs-snapshot-strip__segment hs-snapshot-strip__segment--row">
      {inner}
    </article>
  )
}

function PlatformSegment({
  card,
}: {
  card: Extract<CommissioningSnapshotCard, { kind: 'platform' }>
}) {
  return (
    <SegmentShell label={card.label} href={card.demoLink?.href} linkHeading={false}>
      <p className="nhsuk-body-s nhsuk-u-margin-bottom-0">
        {card.values.join(', ')}
      </p>
      {card.demoLink ? (
        <p className="m-0 mt-2 hs-snapshot-strip__heading hs-snapshot-strip__heading--linked">
          {card.demoLink.label}
        </p>
      ) : null}
    </SegmentShell>
  )
}

function IntegrationSegment({
  card,
}: {
  card: Extract<CommissioningSnapshotCard, { kind: 'interop' }>
}) {
  const readyItems = interopItemsInOrder(card.items, INTEGRATION_READY_KEYS)
  if (readyItems.length === 0) return null

  return (
    <SegmentShell label={card.label} href={card.href}>
      <SnapshotTextList items={readyItems.map(item => item.textLabel ?? item.name)} />
    </SegmentShell>
  )
}

function renderGridCard(card: CommissioningSnapshotCard) {
  switch (card.kind) {
    case 'regulation':
      return <GovernanceSegment key={card.kind} label={card.label} href={card.href} pills={card.pills} />
    case 'cost':
      return <CostSegment key={card.kind} card={card} />
    case 'platform':
      return <PlatformSegment key={card.kind} card={card} />
    case 'interop':
      return <IntegrationSegment key={card.kind} card={card} />
    default:
      return null
  }
}

/**
 * Persistent commissioning decision snapshot — governance, platform, integration,
 * where it's live (grid); funding opportunities full-width below when present.
 * Indicative cost is omitted from the PDP snapshot.
 */
export function PdpCommissioningSnapshot({
  cards,
  fundingCard,
  whereLiveApp,
  whereLiveHref,
}: {
  cards: CommissioningSnapshotCard[]
  fundingCard?: FundingSnapshotCard | null
  whereLiveApp: WhereLiveApp
  /** Deep-link target for the "Live deployments" tile; renders as a plain card when omitted. */
  whereLiveHref?: string
}) {
  return (
    <section className="m-0" aria-label="Commissioning snapshot">
      <div className="hs-snapshot-strip__grid">
        {cards.filter(card => card.kind !== 'regulation' && card.kind !== 'cost').map(card => renderGridCard(card))}
        <PdpWhereLiveSegment app={whereLiveApp} href={whereLiveHref} />
      </div>
      {fundingCard ? (
        <div className="hs-decision-snapshot__full-width">
          <FundingFullWidthSegment card={fundingCard} />
        </div>
      ) : null}
    </section>
  )
}
