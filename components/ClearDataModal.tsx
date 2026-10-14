'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { X, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useEoi } from '@/components/EoiProvider'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type Dataset = 'eoi'

const DATASET_LABELS: Record<Dataset, string> = {
  eoi: 'EOI record',
}

type Stage = 'idle' | 'confirming' | 'loading' | 'success' | 'error'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ClearDataModal({ open, onClose }: Props) {
  const { refresh: refreshEoi } = useEoi()

  const [stage, setStage] = useState<Stage>('idle')
  const [chosen, setChosen] = useState<Dataset | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (open) return
    setStage('idle')
    setChosen(null)
    setErrorMsg(null)
  }, [open])

  function pickDataset(d: Dataset) {
    setChosen(d)
    setStage('confirming')
  }

  async function handleConfirm() {
    if (!chosen) return
    // R7 UX-07: ignore re-entry while a clear is already in flight (guards rapid double-clicks).
    if (stage === 'loading') return
    setStage('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/express-interest', { method: 'DELETE' })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'The server returned an error. Please try again.')
      }
      await refreshEoi()
      setStage('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStage('error')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      initialFocusRef={closeBtnRef}
      restoreFocus="previous"
      lockDismiss={stage === 'loading'}
      panelClassName="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg"
    >
      <Button
        ref={closeBtnRef}
        variant="ghost"
        iconOnly
        onClick={onClose}
        disabled={stage === 'loading'}
        className="absolute top-4 right-4 text-[var(--text-muted)]"
        aria-label="Close dialog"
      >
        <X className="w-5 h-5" aria-hidden />
      </Button>

      {stage === 'idle' && (
        <>
          <h2
            id={titleId}
            className="hs-font-bold mb-2 pr-8"
            style={{ fontFamily: 'Frutiger, Arial, sans-serif', fontSize: 'var(--text-section-alt)', color: 'var(--nhs-dark)' }}
          >
            Manage organisation data
          </h2>
          <p className="mb-6" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            Select which data to clear for your organisation. This will permanently delete the records for all users in your organisation.
          </p>
          <div className="flex flex-col gap-4">
            {(['eoi'] as Dataset[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => pickDataset(d)}
                className="flex items-center gap-4 w-full rounded-xl border px-4 py-4 hs-text-label hs-font-bold text-left transition-colors hover:bg-[#F0F4F5]"
                style={{ borderColor: 'var(--border)', color: 'var(--nhs-blue)' }}
              >
                <Trash2 className="w-4 h-4 shrink-0" style={{ color: 'var(--nhs-blue)' }} aria-hidden />
                Clear {DATASET_LABELS[d]}
              </button>
            ))}
          </div>
        </>
      )}

      {stage === 'confirming' && chosen && (
        <>
          <h2
            id={titleId}
            className="hs-font-bold mb-2 pr-8"
            style={{ fontFamily: 'Frutiger, Arial, sans-serif', fontSize: 'var(--text-section-alt)', color: 'var(--nhs-dark)' }}
          >
            Clear {DATASET_LABELS[chosen]}?
          </h2>
          <p className="mb-6" style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            This will permanently delete{' '}
            <strong>{DATASET_LABELS[chosen].toLowerCase()}</strong>{' '}
            for your entire organisation. This action cannot be undone.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button variant="destructive" onClick={handleConfirm} className="flex-1">
              Yes, clear data
            </Button>
            <Button variant="ghost" onClick={() => setStage('idle')} className="flex-1 border border-[var(--border)] text-[var(--text-secondary)]">
              Cancel
            </Button>
          </div>
        </>
      )}

      {stage === 'loading' && (
        <div className="text-center py-8">
          <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: 'var(--nhs-blue)' }} aria-hidden />
          <p id={titleId} className="hs-font-bold" style={{ color: 'var(--text-primary)' }}>
            Clearing data…
          </p>
        </div>
      )}

      {stage === 'success' && chosen && (
        <div className="text-center py-8">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: '#E6F5EC' }}
            aria-hidden
          >
            <CheckCircle className="w-8 h-8" style={{ color: 'var(--nhs-green, #007f3b)' }} />
          </div>
          <h2
            id={titleId}
            className="hs-font-bold mb-2"
            style={{ fontFamily: 'Frutiger, Arial, sans-serif', fontSize: 'var(--text-section-alt)', color: 'var(--nhs-dark)' }}
          >
            Data cleared
          </h2>
          <p className="mb-6" style={{ fontSize: 'var(--text-body)', color: 'var(--text-muted)' }}>
            {DATASET_LABELS[chosen]} has been permanently deleted for your organisation.
          </p>
          <Button onClick={onClose} className="px-6">
            Done
          </Button>
        </div>
      )}

      {stage === 'error' && (
        <>
          <div className="flex items-start gap-4 mb-6">
            <AlertCircle className="w-6 h-6 shrink-0 mt-1" style={{ color: 'var(--nhs-red, #d5281b)' }} aria-hidden />
            <div>
              <h2
                id={titleId}
                className="hs-font-bold mb-1"
                style={{ fontFamily: 'Frutiger, Arial, sans-serif', fontSize: 'var(--text-section-alt)', color: 'var(--nhs-dark)' }}
              >
                Could not clear data
              </h2>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                {errorMsg}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={handleConfirm} className="flex-1">
              Try again
            </Button>
            <Button variant="ghost" onClick={onClose} className="flex-1 border border-[var(--border)] text-[var(--text-secondary)]">
              Close
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
