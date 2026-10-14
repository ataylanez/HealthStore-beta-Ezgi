'use client'

import { useEffect, useState } from 'react'
import {
  ONBOARDING_CLEARED_EVENT,
  readOnboardingProgress,
  type OnboardingProgress,
} from '@/components/supplier-onboard/useOnboardingProgress'
import { companyComplete } from '@/lib/supplierCompany'
import {
  ONBOARDING_FORMS,
  UPLOADED_ON_SUFFIX,
  type ManagedProduct,
  type ManagedProductStatus,
  type OnboardingForm,
  type OnboardingFormStatus,
  type PublishedPageStatus,
} from '@/lib/supplierPortal'
import type { CompanyRecord, EditRecord } from './useSupplierPortal'

/**
 * Company information statuses: a chapter still to submit, unsubmitted edits
 * to a submitted chapter, or everything current.
 */
export type CompanyStatus = 'incomplete' | 'draft_changes' | 'up_to_date'

export function companyStatus(record: CompanyRecord): CompanyStatus {
  const values = record.values ?? {}
  if (!companyComplete(values)) return 'incomplete'
  const changed = Object.entries(record.draft ?? {}).some(([key, value]) => value !== (values[key] ?? ''))
  return changed ? 'draft_changes' : 'up_to_date'
}

export function onboardingFormStatus(form: OnboardingForm, progress: OnboardingProgress): OnboardingFormStatus {
  if (progress.submission) return 'submitted'
  if (form.actionNeeded) return 'action_needed'
  return 'incomplete'
}

/** True when the draft has a content or document value that differs from the last submission. */
function hasProductDraftChanges(record: EditRecord): boolean {
  const draft = record.draft ?? {}
  const values = record.values ?? {}
  return Object.entries(draft).some(([key, value]) => {
    if (key.endsWith(UPLOADED_ON_SUFFIX)) return false
    return value !== (values[key] ?? '')
  })
}

function productNeedsAction(product: ManagedProduct, record: EditRecord, status: ManagedProductStatus): boolean {
  if (status === 'action_needed') return true
  if (status !== 'draft_changes') return false
  return Boolean(
    (record.actionNeededFields?.length ?? 0) > 0 ||
      (product.actionNeededFields?.length ?? 0) > 0 ||
      product.actionNeeded,
  )
}

/**
 * All statuses that apply to a managed product, highest priority first.
 * Action needed outranks Draft changes when both apply (review sent back and
 * the supplier has since saved further edits).
 */
export function managedProductStatuses(product: ManagedProduct, record: EditRecord): ManagedProductStatus[] {
  const status = (record.status as ManagedProductStatus | undefined) ?? product.status
  const actionNeeded = productNeedsAction(product, record, status)
  const draftChanges = status === 'draft_changes' || (actionNeeded && hasProductDraftChanges(record))

  if (actionNeeded && draftChanges) return ['action_needed', 'draft_changes']
  if (actionNeeded) return ['action_needed']
  return [status]
}

/** Primary status (first of {@link managedProductStatuses}). */
export function managedProductStatus(product: ManagedProduct, record: EditRecord): ManagedProductStatus {
  return managedProductStatuses(product, record)[0]
}

function hasPageDraftChanges(record: EditRecord): boolean {
  const draft = record.draft ?? {}
  const values = record.values ?? {}
  return Object.entries(draft).some(([key, value]) => value !== (values[key] ?? ''))
}

/**
 * All statuses that apply to a published page, highest priority first.
 * Action needed outranks Unpublished / Unpublished changes when both apply.
 */
export function publishedPageStatuses(record: EditRecord): PublishedPageStatus[] {
  const status = (record.status as PublishedPageStatus | undefined) ?? 'unpublished'
  const actionNeeded =
    status === 'action_needed' ||
    ((status === 'unpublished' || status === 'unpublished_changes') && (record.actionNeededFields?.length ?? 0) > 0)
  const draftSide =
    status === 'unpublished_changes' ||
    status === 'unpublished' ||
    (actionNeeded && hasPageDraftChanges(record))

  if (actionNeeded && draftSide && hasPageDraftChanges(record)) {
    return ['action_needed', record.hasBeenPublished ? 'unpublished_changes' : 'unpublished']
  }
  if (actionNeeded) return ['action_needed']
  return [status]
}

/** Primary status (first of {@link publishedPageStatuses}). */
export function publishedPageStatus(record: EditRecord): PublishedPageStatus {
  return publishedPageStatuses(record)[0]
}

export type OnboardingFormSummary = {
  form: OnboardingForm
  status: OnboardingFormStatus
  /** Last save, else the date the form was started. */
  lastSaved: string
  completedTasks: number
}

/** Status of every onboarding form, read from each form's saved progress. */
export function useOnboardingFormSummaries(): { hydrated: boolean; summaries: OnboardingFormSummary[] } {
  const [summaries, setSummaries] = useState<OnboardingFormSummary[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const load = () =>
      setSummaries(
        ONBOARDING_FORMS.map((form) => {
          const progress = readOnboardingProgress(form.id)
          return {
            form,
            status: onboardingFormStatus(form, progress),
            lastSaved: progress.updatedAt ?? form.startedOn,
            completedTasks: Object.values(progress.complete).filter(Boolean).length,
          }
        }),
      )
    load()
    setHydrated(true)
    window.addEventListener(ONBOARDING_CLEARED_EVENT, load)
    return () => window.removeEventListener(ONBOARDING_CLEARED_EVENT, load)
  }, [])

  return { hydrated, summaries }
}
