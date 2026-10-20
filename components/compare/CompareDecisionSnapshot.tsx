import type { ReactNode } from 'react'
import type { App } from '@/lib/data'
import {
  getCommissioningSnapshot,
  type CommissioningSnapshotCard,
  type InteropSnapshotItem,
  type RegulationSnapshotPill,
} from '@/lib/commissioningSnapshot'
import { getWhereLiveSummary } from '@/lib/whereLiveSummary'

const INTEGRATION_READY_KEYS = ['fhir', 'emis'] as const

function interopItemsInOrder(items: InteropSnapshotItem[], keys: readonly string[]): InteropSnapshotItem[] {
  return keys.flatMap(k => {
    const item = items.find(i => i.key === k)
    return item && item.integrated === true ? [item] : []
  })
}

function SnapshotPill({ children }: { children: ReactNode }) {
  return <span className="badge badge-grey max-w-full">{children}</span>
}

function MiniSegment({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="hs-compare-snapshot__segment">
      <div className="hs-compare-snapshot__label">{label}</div>
      <div className="hs-compare-snapshot__value">{children}</div>
    </div>
  )
}

function GovernanceMini({ pills }: { pills: RegulationSnapshotPill[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
      {pills.map(p => (
        <li key={p.label}>
          <span className="badge badge-blue max-w-full">{p.label}</span>
        </li>
      ))}
    </ul>
  )
}

function PricingMini({ card }: { card: Extract<CommissioningSnapshotCard, { kind: 'cost' }> }) {
  if (card.modelPills.length === 0) {
    return <span className="hs-text-label" style={{ color: 'var(--text-muted)' }}>Check with supplier</span>
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {card.modelPills.map(text => (
        <SnapshotPill key={text}>{text}</SnapshotPill>
      ))}
      {card.indicativeNote ? (
        <span className="hs-text-label" style={{ color: 'var(--text-muted)' }}>{card.indicativeNote}</span>
      ) : null}
    </div>
  )
}

function IntegrationsMini({ card }: { card: Extract<CommissioningSnapshotCard, { kind: 'interop' }> }) {
  const readyItems = interopItemsInOrder(card.items, INTEGRATION_READY_KEYS)
  if (readyItems.length === 0) {
    return <span className="hs-text-label" style={{ color: 'var(--text-muted)' }}>Information not available</span>
  }
  return (
    <span className="hs-text-label" style={{ color: 'var(--text-secondary)' }}>
      {readyItems.map(item => item.textLabel ?? item.name).join(' · ')}
    </span>
  )
}

function PlatformMini({ card }: { card: Extract<CommissioningSnapshotCard, { kind: 'platform' }> }) {
  return (
    <span className="hs-text-label" style={{ color: 'var(--text-secondary)' }}>
      {card.values.join(', ')}
    </span>
  )
}

function WhereLiveMini({ app }: { app: App }) {
  const { headline, detail } = getWhereLiveSummary(app)
  return (
    <div>
      <p className="nhsuk-body-m nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-0">{headline}</p>
      {detail ? (
        <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">{detail}</p>
      ) : null}
    </div>
  )
}

function CompareSnapshotCell({ app }: { app: App }) {
  const cards = getCommissioningSnapshot(app)
  const governance = cards.find(c => c.kind === 'regulation') as Extract<CommissioningSnapshotCard, { kind: 'regulation' }> | undefined
  const pricing = cards.find(c => c.kind === 'cost') as Extract<CommissioningSnapshotCard, { kind: 'cost' }> | undefined
  const platform = cards.find(c => c.kind === 'platform') as Extract<CommissioningSnapshotCard, { kind: 'platform' }> | undefined
  const interop = cards.find(c => c.kind === 'interop') as Extract<CommissioningSnapshotCard, { kind: 'interop' }> | undefined

  return (
    <div className="hs-compare-snapshot__cell">
      <MiniSegment label="Live deployments">
        <WhereLiveMini app={app} />
      </MiniSegment>
      {governance ? (
        <MiniSegment label="Governance">
          <GovernanceMini pills={governance.pills} />
        </MiniSegment>
      ) : null}
      {platform ? (
        <MiniSegment label="Platform">
          <PlatformMini card={platform} />
        </MiniSegment>
      ) : null}
      {pricing ? (
        <MiniSegment label="Indicative cost">
          <PricingMini card={pricing} />
        </MiniSegment>
      ) : null}
      {interop ? (
        <MiniSegment label="Technical integration">
          <IntegrationsMini card={interop} />
        </MiniSegment>
      ) : null}
    </div>
  )
}

type Props = {
  apps: App[]
  layout: 'band' | 'card'
}

/**
 * Per-product decision snapshot for the comparison tool.
 * Mirrors PDP callouts: Where it's live, Governance, Pricing model, Integrations.
 */
export function CompareDecisionSnapshot({ apps, layout }: Props) {
  if (apps.length === 0) return null

  if (layout === 'band') {
    return (
      <section className="hs-compare-snapshot hs-compare-snapshot--band" aria-label="Decision snapshot">
        <h2 className="sr-only">Decision snapshot comparison</h2>
        <div
          className="hs-compare-snapshot__band-grid"
          style={{ gridTemplateColumns: `repeat(${apps.length}, minmax(180px, 1fr))` }}
        >
          {apps.map(app => (
            <CompareSnapshotCell key={app.id} app={app} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="hs-compare-snapshot hs-compare-snapshot--cards" aria-label="Decision snapshot">
      <h2 className="sr-only">Decision snapshot comparison</h2>
      <div
        className="hs-compare-snapshot__cards-grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(apps.length, 4)}, minmax(200px, 1fr))` }}
      >
        {apps.map(app => (
          <article key={app.id} className="hs-compare-snapshot__card">
            <h3 className="hs-compare-snapshot__card-title">{app.app_name}</h3>
            <CompareSnapshotCell app={app} />
          </article>
        ))}
      </div>
    </section>
  )
}
