import type { CSSProperties } from 'react'
import { isVisibleCondition } from '@/lib/visibleConditions'

/* NHS tag geometry: body-s type (14→16px), regular weight, square corners. */
const pillText: CSSProperties = {
  fontSize: 'var(--text-badge)',
  lineHeight: '1.3',
  fontWeight: 400,
  padding: '2px 8px 3px',
  borderRadius: 1,
  border: 'none',
  display: 'inline-block',
}

const CONDITION_LABELS: Record<string, string> = {
  copd: 'COPD',
  insomnia: 'Insomnia',
  weight_management: 'Weight management',
  msk: 'MSK',
  eating_disorders: 'Eating disorders',
  cardiac_rehab: 'Cardiac rehab',
}

const CONDITION_PILL_BG = 'rgba(0, 94, 182, 0.1)'
const CONDITION_PILL_COLOR = 'rgb(0, 94, 184)'

export function EditorialTopicPill({ label }: { label: string }) {
  return (
    <span style={{ ...pillText, background: '#E8ECEF', color: '#3d4f5f' }}>
      {label}
    </span>
  )
}

/** Evidence type / category — same visual language as topic pills on home editorial only */
export function EditorialCategoryPill({ label }: { label: string }) {
  return (
    <span style={{ ...pillText, background: '#E2E8F0', color: '#334155' }}>
      {label}
    </span>
  )
}

export function EditorialConditionPill({ tag }: { tag: string }) {
  const label = CONDITION_LABELS[tag] ?? tag
  return (
    <span style={{ ...pillText, background: CONDITION_PILL_BG, color: CONDITION_PILL_COLOR }}>
      {label}
    </span>
  )
}

export function EditorialPillRow({
  topics,
  conditions,
  className = 'mb-2',
}: {
  topics: string[]
  conditions: string[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {topics.map((t) => (
        <EditorialTopicPill key={t} label={t} />
      ))}
      {conditions.filter(isVisibleCondition).map((t) => (
        <EditorialConditionPill key={t} tag={t} />
      ))}
    </div>
  )
}

export function EditorialEvidenceMetaRow({
  evidenceType,
  conditions,
  className = '',
}: {
  evidenceType: string
  conditions: string[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <EditorialCategoryPill label={evidenceType} />
      {conditions.filter(isVisibleCondition).map((t) => (
        <EditorialConditionPill key={t} tag={t} />
      ))}
    </div>
  )
}
