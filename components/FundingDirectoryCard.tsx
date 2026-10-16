import { ConditionTag } from '@/components/Badges'
import type { App } from '@/lib/data'
import { isFundingCondition } from '@/lib/visibleConditions'

/** Shape of rows in `content/funding/funding.json` used by the funding directory. */
export type FundingDirectoryRecord = {
  id: string
  title: string
  sponsoring_body: string
  description: string
  total_value: string | null
  closing_date: string | null
  closing_date_note: string | null
  status: string
  condition_tags: string[]
  app_tags: string[]
  notes?: string | null
  external_url?: string | null
  external_url_label?: string | null
}

function formatClosingSummary(f: FundingDirectoryRecord): string {
  const note = f.closing_date_note?.trim()
  if (f.closing_date) {
    const d = new Date(f.closing_date)
    if (!Number.isNaN(d.getTime())) {
      const formatted = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      return note ? `${formatted} — ${note}` : formatted
    }
  }
  if (note) return note
  return 'Ongoing — confirm with sponsor'
}

export function FundingDirectoryCard({ f }: { f: FundingDirectoryRecord; apps?: App[] }) {
  const titleId = `funding-title-${f.id}`
  const metaLine = `${f.sponsoring_body || 'Sponsor not stated'} · ${formatClosingSummary(f)}`

  return (
    // [Provenance: NHS] NHS Card.
    <article aria-labelledby={titleId} className="nhsuk-card">
      <div className="nhsuk-card__content">
        <h3 id={titleId} className="nhsuk-card__heading nhsuk-heading-m">
          {f.title}
        </h3>

        {f.total_value ? (
          <p className="nhsuk-body-m nhsuk-u-font-weight-bold" style={{ color: 'var(--text-primary)' }}>
            {f.total_value}
          </p>
        ) : (
          <p className="nhsuk-body-s" style={{ color: 'var(--text-secondary)' }}>
            Amount not stated
          </p>
        )}

        <p className="nhsuk-body-m" style={{ color: 'var(--text-secondary)' }}>
          {f.description}
        </p>

        <p className="nhsuk-body-s" style={{ color: 'var(--text-secondary)' }}>
          {metaLine}
        </p>

        <div className="nhsuk-u-margin-bottom-3 flex flex-wrap gap-1">
          {f.condition_tags
            .filter(isFundingCondition)
            .map(t => (
              <ConditionTag key={t} tag={t} />
            ))}
        </div>

        {f.notes ? (
          <p className="nhsuk-body-s" style={{ color: 'var(--text-secondary)' }}>
            {f.notes}
          </p>
        ) : null}

        {f.external_url ? (
          <p className="nhsuk-body-m nhsuk-u-margin-bottom-0">
            <a href={f.external_url}>{f.external_url_label ?? 'More information'}</a>
          </p>
        ) : null}
      </div>
    </article>
  )
}
