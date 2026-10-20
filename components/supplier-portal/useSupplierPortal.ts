'use client'

import { useCallback, useEffect, useState } from 'react'
import { clearOnboardingProgress } from '@/components/supplier-onboard/useOnboardingProgress'
import { companySectionKeys } from '@/lib/supplierCompany'
import {
  type ManagedProductStatus,
  type PublishedPageStatus,
} from '@/lib/supplierPortal'

/**
 * Supplier portal state: sign-in, plus draft and submitted edits to onboarded
 * products and Commissioning Store pages. Submitting applies the changes
 * straight away (products become Up to date, pages become Published).
 *
 * Client-side prototype, same approach as useOnboardingProgress: mirrored to
 * localStorage and restored after mount so SSR and first render agree. Every
 * write goes straight to storage and fires CHANGED_EVENT, so all mounted hooks
 * (header, sign-in guard, the page itself) re-read and stay in step.
 */

const STORAGE_KEY = 'hs-supplier-portal:state'
const CHANGED_EVENT = 'hs-supplier-portal:changed'

export type EditKind = 'products' | 'pages'

/** Draft and submitted values for one product or page, over its sample defaults. */
export type EditRecord = {
  /** Saved but not yet submitted. */
  draft?: Record<string, string>
  /** Submitted values (shown as the current version). */
  values?: Record<string, string>
  status?: ManagedProductStatus | PublishedPageStatus
  /** ISO timestamp of the last submission (pages: also the last save). */
  lastUpdated?: string
  /** Pages only: published at least once, so edits leave a live version behind. */
  hasBeenPublished?: boolean
  /** ISO timestamp of the last submission; cleared by the next save. Gates the confirmation page. */
  justSubmittedAt?: string
}

/**
 * Company information answers. Each chapter is submitted on its own and
 * applies straight away: `values` is the current version, `draft` holds
 * saved-but-unsubmitted edits.
 */
export type CompanyRecord = {
  draft?: Record<string, string>
  values?: Record<string, string>
  /** ISO timestamp of the last submission (any chapter). */
  lastUpdated?: string
}

type PortalState = {
  signedIn?: { email: string; at: string }
  products: Record<string, EditRecord>
  pages: Record<string, EditRecord>
  company?: CompanyRecord
}

const EMPTY: PortalState = { products: {}, pages: {} }
const NO_RECORD: EditRecord = {}
const NO_COMPANY: CompanyRecord = {}

/**
 * Bring records saved by earlier prototype versions in line with the current
 * statuses: the old page `draft` status, and review statuses (in review,
 * action needed), which now resolve as accepted or as unsubmitted changes.
 */
function normaliseRecords(kind: EditKind, records: Record<string, EditRecord> | undefined): Record<string, EditRecord> {
  const out: Record<string, EditRecord> = {}
  for (const [id, stored] of Object.entries(records ?? {})) {
    const rec: EditRecord = { ...stored }
    for (const legacy of ['submittedFieldIds', 'actionNeededFields', 'actionNeededReason']) {
      delete (rec as Record<string, unknown>)[legacy]
    }
    const status = rec.status as string | undefined
    if (kind === 'pages' && status === 'draft') {
      out[id] = { ...rec, status: 'unpublished_changes', hasBeenPublished: true }
    } else if (status === 'in_review') {
      out[id] = { ...rec, status: ACCEPTED_STATUS[kind], ...(kind === 'pages' ? { hasBeenPublished: true } : {}) }
    } else if (status === 'action_needed') {
      out[id] = { ...rec, status: savedStatus(kind, rec) }
    } else {
      out[id] = rec
    }
  }
  return out
}

function read(): PortalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY
    return {
      products: normaliseRecords('products', parsed.products),
      pages: normaliseRecords('pages', parsed.pages),
      signedIn: parsed.signedIn,
      company: parsed.company,
    }
  } catch {
    return EMPTY
  }
}

function write(update: (s: PortalState) => PortalState) {
  const next = update(read())
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable — prototype state is lost on reload.
  }
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

/** Footer "Clear data": sign out and wipe every portal edit and onboarding form. */
export function clearSupplierPortal() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore — the event below still resets mounted hooks.
  }
  clearOnboardingProgress()
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

/** Status once a submission is accepted. */
const ACCEPTED_STATUS = { products: 'up_to_date', pages: 'published' } as const

