'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, AlertTriangle, UserCheck } from 'lucide-react'
import type { ApplicantFit, FundingResult, MatchType } from '@/lib/ai/funding'

type Props = {
  results: FundingResult[]
  region: string
  selectionLabel: string
  onFollowUp: (question: string) => void
  disabled?: boolean
}

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  dtx_specific: 'DTx-specific',
  condition: 'Condition match',
  condition_area: 'Condition area',
  generic_digital_health: 'Digital health',
}

const APPLICANT_FIT_META: Record<
  ApplicantFit,
  { label: string; bg: string; color: string } | null
> = {
  commissioner_eligible: { label: 'You can apply', bg: '#E8F5EC', color: 'var(--nhs-green)' },
  adoption_partner: { label: 'As adoption partner', bg: '#E8F5EC', color: 'var(--nhs-green)' },
  unclear: { label: 'Eligibility unclear', bg: 'var(--surface)', color: 'var(--text-muted)' },
  // Filtered out before reaching the UI; no badge needed.
  developer_or_academic_only: null,
}

function confidenceBand(score: number): { label: string; color: string; text: string } {
  // `color` drives the (decorative) progress-bar fill; `text` is the label colour,
  // which must stay WCAG-readable on white. NHS orange isn't text-safe, so the amber
  // band uses the readable amber-brown text shade.
  if (score >= 75) return { label: 'Strong match', color: 'var(--nhs-green)', text: 'var(--nhs-green)' }
  if (score >= 50) return { label: 'Moderate match', color: 'var(--nhs-blue)', text: 'var(--nhs-blue)' }
  if (score >= 30) return { label: 'Weak match', color: 'var(--nhs-amber)', text: '#7A4800' }
  return { label: 'Low match', color: 'var(--nhs-red)', text: 'var(--nhs-red)' }
}

function ResultCard({ result, disabled }: { result: FundingResult; disabled?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const band = confidenceBand(result._score)

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-md px-2 py-1 hs-text-caption hs-font-bold"
          style={{ background: '#E6F0FB', color: 'var(--nhs-blue)' }}
        >
          {MATCH_TYPE_LABELS[result.match_type]}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 hs-text-caption hs-font-normal"
          style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
        >
          <MapPin className="h-3 w-3" />
          {result.region_scope}
        </span>
        {APPLICANT_FIT_META[result.applicant_fit] && (
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hs-text-caption hs-font-bold"
            style={{
              background: APPLICANT_FIT_META[result.applicant_fit]!.bg,
              color: APPLICANT_FIT_META[result.applicant_fit]!.color,
            }}
          >
            <UserCheck className="h-3 w-3" />
            {APPLICANT_FIT_META[result.applicant_fit]!.label}
          </span>
        )}
      </div>

      <h4
        className="hs-text-body hs-font-bold leading-snug"
        style={{ color: 'var(--text-primary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
      >
        {result.fund_name}
      </h4>
      <p className="mt-1 hs-text-label" style={{ color: 'var(--text-secondary)' }}>
        {result.provider}
      </p>

      {/* Confidence bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="hs-text-caption hs-font-bold" style={{ color: band.text }}>
            {result._score}/100 — {band.label}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${result._score}%`, background: band.color }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        disabled={disabled}
        className="mt-4 flex items-center gap-1 nhsuk-body-m nhsuk-u-margin-bottom-0 transition-colors underline hover:no-underline disabled:opacity-40"
        style={{ color: 'var(--nhs-blue)', fontFamily: 'Frutiger, Arial, sans-serif' }}
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <dl className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <dt className="nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color">
              Eligibility
            </dt>
            <dd className="nhsuk-body-m">{result.eligibility_summary || '—'}</dd>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color">
                Amount
              </dt>
              <dd className="nhsuk-body-m">{result.amount_range ?? 'Not specified'}</dd>
            </div>
            <div>
              <dt className="nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color">
                Deadline
              </dt>
              <dd className="nhsuk-body-m">{result.deadline ?? 'Ongoing / unknown'}</dd>
            </div>
          </div>
          <div>
            <dt className="nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color">
              Why this matches
            </dt>
            <dd className="nhsuk-body-m">{result.match_rationale || '—'}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}

export default function FundingResults({
  results,
  region,
  selectionLabel,
  onFollowUp,
  disabled,
}: Props) {
  const empty = results.length === 0

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="nhsuk-body-m nhsuk-u-font-weight-bold">
          {empty
            ? 'No funding opportunities found'
            : `${results.length} ${results.length === 1 ? 'opportunity' : 'opportunities'} found`}
          {' · '}
          <span className="nhsuk-body-s nhsuk-u-font-weight-normal nhsuk-u-secondary-text-color">
            {selectionLabel} · {region}
          </span>
        </p>
      </div>

      {empty ? (
        <div
          className="rounded-xl border px-4 py-6 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <p className="nhsuk-body-m">
            No matches were returned. Try the broader condition area, or a different region.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r, i) => (
            <ResultCard key={`${r.fund_name}-${i}`} result={r} disabled={disabled} />
          ))}
        </div>
      )}

      <div
        className="mt-4 flex items-start gap-2 rounded-lg px-4 py-2 nhsuk-body-m"
        style={{ background: 'var(--surface)' }}
      >
        <AlertTriangle className="mt-1 h-3.5 w-3.5 flex-shrink-0" style={{ color: '#7A4800' }} />
        <span>
          AI-generated results may be incomplete or out of date. Always verify eligibility, amounts,
          and deadlines directly with the funder before relying on them.
        </span>
      </div>

      {!empty && (
        <div className="mt-4">
          <p
            className="mb-2 nhsuk-body-s nhsuk-u-font-weight-bold nhsuk-u-secondary-text-color"
          >
            Follow-up questions
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFollowUp('Compare the top two funds')}
              disabled={disabled}
              className="rounded-full border px-4 py-2 nhsuk-body-m nhsuk-u-margin-bottom-0 transition-colors disabled:opacity-40"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card)',
                color: 'var(--nhs-blue)',
                fontFamily: 'Frutiger, Arial, sans-serif',
              }}
            >
              Compare the top two funds
            </button>
            <button
              type="button"
              onClick={() => onFollowUp('How do I apply for the strongest match?')}
              disabled={disabled}
              className="rounded-full border px-4 py-2 nhsuk-body-m nhsuk-u-margin-bottom-0 transition-colors disabled:opacity-40"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card)',
                color: 'var(--nhs-blue)',
                fontFamily: 'Frutiger, Arial, sans-serif',
              }}
            >
              How do I apply for the strongest match?
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
