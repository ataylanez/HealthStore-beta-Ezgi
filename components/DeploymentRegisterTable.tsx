'use client'

import { useMemo } from 'react'
import { statusMeta, summarizeDeployments, type DeploymentRow } from '@/lib/deploymentRegister'

/** Map deployment status onto GOV.UK-style `.badge` colour modifiers. */
function statusBadgeClass(status: string | undefined): string {
  const key = (status ?? 'unknown').toLowerCase()
  if (key === 'live') return 'badge badge-green'
  if (key === 'pilot') return 'badge badge-blue'
  if (key === 'research') return 'badge badge-purple'
  if (key === 'historic') return 'badge badge-red'
  if (key === 'undocumented') return 'badge badge-amber'
  return 'badge badge-grey'
}

function StatusBadge({ status }: { status: string | undefined }) {
  const meta = statusMeta(status)
  return (
    <span className={`${statusBadgeClass(status)} whitespace-nowrap text-center`}>
      {meta.label}
    </span>
  )
}

function dash(v?: string) {
  return v && v.trim() ? v : '—'
}

/** Shorten common care-setting labels for the NHS experience table. */
function formatCareSetting(v?: string) {
  if (!v?.trim()) return '—'
  return v
    .replace(/\bSecondary care\b/gi, 'Secondary')
    .replace(/\bPrimary care\b/gi, 'Primary')
}

function DeploymentStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="hs-deploy-stat">
      <span className="hs-deploy-stat__value">{value}</span>
      <span className="hs-deploy-stat__label">{label}</span>
    </div>
  )
}

/**
 * "Where it's live" deployment register table.
 * See docs/PDP_WHERE_ITS_LIVE_REDESIGN.md.
 */
export function DeploymentRegisterTable({ rows }: { rows: DeploymentRow[] }) {
  const summary = useMemo(() => summarizeDeployments(rows), [rows])

  if (rows.length === 0) {
    return (
      <p className="nhsuk-body-m">
        No named NHS deployments are recorded for this product in catalogue sources.
      </p>
    )
  }

  return (
    <div>
      <div className="hs-deploy-stats" role="list" aria-label="Deployment summary">
        <DeploymentStat
          value={summary.total}
          label={summary.total === 1 ? 'Deployment' : 'Deployments'}
        />
        {summary.primaryCount > 0 ? (
          <DeploymentStat value={summary.primaryCount} label="Primary" />
        ) : null}
        {summary.secondaryCount > 0 ? (
          <DeploymentStat value={summary.secondaryCount} label="Secondary" />
        ) : null}
        {summary.communityCount > 0 ? (
          <DeploymentStat value={summary.communityCount} label="Community" />
        ) : null}
      </div>

      {/* [Provenance: NHS] Official NHS Table. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="nhsuk-table">
          <caption className="nhsuk-table__caption nhsuk-u-visually-hidden">
            Where this product is deployed across NHS England, by site, ICB, care setting and status.
          </caption>
          <thead className="nhsuk-table__head">
            <tr className="nhsuk-table__row">
              <th scope="col" className="nhsuk-table__header">Site / service</th>
              <th scope="col" className="nhsuk-table__header">ICB / place</th>
              <th scope="col" className="nhsuk-table__header">Care setting</th>
              <th scope="col" className="nhsuk-table__header" style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody className="nhsuk-table__body">
            {rows.map((r, i) => (
              <tr key={i} className="nhsuk-table__row hs-deploy-row align-top">
                <td className="nhsuk-table__cell">
                  <div className="hs-font-normal">{r.site}</div>
                  {r.condition ? (
                    <div>{r.condition}</div>
                  ) : null}
                </td>
                <td className="nhsuk-table__cell">
                  <div>{dash(r.icb)}</div>
                  {r.location ? (
                    <div>{r.location}</div>
                  ) : null}
                </td>
                <td className="nhsuk-table__cell">
                  {formatCareSetting(r.care_setting)}
                </td>
                <td className="nhsuk-table__cell" style={{ textAlign: 'right' }}>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="hs-deploy-sites m-0 list-none space-y-4 p-0 sm:hidden">
        {rows.map((r, i) => {
          return (
            <li key={i} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="hs-font-bold">{r.site}</div>
                  {r.condition ? (
                    <div>{r.condition}</div>
                  ) : null}
                </div>
                <StatusBadge status={r.status} />
              </div>
              <dl className="nhsuk-body-m">
                <div>
                  <dt className="inline nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color">ICB / place: </dt>
                  <dd className="inline">
                    {dash(r.icb)}
                    {r.location ? ` — ${r.location}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="inline nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color">Care setting: </dt>
                  <dd className="inline">{formatCareSetting(r.care_setting)}</dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
