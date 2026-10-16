import type { ReactNode } from 'react'
import { computeIllustrativeWorth, formatGbp } from '@/lib/pdpWorth'

/** KPI tile used across the PDP local-value sections. NHS type: heading-s value, body-s label. */
export function Tile({ value, label, sub, accent }: { value: string; label: string; sub?: string; accent?: string }) {
  return (
    <div className="hs-surface-card-sm bg-white border p-4 nhsuk-u-margin-bottom-3" style={{ borderColor: 'var(--border)' }}>
      <p className="nhsuk-heading-s nhsuk-u-margin-bottom-1" style={{ color: accent ?? 'var(--text-primary)' }}>{value}</p>
      <p className="nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-0" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="nhsuk-body-s nhsuk-u-margin-bottom-0" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  )
}

/**
 * Lays tiles out on the NHS grid: one column per tile from tablet (one-third
 * for three, one-half for two), stacked on mobile.
 * [Provenance: NHS] grid row / grid columns.
 */
export function PdpTileRow({ children, columns = 3 }: { children: ReactNode[]; columns?: 2 | 3 }) {
  const col = columns === 2 ? 'nhsuk-grid-column-one-half' : 'nhsuk-grid-column-one-third'
  return (
    <div className="nhsuk-grid-row">
      {children.map((child, i) => (
        <div key={i} className={col}>
          {child}
        </div>
      ))}
    </div>
  )
}

/** The three "What it could be worth" cards: capacity, cash and net position. */
export default function PdpWorthTiles() {
  const { capacity, cash, netLow, netHigh } = computeIllustrativeWorth()
  return (
    <PdpTileRow>
      <Tile value={formatGbp(capacity)} label="Capacity released / yr" sub="Freed acute beds & clinician time" />
      <Tile value={formatGbp(cash)} label="Cash-releasing / yr" sub="~40% of capacity converted to elective" />
      <Tile
        value={`${formatGbp(netLow)} to ${formatGbp(netHigh)}`}
        label="Net position / yr*"
        sub="*across the indicative price band"
        accent={netLow >= 0 ? '#007f3b' : 'var(--text-primary)'}
      />
    </PdpTileRow>
  )
}
