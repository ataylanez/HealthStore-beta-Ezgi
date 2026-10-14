'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { Button } from '@/components/ui/Button'
import {
  PRODUCT_CONTENT_FIELDS,
  PRODUCT_DOCUMENT_FIELDS,
  UPLOADED_ON_SUFFIX,
  findManagedProduct,
  formatPortalDate,
  managedProductConfirmationHref,
  managedProductFieldHref,
  managedProductHref,
} from '@/lib/supplierPortal'
import { managedProductStatus } from './portalStatus'
import { useSupplierPortal } from './useSupplierPortal'

const NOT_PROVIDED = 'Not provided'
const DECLARATION =
  'By submitting these changes you confirm that the information and documents are accurate and up to date.'

/**
 * Check your answers before submitting product updates.
 * [Provenance: NHS / GOV.UK "Check answers" pattern]
 *
 * Only lists fields that differ from the last approved version (draft changes).
 * Reachable only when the product has draft or action-needed changes; otherwise
 * redirects back to the product page.
 */
export default function ProductCheckAnswers({
  productId,
  defaults,
}: {
  productId: string
  defaults: Record<string, string>
}) {
  const router = useRouter()
  const product = findManagedProduct(productId)!
  const productHref = managedProductHref(productId)
  const { hydrated, getRecord, submitForReview } = useSupplierPortal()
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const record = getRecord('products', productId)
  const status = hydrated ? managedProductStatus(product, record) : undefined
  const canSubmit = status === 'draft_changes' || status === 'action_needed'
  const draft = record.draft ?? {}
  const baseline = (key: string) => record.values?.[key] ?? defaults[key] ?? ''
  const value = (key: string) => draft[key] ?? baseline(key)
  const isChanged = (fieldId: string) => fieldId in draft && draft[fieldId] !== baseline(fieldId)

  const changedContent = PRODUCT_CONTENT_FIELDS.filter((f) => isChanged(f.id))
  const changedDocuments = PRODUCT_DOCUMENT_FIELDS.filter((f) => isChanged(f.id))

  useEffect(() => {
    if (hydrated && !canSubmit && !submitting) router.replace(productHref)
  }, [hydrated, canSubmit, submitting, router, productHref])

  useEffect(() => {
    if (hydrated && canSubmit) {
      window.scrollTo(0, 0)
      headingRef.current?.focus()
    }
  }, [hydrated, canSubmit])

  if (!hydrated || !canSubmit) return null

  function confirmAndSubmit() {
    if (submitting) return
    setSubmitting(true)
    submitForReview('products', productId)
    router.push(managedProductConfirmationHref(productId))
  }

  return (
    <div className="hs-page">
      <div className="max-w-3xl">
        <BackLink href={productHref} />
        <span className="nhsuk-caption-l">{product.name}</span>
        <h1 ref={headingRef} tabIndex={-1} className="page-title-h1 outline-none">
          Check your answers before submitting
        </h1>

        {changedContent.length > 0 && (
          <>
            <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">Product information</h2>
            <dl className="nhsuk-summary-list">
              {changedContent.map((field) => {
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
                      <Link
                        className="hs-link-button"
                        href={managedProductFieldHref(productId, field.id, { returnTo: 'check-answers' })}
                      >
                        Change<span className="nhsuk-u-visually-hidden"> {field.label.toLowerCase()}</span>
                      </Link>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </>
        )}

        {changedDocuments.length > 0 && (
          <>
            <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">Documents</h2>
            <dl className="nhsuk-summary-list">
              {changedDocuments.map((field) => {
                const fileName = value(field.id)
                const uploadedOn = value(`${field.id}${UPLOADED_ON_SUFFIX}`)
                return (
                  <div key={field.id} className="nhsuk-summary-list__row">
                    <dt className="nhsuk-summary-list__key">{field.label}</dt>
                    <dd className="nhsuk-summary-list__value">
                      {fileName ? (
                        <>
                          {fileName}
                          <br />
                          <span className="nhsuk-u-secondary-text-color nhsuk-body-s">
                            Uploaded {formatPortalDate(uploadedOn)}
                          </span>
                        </>
                      ) : (
                        <span className="nhsuk-u-secondary-text-color">{NOT_PROVIDED}</span>
                      )}
                    </dd>
                    <dd className="nhsuk-summary-list__actions">
                      <Link
                        className="hs-link-button"
                        href={managedProductFieldHref(productId, field.id, { returnTo: 'check-answers' })}
                      >
                        {fileName ? 'Replace' : 'Upload'}
                        <span className="nhsuk-u-visually-hidden"> {field.label}</span>
                      </Link>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </>
        )}

        <h2 className="nhsuk-heading-m nhsuk-u-margin-top-7">Submit your changes</h2>
        <p className="nhsuk-body-m">{DECLARATION}</p>
        <Button variant="confirm" onClick={confirmAndSubmit} loading={submitting}>
          {submitting ? 'Submitting…' : 'Confirm and submit'}
        </Button>
      </div>
    </div>
  )
}
