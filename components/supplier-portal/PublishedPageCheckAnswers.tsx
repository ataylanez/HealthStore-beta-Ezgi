'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { Button } from '@/components/ui/Button'
import type { ContentField } from '@/lib/supplierPortal'
import { publishedPageStatus } from './portalStatus'
import { useSupplierPortal } from './useSupplierPortal'

const NOT_PROVIDED = 'Not provided'
const DECLARATION =
  'By submitting these changes you confirm that the information is accurate and up to date. Your changes will be published on the Commissioning Store straight away.'

/**
 * Check your answers before submitting published page changes.
 * [Provenance: NHS / GOV.UK "Check answers" pattern]
 *
 * Only lists fields that differ from the published (or empty) version.
 */
export default function PublishedPageCheckAnswers({
  pageId,
  caption,
  title,
  fields,
  defaults,
  editHref,
  confirmationHref,
}: {
  pageId: string
  caption: string
  title: string
  fields: ContentField[]
  defaults: Record<string, string>
  editHref: string
  confirmationHref: string
}) {
  const router = useRouter()
  const { hydrated, getRecord, submitChanges } = useSupplierPortal()
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const record = getRecord('pages', pageId)
  const status = hydrated ? publishedPageStatus(record) : undefined
  const canSubmit = status === 'unpublished' || status === 'unpublished_changes'
  const draft = record.draft ?? {}
  const baseline = (key: string) => record.values?.[key] ?? defaults[key] ?? ''
  const value = (key: string) => draft[key] ?? baseline(key)
  // First time the page is submitted there is no published version yet — show every
  // field in the draft. Later submissions only list fields that actually changed.
  const isFirstSubmission = !record.hasBeenPublished && !record.values
  const isChanged = (fieldId: string) => {
    if (!(fieldId in draft)) return false
    if (isFirstSubmission) return true
    return draft[fieldId] !== baseline(fieldId)
  }
  const changedFields = fields.filter((f) => isChanged(f.id))

  useEffect(() => {
    if (hydrated && (!canSubmit || changedFields.length === 0) && !submitting) {
      router.replace(editHref)
    }
  }, [hydrated, canSubmit, changedFields.length, submitting, router, editHref])

  useEffect(() => {
    if (hydrated && canSubmit && changedFields.length > 0) {
      window.scrollTo(0, 0)
      headingRef.current?.focus()
    }
  }, [hydrated, canSubmit, changedFields.length])

  if (!hydrated || !canSubmit || changedFields.length === 0) return null

  function confirmAndSubmit() {
    if (submitting) return
    setSubmitting(true)
    submitChanges('pages', pageId)
    router.push(confirmationHref)
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={editHref} />
          <span className="nhsuk-caption-l">{caption}</span>
          <h1 ref={headingRef} tabIndex={-1} className="nhsuk-heading-xl outline-none">
            Check your answers before submitting
          </h1>
          <p className="nhsuk-body-m">Only the fields you have changed are shown below.</p>

          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">Your changes</h2>
          <dl className="nhsuk-summary-list">
            {changedFields.map((field) => {
              const v = value(field.id)
              return (
                <div key={field.id} className="nhsuk-summary-list__row">
                  <dt className="nhsuk-summary-list__key">{field.label}</dt>
                  <dd className="nhsuk-summary-list__value">
                    {v.trim() ? (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{v}</span>
                    ) : (
                      <span className="nhsuk-u-secondary-text-color">{NOT_PROVIDED}</span>
                    )}
                  </dd>
                  <dd className="nhsuk-summary-list__actions">
                    <Link className="hs-link-button" href={`${editHref}#page-${field.id}`}>
                      Change<span className="nhsuk-u-visually-hidden"> {field.label.toLowerCase()}</span>
                    </Link>
                  </dd>
                </div>
              )
            })}
          </dl>

          <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">Submit your changes</h2>
          <p className="nhsuk-body-m">{DECLARATION}</p>
          <Button variant="confirm" onClick={confirmAndSubmit} loading={submitting}>
            {submitting ? 'Submitting…' : 'Confirm and submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
