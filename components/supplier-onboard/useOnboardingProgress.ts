'use client'

import { useCallback, useEffect, useState } from 'react'
import { ALL_TASKS, STORAGE_KEY_PREFIX, storageKey, type TaskAnswers } from '@/lib/supplierOnboarding'
import { fillAllWithSamples } from '@/lib/supplierOnboardingSampleAnswers'

/**
 * Per-task answers and completion state for one product's onboarding form.
 *
 * Client-side prototype: each form is mirrored to its own localStorage entry so
 * saved answers and the Completed / Incomplete statuses survive navigation and
 * refresh, and forms for different products never share answers. State is
 * restored after mount (not in the initializer) so SSR and first client render
 * agree — every task renders as Incomplete until `hydrated` is true. Swap for a
 * server-backed store (Neon, as the EOI submissions use) when this holds real
 * supplier data.
 */
export type OnboardingSubmission = { reference: string; submittedAt: string }

export type OnboardingProgress = {
  /** taskId -> true once the task has been saved with every question answered. */
  complete: Record<string, boolean>
  /** taskId -> questionId -> answer. */
  answers: Record<string, TaskAnswers>
  /** Set once "Confirm and submit" has been pressed on Check your answers. */
  submission?: OnboardingSubmission
  /** ISO timestamp of the last save (shown as "Last saved" on the onboarding list). */
  updatedAt?: string
}

const EMPTY: OnboardingProgress = { complete: {}, answers: {} }
const NO_ANSWERS: TaskAnswers = {}

/** Fired on `window` after storage is wiped so every mounted hook resets in place. */
export const ONBOARDING_CLEARED_EVENT = 'hs-supplier-portal:onboarding-cleared'

/** Pre-portal single-form key; removed by Clear data. */
const LEGACY_STORAGE_KEY = 'hs-supplier-onboard:tasks'

/** Wipe saved answers and statuses for every onboarding form (footer "Clear data"). */
export function clearOnboardingProgress() {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) keys.push(key)
    }
    keys.forEach((k) => localStorage.removeItem(k))
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // Storage unavailable — in-memory state is still reset via the event.
  }
  window.dispatchEvent(new Event(ONBOARDING_CLEARED_EVENT))
}

/** Read one form's saved progress (client only). */
export function readOnboardingProgress(formId: string): OnboardingProgress {
  try {
    const raw = localStorage.getItem(storageKey(formId))
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY
    if (parsed.complete && parsed.answers) return parsed as OnboardingProgress
    return EMPTY
  } catch {
    return EMPTY
  }
}

export function useOnboardingProgress(formId: string) {
  const [progress, setProgress] = useState<OnboardingProgress>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProgress(readOnboardingProgress(formId))
    setHydrated(true)
  }, [formId])

  useEffect(() => {
    const onCleared = () => setProgress(EMPTY)
    window.addEventListener(ONBOARDING_CLEARED_EVENT, onCleared)
    return () => window.removeEventListener(ONBOARDING_CLEARED_EVENT, onCleared)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      if (progress === EMPTY) localStorage.removeItem(storageKey(formId))
      else localStorage.setItem(storageKey(formId), JSON.stringify(progress))
    } catch {
      // Storage full/unavailable — state still works in memory.
    }
  }, [hydrated, progress, formId])

  const isComplete = useCallback(
    (taskId: string) => hydrated && progress.complete[taskId] === true,
    [hydrated, progress],
  )

  const getAnswers = useCallback(
    (taskId: string): TaskAnswers => progress.answers[taskId] ?? NO_ANSWERS,
    [progress],
  )

  /** Persist answers for a task (merged over any existing ones) and set its status. */
  const saveTask = useCallback((taskId: string, answers: TaskAnswers, complete: boolean) => {
    setProgress((p) => ({
      ...p,
      complete: { ...p.complete, [taskId]: complete },
      answers: { ...p.answers, [taskId]: { ...(p.answers[taskId] ?? {}), ...answers } },
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /**
   * Prototype shortcut ("Mark all as complete"): fills every unanswered question
   * with representative sample content (real answers are kept) and flags every
   * task Completed, so Check your answers reads like a genuine submission.
   */
  const markAllComplete = useCallback(() => {
    setProgress((p) => ({
      ...p,
      answers: fillAllWithSamples(p.answers),
      complete: Object.fromEntries(ALL_TASKS.map((t) => [t.id, true])),
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  /** True once every task in every section is Completed (gates Submit). */
  const allComplete = hydrated && ALL_TASKS.every((t) => progress.complete[t.id] === true)

  /**
   * Record the submission (prototype: generates a reference locally; a real
   * service would POST the answers and receive one back).
   */
  const completeSubmission = useCallback((): OnboardingSubmission => {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
    const submittedAt = new Date().toISOString()
    const submission: OnboardingSubmission = { reference: `HSO-${suffix}`, submittedAt }
    setProgress((p) => ({ ...p, submission, updatedAt: submittedAt }))
    return submission
  }, [])

  const submission = hydrated ? progress.submission : undefined

  return {
    hydrated,
    isComplete,
    getAnswers,
    saveTask,
    markAllComplete,
    allComplete,
    submission,
    completeSubmission,
  }
}
