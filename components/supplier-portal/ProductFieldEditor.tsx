'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackLink } from '@/components/BackLink'
import { ErrorSummary } from '@/components/eoi/journey/shared'
import { NhsFileUpload } from '@/components/nhs/NhsFileUpload'
import { Button } from '@/components/ui/Button'
import { Textarea, TextInput } from '@/components/ui/FormField'
import {
  UPLOADED_ON_SUFFIX,
  findManagedProduct,
  findProductField,
  formatPortalDate,
  managedProductCheckAnswersHref,
  managedProductHref,
} from '@/lib/supplierPortal'
import { useSupplierPortal } from './useSupplierPortal'

const PRODUCT_FIELD_SAMPLES: Record<string, string> = {
  summary:
    'Respira CBT is a clinician-supported digital cognitive behavioural therapy programme for adults with generalised anxiety disorder. Patients complete structured modules between Talking Therapies appointments, with weekly asynchronous therapist review.',
  target_patients:
    'Adults (18+) referred to NHS Talking Therapies with mild to moderate generalised anxiety disorder, and the psychological wellbeing practitioners who supervise them.',
  support_email: 'nhs@aurora-health.example',
}

/**
 * Change one piece of product information, or replace one document.
 * [Provenance: NHS] One thing per page — same layout as the onboarding
 * question pages (question as the page heading, NHS hint, NHS File upload).
 * "Save and exit" keeps the change in the product's draft; nothing is sent
 * until "Confirm and submit" on Check your answers.
 */
export default function ProductFieldEditor(props: {
  productId: string
  fieldId: string
  defaults: Record<string, string>
}) {
  return (
    <Suspense fallback={null}>
      <ProductFieldEditorInner {...props} />
    </Suspense>
  )
}

function ProductFieldEditorInner({
  productId,
  fieldId,
  defaults,
}: {
  productId: string
  fieldId: string
  defaults: Record<string, string>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const product = findManagedProduct(productId)!
  const match = findProductField(fieldId)!
  const backHref =
    searchParams.get('return') === 'check-answers'
      ? managedProductCheckAnswersHref(productId)
      : managedProductHref(productId)
  const { hydrated, getRecord, saveDraft } = useSupplierPortal()

  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sampleFileName, setSampleFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>()

  const record = getRecord('products', productId)
  const current = (key: string) => record.draft?.[key] ?? record.values?.[key] ?? defaults[key] ?? ''

  useEffect(() => {
    if (hydrated && match.kind === 'content') setText(current(fieldId))
    // Prefill once, after stored state has been read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  if (!hydrated) return null

  function save() {
    if (match.kind === 'document') {
      if (!file) {
        setError('Select a file to upload')
        return
      }
      saveDraft('products', productId, {
        [fieldId]: file.name,
        [`${fieldId}${UPLOADED_ON_SUFFIX}`]: new Date().toISOString(),
      })
    } else {
      saveDraft('products', productId, { [fieldId]: text.trim() })
    }
    router.push(backHref)
  }

  const errors = error ? [{ field: match.kind === 'document' ? `${fieldId}-file` : fieldId, message: error }] : []
  const sectionName = match.kind === 'document' ? 'Documents' : 'Product information'

  function fillWithSample() {
    setError(undefined)
    if (match.kind === 'document') {
      const name = `${product.name.replace(/\s+/g, '-')}-${fieldId}-sample.pdf`
      setFile(new File(['sample'], name, { type: 'application/pdf' }))
      setSampleFileName(name)
      return
    }
    setText(PRODUCT_FIELD_SAMPLES[fieldId] ?? `Sample ${match.field.label.toLowerCase()}.`)
  }

  return (
    <div className="nhsuk-width-container nhsuk-main-wrapper">
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
          <BackLink href={backHref} />
          <ErrorSummary errors={errors} />
          <span className="nhsuk-caption-l">{sectionName}</span>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            {match.kind === 'document' ? (
              <>
                <NhsFileUpload
                  id={`${fieldId}-file`}
                  labelAsPageHeading
                  label={match.field.label}
                  hint={
                    current(fieldId)
                      ? `Current version: ${current(fieldId)}, uploaded ${formatPortalDate(current(`${fieldId}${UPLOADED_ON_SUFFIX}`))}. Uploading a new file replaces it.`
                      : undefined
                  }
                  error={error}
                  onFileChange={(f) => {
                    setFile(f)
                    setSampleFileName(null)
                    if (f) setError(undefined)
                  }}
                />
                {sampleFileName && (
                  <p className="nhsuk-body-m">
                    Selected file: <strong>{sampleFileName}</strong>
                  </p>
                )}
              </>
            ) : (
              <div className="nhsuk-form-group">
                <h1 className="nhsuk-label-wrapper">
                  <label className="nhsuk-label nhsuk-label--l" htmlFor={fieldId}>
                    {match.field.label}
                  </label>
                </h1>
                {match.field.hint && (
                  <div className="nhsuk-hint" id={`${fieldId}-hint`}>
                    {match.field.hint}
                  </div>
                )}
                {match.field.type === 'textarea' ? (
                  <Textarea
                    id={fieldId}
                    name={fieldId}
                    rows={5}
                    aria-describedby={match.field.hint ? `${fieldId}-hint` : undefined}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                ) : (
                  <TextInput
                    id={fieldId}
                    name={fieldId}
                    className="nhsuk-input--width-30"
                    aria-describedby={match.field.hint ? `${fieldId}-hint` : undefined}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                )}
              </div>
            )}

            <p className="nhsuk-body-m nhsuk-u-margin-top-4 nhsuk-u-margin-bottom-0">
              <button
                type="button"
                className="nhsuk-link"
                onClick={fillWithSample}
                style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
              >
                Fill with sample
              </button>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button type="submit">Save and exit</Button>
              <Button type="button" variant="secondary" onClick={() => router.push(backHref)}>
                Cancel and exit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
