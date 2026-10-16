'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorSummary } from '@/components/eoi/journey/shared'
import type { FieldError } from '@/components/eoi/journey/EoiJourneyProvider'
import { Button } from '@/components/ui/Button'
import { FormField, Textarea, TextInput } from '@/components/ui/FormField'
import {
  PORTAL_PATHS,
  PUBLISHED_PAGE_DUMMY_ANSWERS,
  type ContentField,
  type ReadOnlyRow,
} from '@/lib/supplierPortal'
import { publishedPageStatus, publishedPageStatuses } from './portalStatus'
import { ReviewStatusSummary } from './ReviewStatusSummary'
import { useSupplierPortal } from './useSupplierPortal'

/**
 * Edit a Commissioning Store page (product page or supplier page).
 *
 * User-entered content is editable (NHS form fields); content that comes from
 * onboarding is shown read-only in an NHS Summary list without Change links.
 * "Submit changes" saves the draft and opens Check your answers; "Save and exit"
 * keeps edits; "Cancel and exit" discards unsaved changes on this page.
 */
export default function PublishedPageEditor({
  pageId,
  caption,
  title,
  fields,
  defaults,
  readOnlyHeading,
  readOnlyIntro,
  readOnly,
  viewHref,
  checkAnswersHref,
}: {
  pageId: string
  caption: string
  title: string
  fields: ContentField[]
  defaults: Record<string, string>
  readOnlyHeading: string
  readOnlyIntro: string
  readOnly: ReadOnlyRow[]
  /** Live page on the Commissioning Store, when there is one. */
  viewHref?: string
  /** Check your answers before submitting changes. */
  checkAnswersHref: string
}) {
  const router = useRouter()
  const { hydrated, getRecord, saveDraft, simulateApproval, simulateRejection } = useSupplierPortal()
  const [form, setForm] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<FieldError[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const actionErrorSummaryRef = useRef<HTMLDivElement>(null)

  const record = getRecord('pages', pageId)

  useEffect(() => {
    if (!hydrated) return
    const initial: Record<string, string> = {}
    for (const f of fields) initial[f.id] = record.draft?.[f.id] ?? record.values?.[f.id] ?? defaults[f.id] ?? ''
    setForm(initial)
    // Prefill once, after stored state has been read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const statuses = hydrated ? publishedPageStatuses(record) : []
  const status = hydrated ? publishedPageStatus(record) : undefined
  const showActionNeeded = statuses.includes('action_needed')
  const attentionFields = new Set(showActionNeeded ? (record.actionNeededFields ?? []) : [])
  const actionNeededReason = record.actionNeededReason ?? 'review_rejection'
  const fieldAttentionMessage = (label: string) =>
    actionNeededReason === 'expired' ? `${label} needs to be updated` : `${label} changes were not approved`
  const attentionItems = fields
    .filter((field) => attentionFields.has(field.id))
    .map((field) => ({
      id: field.id,
      href: `#page-${field.id}`,
      message: fieldAttentionMessage(field.label),
    }))
  const attentionById = new Map(attentionItems.map((item) => [item.id, item.message]))
  const showActionErrorSummary = showActionNeeded || attentionItems.length > 0

  useEffect(() => {
    if (showActionErrorSummary && errors.length === 0) actionErrorSummaryRef.current?.focus()
  }, [showActionErrorSummary, errors.length])

  if (!hydrated || !status) return null

  const trimmed = () => Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]))
  const errorFor = (field: string) => errors.find((er) => er.field === field)?.message
  const fieldError = (fieldId: string) =>
    errorFor(`page-${fieldId}`) ?? (attentionById.has(fieldId) ? attentionById.get(fieldId) : undefined)

  function fillWithDummyText() {
    setForm((current) => {
      const next = { ...current }
      for (const f of fields) {
        next[f.id] = PUBLISHED_PAGE_DUMMY_ANSWERS[f.id] ?? `Example ${f.label.toLowerCase()}`
      }
      return next
    })
    setErrors([])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const values = trimmed()
    const found: FieldError[] = []
    for (const f of fields) {
      if (!values[f.id]) {
        found.push({ field: `page-${f.id}`, message: `Enter ${f.label.toLowerCase()}` })
      }
    }
    setErrors(found)
    if (found.length > 0) return
    saveDraft('pages', pageId, values)
    router.push(checkAnswersHref)
  }

  return (
    <>
      {errors.length > 0 ? (
        <ErrorSummary errors={errors} />
      ) : showActionErrorSummary ? (
        <div
          ref={actionErrorSummaryRef}
          className="nhsuk-error-summary"
          aria-labelledby="error-summary-title"
          role="alert"
          tabIndex={-1}
        >
          <h2 className="nhsuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="nhsuk-error-summary__body">
            <ul className="nhsuk-list nhsuk-error-summary__list" role="list">
              {(attentionItems.length > 0
                ? attentionItems
                : [
                    {
                      id: 'your-content',
                      href: '#your-content',
                      message:
                        'Your changes were not approved. Update the information below and submit them for review again.',
                    },
                  ]
              ).map((item) => (
                <li key={item.id}>
                  <a href={item.href}>{item.message}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <span className="nhsuk-caption-l">{caption}</span>
      <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
        {title}
      </h1>

      <ReviewStatusSummary
        status={status}
        statuses={statuses}
        lastUpdated={record.lastUpdated}
        commissioningStoreLink={
          viewHref && record.hasBeenPublished ? { href: viewHref, label: title } : undefined
        }
        draftMessage={
          statuses.includes('unpublished') && !statuses.includes('unpublished_changes')
            ? 'This page is not published yet, so commissioners cannot see it on the Commissioning Store. Add your content and submit your changes.'
            : 'You have changes saved that are not published. Commissioners will keep seeing the published version until your changes are submitted, reviewed and published.'
        }
        onSimulateApproval={() => simulateApproval('pages', pageId)}
        onSimulateRejection={() => simulateRejection('pages', pageId)}
      />

      <h2 id="your-content" className="nhsuk-heading-m nhsuk-u-margin-top-7">
        Your content
      </h2>
      <p className="nhsuk-body-m">
        <button
          type="button"
          className="nhsuk-link"
          onClick={fillWithDummyText}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
        >
          Fill with dummy text
        </button>
      </p>
      <form noValidate onSubmit={handleSubmit}>
        {fields.map((f) => (
          <FormField
            key={f.id}
            id={`page-${f.id}`}
            label={f.label}
            hint={f.hint}
            error={fieldError(f.id)}
            required
          >
            {(field) =>
              f.type === 'textarea' ? (
                <Textarea
                  {...field}
                  name={f.id}
                  rows={5}
                  value={form[f.id] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.id]: e.target.value }))}
                />
              ) : (
                <TextInput
                  {...field}
                  name={f.id}
                  className="nhsuk-input--width-30"
                  value={form[f.id] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.id]: e.target.value }))}
                />
              )
            }
          </FormField>
        ))}

        <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">{readOnlyHeading}</h2>
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p>{readOnlyIntro}</p>
        </div>
        <dl className="nhsuk-summary-list">
          {readOnly.map((row) => (
            <div key={row.label} className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">{row.label}</dt>
              <dd className="nhsuk-summary-list__value">{row.value}</dd>
            </div>
          ))}
        </dl>

        {viewHref ? (
          <p className="nhsuk-body-m nhsuk-u-margin-top-4">
            <a className="nhsuk-link" href={viewHref} target="_blank" rel="noopener noreferrer">
              Preview changes
            </a>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button type="submit">Submit changes</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              saveDraft('pages', pageId, trimmed())
              router.push(PORTAL_PATHS.published)
            }}
          >
            Save and exit
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push(PORTAL_PATHS.published)}>
            Cancel and exit
          </Button>
        </div>
      </form>
    </>
  )
}
