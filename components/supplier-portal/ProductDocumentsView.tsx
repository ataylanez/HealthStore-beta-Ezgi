'use client'

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
import { managedProductStatus } from './portalStatus'
import { StatusSummary } from './StatusSummary'
import { useSupplierPortal } from './useSupplierPortal'

const NOT_PROVIDED = 'Not provided'

/**
 * Product documents and content. [Provenance: NHS Summary list + Check answers pattern]
 *
 * Shows only the latest version of each item (the NHS HealthStore keeps earlier
 * versions). Each row has a Change (content) or Replace (document) link to a
 * one-question page; there is deliberately no delete. Changes are held as a
 * draft until "Submit changes", which applies them straight away.
 */
export default function ProductDocumentsView({
  productId,
  defaults,
}: {
  productId: string
  /** Current values (from the catalogue data). */
  defaults: Record<string, string>
}) {
  const router = useRouter()
  const product = findManagedProduct(productId)!
  const { hydrated, getRecord } = useSupplierPortal()

  const record = getRecord('products', productId)
  const status = hydrated ? managedProductStatus(product, record) : undefined
  const value = (key: string) => record.draft?.[key] ?? record.values?.[key] ?? defaults[key] ?? ''

  if (!hydrated || !status) return null

  return (
    <>
      <span className="nhsuk-caption-l">Documents and content</span>
      <h1 className="nhsuk-heading-xl">{product.name}</h1>

      <StatusSummary
        status={status}
        lastUpdated={record.lastUpdated ?? product.lastUpdated}
        draftMessage="You have changes saved as a draft. They will not be used until you submit them."
      />

      <h2 id="product-information" className="nhsuk-heading-m nhsuk-u-margin-top-7">
        Product information
      </h2>
      <dl className="nhsuk-summary-list">
        {PRODUCT_CONTENT_FIELDS.map((field) => {
          const v = value(field.id)
          return (
            <div key={field.id} id={`product-field-${field.id}`} className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">{field.label}</dt>
              <dd className="nhsuk-summary-list__value">
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
        You can replace a document with a newer version. Only the latest version is shown here; the NHS HealthStore
        keeps previous versions.
      </p>
      <dl className="nhsuk-summary-list">
        {PRODUCT_DOCUMENT_FIELDS.map((field) => {
          const fileName = value(field.id)
          const uploadedOn = value(`${field.id}${UPLOADED_ON_SUFFIX}`)
          return (
            <div key={field.id} id={`product-field-${field.id}`} className="nhsuk-summary-list__row">
              <dt className="nhsuk-summary-list__key">{field.label}</dt>
              <dd className="nhsuk-summary-list__value">
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

      {status === 'draft_changes' && (
        <div className="nhsuk-u-margin-top-7">
          <h2 className="nhsuk-heading-m">Submit your changes</h2>
          <p className="nhsuk-body-m">Your changes will be used as soon as you submit them.</p>
          <Button type="button" onClick={() => router.push(managedProductCheckAnswersHref(productId))}>
            Submit changes
          </Button>
        </div>
      )}
    </>
  )
}
