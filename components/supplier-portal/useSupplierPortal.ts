'use client'

import { useCallback, useEffect, useState } from 'react'
import { clearOnboardingProgress } from '@/components/supplier-onboard/useOnboardingProgress'
import { companySectionKeys } from '@/lib/supplierCompany'
import {
  PRODUCT_CONTENT_FIELDS,
  PRODUCT_DOCUMENT_FIELDS,
  PRODUCT_PAGE_FIELDS,
  SUPPLIER_PAGE_FIELDS,
  type ActionNeededReason,
  type ManagedProductStatus,
  type PublishedPageStatus,
} from '@/lib/supplierPortal'

/**
 * Supplier portal state: sign-in, plus draft and submitted edits to onboarded
 * products and Commissioning Store pages.
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
  /** ISO timestamp of the last submission or approval (pages: also the last save). */
  lastUpdated?: string
  /** Pages only: approved at least once, so edits leave a live version behind. */
  hasBeenPublished?: boolean
  /** Field ids included in the submission currently in review. */
  submittedFieldIds?: string[]
  /** Field ids a rejected review asked the supplier to change. */
  actionNeededFields?: string[]
  /** Why those fields need attention. */
  actionNeededReason?: ActionNeededReason
}

/**
 * Company information answers. Each chapter is submitted on its own and
 * applies straight away (no review): `values` is the current version, `draft`
 * holds saved-but-unsubmitted edits.
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

/** Stored page records from before Unpublished / Unpublished changes used a `draft` status. */
function normalisePages(pages: Record<string, EditRecord> | undefined): Record<string, EditRecord> {
  const out: Record<string, EditRecord> = {}
  for (const [id, rec] of Object.entries(pages ?? {})) {
    out[id] = (rec.status as string) === 'draft' ? { ...rec, status: 'unpublished_changes', hasBeenPublished: true } : rec
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
      products: parsed.products ?? {},
      pages: normalisePages(parsed.pages),
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

const APPROVED_STATUS = { products: 'up_to_date', pages: 'published' } as const

const PRODUCT_FIELD_IDS = new Set([
  ...PRODUCT_CONTENT_FIELDS.map((field) => field.id),
  ...PRODUCT_DOCUMENT_FIELDS.map((field) => field.id),
])

const PAGE_FIELD_IDS = new Set([
  ...PRODUCT_PAGE_FIELDS.map((field) => field.id),
  ...SUPPLIER_PAGE_FIELDS.map((field) => field.id),
])

/** Field ids in a saved change set for products or pages. */
function submittedFieldIdsFor(kind: EditKind, changes: Record<string, string>): string[] {
  const known = kind === 'products' ? PRODUCT_FIELD_IDS : PAGE_FIELD_IDS
  return Object.keys(changes).filter((key) => known.has(key))
}

function needsAction(rec: EditRecord): boolean {
  return rec.status === 'action_needed' || (rec.actionNeededFields?.length ?? 0) > 0
}

/**
 * Status after saving without submitting. Products become Draft changes, unless
 * the back office has already asked for action — that stays the primary status
 * (Draft changes is then shown as a second tag). Pages keep Action needed the
 * same way; otherwise Unpublished or Unpublished changes.
 */
function savedStatus(kind: EditKind, rec: EditRecord): ManagedProductStatus | PublishedPageStatus {
  if (needsAction(rec)) return 'action_needed'
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
            // Pages show "Last updated" from their first save; products only from a submission.
            ...(kind === 'pages' ? { lastUpdated: new Date().toISOString() } : {}),
          },
        },
      }
    })
  }, [])

  /** Promote the draft (plus any final changes) to the current version and send for review. */
  const submitForReview = useCallback((kind: EditKind, id: string, changes: Record<string, string> = {}) => {
    write((s) => {
      const rec = s[kind][id] ?? {}
      const submitted = { ...(rec.draft ?? {}), ...changes }
      return {
        ...s,
        [kind]: {
          ...s[kind],
          [id]: {
            values: { ...(rec.values ?? {}), ...submitted },
            status: 'in_review',
            lastUpdated: new Date().toISOString(),
            hasBeenPublished: rec.hasBeenPublished,
            // Remember which fields this submission contained, so a rejection
            // can mark those and no earlier ones.
            submittedFieldIds: submittedFieldIdsFor(kind, submitted),
          },
        },
      }
    })
  }, [])

  /** Prototype shortcut standing in for the back office review. */
  const simulateApproval = useCallback((kind: EditKind, id: string) => {
    write((s) => {
      const rest: EditRecord = { ...(s[kind][id] ?? {}) }
      delete rest.actionNeededFields
      delete rest.actionNeededReason
      delete rest.submittedFieldIds
      return {
        ...s,
        [kind]: {
          ...s[kind],
          [id]: {
            ...rest,
            status: APPROVED_STATUS[kind],
            lastUpdated: new Date().toISOString(),
            ...(kind === 'pages' ? { hasBeenPublished: true } : {}),
          },
        },
      }
    })
  }, [])

  /** Prototype shortcut: review rejected — supplier must change something and resubmit. */
  const simulateRejection = useCallback((kind: EditKind, id: string) => {
    write((s) => {
      const rec = s[kind][id] ?? {}
      const { submittedFieldIds, ...rest } = rec
      return {
        ...s,
        [kind]: {
          ...s[kind],
          [id]: {
            ...rest,
            // Put submitted values back into the draft so the supplier can edit and resubmit.
            draft: { ...(rec.values ?? {}), ...(rec.draft ?? {}) },
            status: 'action_needed',
            lastUpdated: new Date().toISOString(),
            hasBeenPublished: rec.hasBeenPublished,
            actionNeededFields: submittedFieldIds ?? rec.actionNeededFields ?? [],
            actionNeededReason: 'review_rejection' as const,
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

  /**
   * Make one chapter's draft its current version. Applies immediately — there
   * is no review step. Drafts for other chapters are left as they are.
   */
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
    submitForReview,
    simulateApproval,
    simulateRejection,
    company,
    saveCompanyDraft,
    discardCompanyDraft,
    submitCompanySection,
  }
}
