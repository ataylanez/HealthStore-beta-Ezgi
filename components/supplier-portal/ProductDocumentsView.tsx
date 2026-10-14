'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  PRODUCT_CONTENT_FIELDS,
  PRODUCT_DOCUMENT_FIELDS,
  UPLOADED_ON_SUFFIX,
  findManagedProduct,
  formatPortalDate,
  managedProductCheckAnswersHref,
  managedProductFieldHref,
} from '@/lib/supplierPortal'
import { managedProductStatus, managedProductStatuses } from './portalStatus'
import { ReviewStatusSummary } from './ReviewStatusSummary'
import { useSupplierPortal } from './useSupplierPortal'

const NOT_PROVIDED = 'Not provided'

/**
 * Product documents and content. [Provenance: NHS Summary list + Check answers pattern]
 *
 * Shows only the latest version of each item (the back office keeps earlier
 * versions). Each row has a Change (content) or Replace (document) link to a
 * one-question page; there is deliberately no delete. Changes are held as a
 * draft until "Submit for review".
 */
export default function ProductDocumentsView({
  productId,
  defaults,
}: {
  productId: string
  /** Last approved values (from the catalogue data). */
  defaults: Record<string, string>
}) {
  const router = useRouter()
  const product = findManagedProduct(productId)!
  const { hydrated, getRecord, simulateApproval, simulateRejection } = useSupplierPortal()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  const record = getRecord('products', productId)
  const statuses = hydrated ? managedProductStatuses(product, record) : []
  const status = hydrated ? managedProductStatus(product, record) : undefined
  const value = (key: string) => record.draft?.[key] ?? record.values?.[key] ?? defaults[key] ?? ''
  const canSubmit = status === 'draft_changes' || status === 'action_needed'
  const showActionNeeded = statuses.includes('action_needed') || (Boolean(product.actionNeeded) && statuses.includes('draft_changes'))
  const attentionFields = new Set(
    statuses.includes('action_needed') || statuses.includes('draft_changes')
      ? (record.actionNeededFields ?? product.actionNeededFields ?? [])
      : [],
  )
  const needsAttention = (fieldId: string) => attentionFields.has(fieldId)
  // Review rejection vs expired date — expiry messaging is kept for later.
  const actionNeededReason = record.actionNeededReason ?? product.actionNeededReason ?? 'review_rejection'
  const fieldAttentionMessage = (label: string) =>
    actionNeededReason === 'expired' ? `${label} needs to be updated` : `${label} changes were not approved`
  const attentionItems = [
    ...PRODUCT_CONTENT_FIELDS.filter((field) => needsAttention(field.id)).map((field) => ({
      id: field.id,
      href: `#product-field-${field.id}`,
      message: fieldAttentionMessage(field.label),
    })),
    ...PRODUCT_DOCUMENT_FIELDS.filter((field) => needsAttention(field.id)).map((field) => ({
      id: field.id,
      href: `#product-field-${field.id}`,
      message: fieldAttentionMessage(field.label),
    })),
  ]
  const attentionById = new Map(attentionItems.map((item) => [item.id, item.message]))
  const showErrorSummary = showActionNeeded || attentionItems.length > 0

  useEffect(() => {
    if (showErrorSummary) errorSummaryRef.current?.focus()
  }, [showErrorSummary])

  if (!hydrated || !status) return null

  return (
    <>
      {showErrorSummary && (
        <div ref={errorSummaryRef} className="nhsuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
          <h2 className="nhsuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="nhsuk-error-summary__body">
            {product.actionNeeded ? <p>{product.actionNeeded}</p> : null}
            <ul className="nhsuk-list nhsuk-error-summary__list" role="list">
              {(attentionItems.length > 0
                ? attentionItems
                : [
                    {
                      id: 'product-information',
                      href: '#product-information',
                      message:
                        'Your changes were not approved. Update the information or documents below and submit them for review again.',
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
      )}

      <span className="nhsuk-caption-l">Documents and content</span>
      <h1 ref={headingRef} tabIndex={-1} className="page-title-h1 outline-none">
        {product.name}
      </h1>

      <ReviewStatusSummary
        status={status}
        statuses={statuses}
        lastUpdated={record.lastUpdated ?? product.lastUpdated}
        draftMessage="You have changes saved as a draft. They will not be seen by the NHS HealthStore team until you submit them for review."
        onSimulateApproval={() => simulateApproval('products', productId)}
        onSimulateRejection={() => simulateRejection('products', productId)}
      />

      <h2 id="product-information" className="nhsuk-heading-m nhsuk-u-margin-top-7">
        Product information
      </h2>
      <dl className="nhsuk-summary-list">
        {PRODUCT_CONTENT_FIELDS.map((field) => {
          const v = value(field.id)
          return (
            <div
              key={field.id}
              id={`product-field-${field.id}`}
              className={needsAttention(field.id) ? 'nhsuk-summary-list__row hs-action-needed' : 'nhsuk-summary-list__row'}
            >
              <dt className="nhsuk-summary-list__key">{field.label}</dt>
              <dd className="nhsuk-summary-list__value">
                {attentionById.has(field.id) ? (
                  <span className="nhsuk-error-message" id={`product-field-${field.id}-error`}>
                    <span className="nhsuk-u-visually-hidden">Error:</span> {attentionById.get(field.id)}
                  </span>
                ) : null}
                {v.trim() ? <span style={{ whiteSpace: 'pre-wrap' }}>{v}</span> : <span className="nhsuk-u-secondary-text-color">{NOT_PROVIDED}</span>}
              </dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={managedProductFieldHref(productId, field.id)}>
                  Change<span className="nhsuk-u-visually-hidden"> {field.label.toLowerCase()}</span>
                </Link>
              </dd>
            </div>
          )
        })}
      </dl>

      <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">Documents</h2>
      <p className="nhsuk-body-m">
        You can replace a document with a newer version. Only the latest version is shown here; the NHS HealthStore team
        keeps previous versions.
      </p>
      <dl className="nhsuk-summary-list">
        {PRODUCT_DOCUMENT_FIELDS.map((field) => {
          const fileName = value(field.id)
          const uploadedOn = value(`${field.id}${UPLOADED_ON_SUFFIX}`)
          return (
            <div
              key={field.id}
              id={`product-field-${field.id}`}
              className={needsAttention(field.id) ? 'nhsuk-summary-list__row hs-action-needed' : 'nhsuk-summary-list__row'}
            >
              <dt className="nhsuk-summary-list__key">{field.label}</dt>
              <dd className="nhsuk-summary-list__value">
                {attentionById.has(field.id) ? (
                  <span className="nhsuk-error-message" id={`product-field-${field.id}-error`}>
                    <span className="nhsuk-u-visually-hidden">Error:</span> {attentionById.get(field.id)}
                  </span>
                ) : null}
                {fileName ? (
                  <>
                    {fileName}
                    <br />
                    <span className="nhsuk-u-secondary-text-color nhsuk-body-s">Uploaded {formatPortalDate(uploadedOn)}</span>
                  </>
                ) : (
                  <span className="nhsuk-u-secondary-text-color">{NOT_PROVIDED}</span>
                )}
              </dd>
              <dd className="nhsuk-summary-list__actions">
                <Link className="hs-link-button" href={managedProductFieldHref(productId, field.id)}>
                  {fileName ? 'Replace' : 'Upload'}
                  <span className="nhsuk-u-visually-hidden"> {field.label}</span>
                </Link>
              </dd>
            </div>
          )
        })}
      </dl>

      {canSubmit && (
        <div className="nhsuk-u-margin-top-7">
          <h2 className="nhsuk-heading-m">Submit your changes</h2>
          <p className="nhsuk-body-m">The NHS HealthStore team will review your changes before they are used.</p>
          <Button type="button" onClick={() => router.push(managedProductCheckAnswersHref(productId))}>
            Submit for review
          </Button>
        </div>
      )}
    </>
  )
}
