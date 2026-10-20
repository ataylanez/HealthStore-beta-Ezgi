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

export function onboardingFormStatus(progress: OnboardingProgress): OnboardingFormStatus {
  return progress.submission ? 'submitted' : 'incomplete'
}

export function managedProductStatus(product: ManagedProduct, record: EditRecord): ManagedProductStatus {
  return (record.status as ManagedProductStatus | undefined) ?? product.status
}

export function publishedPageStatus(record: EditRecord): PublishedPageStatus {
  return (record.status as PublishedPageStatus | undefined) ?? 'unpublished'
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
            status: onboardingFormStatus(progress),
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
