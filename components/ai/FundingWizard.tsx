'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import {
  REGIONS,
  CONDITIONS,
  APPS,
  SEARCH_MODE,
  getSelectionLabel,
  type Region,
  type SearchMode,
} from '@/lib/ai/funding'

export type FundingWizardSelection = {
  region: Region
  mode: SearchMode
  selection: string
}

type Props = {
  onComplete: (params: FundingWizardSelection) => void
  onCancel: () => void
  disabled?: boolean
}

const optionButtonClass =
  'w-full rounded-xl border px-4 py-4 text-left hs-text-label hs-font-normal transition-colors disabled:opacity-40'

const optionButtonStyle = {
  borderColor: 'var(--border)',
  background: 'var(--card)',
  color: 'var(--text-primary)',
  fontFamily: 'Frutiger, Arial, sans-serif',
} as const

function Chip({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' }) {
  return <span className={`badge ${tone === 'blue' ? 'badge-blue' : 'badge-green'} gap-2 hs-text-caption`}>{children}</span>
}

export default function FundingWizard({ onComplete, onCancel, disabled }: Props) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [region, setRegion] = useState<Region | ''>('')
  const [mode, setMode] = useState<SearchMode | ''>('')
  const [selection, setSelection] = useState('')

  const startOver = useCallback(() => {
    setStep(0)
    setRegion('')
    setMode('')
    setSelection('')
  }, [])

  const confirm = useCallback(() => {
    if (!region || !mode || !selection) return
    onComplete({ region, mode, selection })
  }, [region, mode, selection, onComplete])

  const selectionLabel = mode ? getSelectionLabel(mode, selection) : ''

  return (
    <div className="w-full max-w-lg">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {region && <Chip>{region}</Chip>}
          {mode && (
            <Chip tone="green">{mode === SEARCH_MODE.CONDITION ? 'By condition' : 'By DTx app'}</Chip>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="flex flex-shrink-0 items-center gap-1 hs-text-caption hs-font-normal transition-colors underline hover:no-underline disabled:opacity-40"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
        >
          <X className="h-3.5 w-3.5" />
          Close
        </button>
      </div>

      {/* Step 0: Region */}
      {step === 0 && (
        <div>
          <label
            className="mb-2 block hs-text-label hs-font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
          >
            Which NHS England region are you in?
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REGIONS.map(r => (
              <button
                key={r}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setRegion(r)
                  setStep(1)
                }}
                className={optionButtonClass}
                style={optionButtonStyle}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Search mode */}
      {step === 1 && (
        <div>
          <button
            type="button"
            onClick={() => {
              setStep(0)
              setRegion('')
            }}
            disabled={disabled}
            className="mb-4 flex items-center gap-1 hs-text-caption hs-font-normal transition-colors underline hover:no-underline disabled:opacity-40"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <label
            className="mb-2 block hs-text-label hs-font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
          >
            What do you want to find funding for?
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setMode(SEARCH_MODE.CONDITION)
                setStep(2)
              }}
              className={`${optionButtonClass} flex flex-col gap-1`}
              style={optionButtonStyle}
            >
              <span className="hs-font-bold">By condition</span>
              <span className="hs-text-caption" style={{ color: 'var(--text-secondary)' }}>
                COPD, PR, or Cardiac Rehab
              </span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setMode(SEARCH_MODE.APP)
                setStep(2)
              }}
              className={`${optionButtonClass} flex flex-col gap-1`}
              style={optionButtonStyle}
            >
              <span className="hs-font-bold">By specific DTx app</span>
              <span className="hs-text-caption" style={{ color: 'var(--text-secondary)' }}>
                myCOPD, Luscii, KiActiv, etc.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Selection */}
      {step === 2 && (
        <div>
          <button
            type="button"
            onClick={() => {
              setStep(1)
              setMode('')
              setSelection('')
            }}
            disabled={disabled}
            className="mb-4 flex items-center gap-1 hs-text-caption hs-font-normal transition-colors underline hover:no-underline disabled:opacity-40"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <label
            className="mb-2 block hs-text-label hs-font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
          >
            {mode === SEARCH_MODE.CONDITION ? 'Select a condition' : 'Select a DTx app'}
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(mode === SEARCH_MODE.CONDITION ? CONDITIONS : APPS).map(item => (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelection(item.id)
                  setStep(3)
                }}
                className={`${optionButtonClass} flex flex-col gap-1`}
                style={optionButtonStyle}
              >
                <span>{item.label}</span>
                {'area' in item && item.area && (
                  <span className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>
                    {item.area}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <button
            type="button"
            onClick={() => {
              setStep(2)
              setSelection('')
            }}
            disabled={disabled}
            className="mb-4 flex items-center gap-1 hs-text-caption hs-font-normal transition-colors underline hover:no-underline disabled:opacity-40"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div
            className="mb-4 rounded-xl border px-4 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div
              className="mb-2 hs-text-label hs-font-bold"
              style={{ color: 'var(--text-muted)', fontFamily: 'Frutiger, Arial, sans-serif' }}
            >
              Search parameters
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <div className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>
                  Region
                </div>
                <div className="hs-text-label hs-font-bold" style={{ color: 'var(--text-primary)' }}>
                  {region}
                </div>
              </div>
              <div>
                <div className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>
                  Search type
                </div>
                <div className="hs-text-label hs-font-bold" style={{ color: 'var(--text-primary)' }}>
                  {mode === SEARCH_MODE.CONDITION ? 'Condition' : 'DTx app'}
                </div>
              </div>
              <div>
                <div className="hs-text-caption" style={{ color: 'var(--text-muted)' }}>
                  Target
                </div>
                <div className="hs-text-label hs-font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectionLabel}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={disabled}
              className="rounded-xl px-6 py-2 hs-text-label hs-font-bold text-white transition-all disabled:opacity-40"
              style={{ background: 'var(--nhs-blue)' }}
            >
              Search for funding
            </button>
            <button
              type="button"
              onClick={startOver}
              disabled={disabled}
              className="rounded-xl border px-4 py-2 hs-text-label hs-font-normal transition-all disabled:opacity-40"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card)',
                color: 'var(--text-secondary)',
                fontFamily: 'Frutiger, Arial, sans-serif',
              }}
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