/** Status after saving without submitting: Draft changes, or Unpublished / Unpublished changes for pages. */
function savedStatus(kind: EditKind, rec: EditRecord): ManagedProductStatus | PublishedPageStatus {
  if (kind === 'products') return 'draft_changes'
  return rec.hasBeenPublished || rec.status === 'published' ? 'unpublished_changes' : 'unpublished'
}

export function useSupplierPortal() {
  const [state, setState] = useState<PortalState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const sync = () => setState(read())
    sync()
    setHydrated(true)
    window.addEventListener(CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const signIn = useCallback((email: string) => {
    write((s) => ({ ...s, signedIn: { email, at: new Date().toISOString() } }))
  }, [])

  const signOut = useCallback(() => {
    write((s) => ({ ...s, signedIn: undefined }))
  }, [])

  const getRecord = useCallback(
    (kind: EditKind, id: string): EditRecord => state[kind][id] ?? NO_RECORD,
    [state],
  )

  /** Merge changes into the draft and mark the item as having draft changes. */
  const saveDraft = useCallback((kind: EditKind, id: string, changes: Record<string, string>) => {
    write((s) => {
      const rec = s[kind][id] ?? {}
      return {
        ...s,
        [kind]: {
          ...s[kind],
          [id]: {
            ...rec,
            draft: { ...(rec.draft ?? {}), ...changes },
            status: savedStatus(kind, rec),
            justSubmittedAt: undefined,
            // Pages show "Last updated" from their first save; products only from a submission.
            ...(kind === 'pages' ? { lastUpdated: new Date().toISOString() } : {}),
          },
        },
      }
    })
  }, [])

  /**
   * Make the draft (plus any final changes) the current version. Accepted
   * immediately: products become Up to date, pages become Published.
   */
  const submitChanges = useCallback((kind: EditKind, id: string, changes: Record<string, string> = {}) => {
    write((s) => {
      const rec = s[kind][id] ?? {}
      const submitted = { ...(rec.draft ?? {}), ...changes }
      const now = new Date().toISOString()
      return {
        ...s,
        [kind]: {
          ...s[kind],
          [id]: {
            values: { ...(rec.values ?? {}), ...submitted },
            status: ACCEPTED_STATUS[kind],
            lastUpdated: now,
            justSubmittedAt: now,
            ...(kind === 'pages' ? { hasBeenPublished: true } : {}),
          },
        },
      }
    })
  }, [])

  /* ------------------------- Company information ------------------------ */

  const company: CompanyRecord = state.company ?? NO_COMPANY

  /** Merge changes into the company draft (nothing is current until submitted). */
  const saveCompanyDraft = useCallback((changes: Record<string, string>) => {
    write((s) => {
      const rec = s.company ?? {}
      return { ...s, company: { ...rec, draft: { ...(rec.draft ?? {}), ...changes } } }
    })
  }, [])

  /** Throw away unsubmitted company edits — for one chapter, or all of them. */
  const discardCompanyDraft = useCallback((sectionId?: string) => {
    write((s) => {
      const rec: CompanyRecord = { ...(s.company ?? {}) }
      if (!sectionId) {
        delete rec.draft
        return { ...s, company: rec }
      }
      const draft = { ...(rec.draft ?? {}) }
      for (const key of companySectionKeys(sectionId)) delete draft[key]
      if (Object.keys(draft).length) rec.draft = draft
      else delete rec.draft
      return { ...s, company: rec }
    })
  }, [])

  /** Make one chapter's draft its current version. Drafts for other chapters are left as they are. */
  const submitCompanySection = useCallback((sectionId: string) => {
    write((s) => {
      const rec = s.company ?? {}
      const draft = { ...(rec.draft ?? {}) }
      const values = { ...(rec.values ?? {}) }
      for (const key of companySectionKeys(sectionId)) {
        if (key in draft) {
          values[key] = draft[key]
          delete draft[key]
        }
      }
      const next: CompanyRecord = { values, lastUpdated: new Date().toISOString() }
      if (Object.keys(draft).length) next.draft = draft
      return { ...s, company: next }
    })
  }, [])

  return {
    hydrated,
    signedIn: hydrated ? state.signedIn : undefined,
    signIn,
    signOut,
    getRecord,
    saveDraft,
    submitChanges,
    company,
    saveCompanyDraft,
    discardCompanyDraft,
    submitCompanySection,
  }
}
