'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * NHS File upload. [Provenance: NHS]
 * https://service-manual.nhs.uk/design-system/components/file-upload
 *
 * The component ships in NHS.UK frontend 10.6.1; the app compiles v9, so the
 * v10 package is installed under the `nhsuk-frontend-v10` alias and only this
 * component's CSS is compiled (app/styles/_src/nhsuk-v10-gaps.scss) and its JS
 * loaded here.
 *
 * Markup matches the official example (`nhsuk-form-group nhsuk-file-upload`
 * root with `data-module`, label as page heading, hint, native
 * `nhsuk-file-upload__input`). The drop zone is pre-rendered — the official JS
 * reuses it ("unless already in the HTML") rather than re-parenting the input,
 * which keeps every node React owns exactly where React put it. The JS then
 * hides the native input and adds the "Choose file / or drop file" button and
 * live status inside the drop zone (progressive enhancement: without JS users
 * get the native browser control).
 */
export function NhsFileUpload({
  id,
  label,
  hint,
  afterHint,
  error,
  labelAsPageHeading = false,
  labelSize,
  describedBy,
  multiple = false,
  onFileChange,
  onFilesChange,
  className = '',
}: {
  id: string
  label: ReactNode
  /** Hint content; rendered in `.nhsuk-hint` with id `${id}-hint`. */
  hint?: ReactNode
  /** Rendered after the hint and before the file control, outside the hint style. */
  afterHint?: ReactNode
  /** NHS error message (`.nhsuk-error-message`, form group gets `--error`). */
  error?: ReactNode
  /** Render the label inside an `<h1>` (one-question-per-page). Implies size "l". */
  labelAsPageHeading?: boolean
  /** Label size modifier (`nhsuk-label--s|m|l|xl`). */
  labelSize?: 's' | 'm' | 'l' | 'xl'
  /** Extra ids for aria-describedby (hint and error ids are added automatically). */
  describedBy?: string
  /** Allow several files in one selection. */
  multiple?: boolean
  /** Called with the selected file (or null when cleared). */
  onFileChange: (file: File | null) => void
  /** When `multiple` is set, called with every file in the selection. */
  onFilesChange?: (files: File[]) => void
  className?: string
}) {
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const onFileChangeRef = useRef(onFileChange)
  const onFilesChangeRef = useRef(onFilesChange)
  onFileChangeRef.current = onFileChange
  onFilesChangeRef.current = onFilesChange
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const ariaDescribedBy = [hintId, errorId, describedBy].filter(Boolean).join(' ') || undefined
  const size = labelSize ?? (labelAsPageHeading ? 'l' : undefined)

  // The NHS script copies aria-describedby onto its generated button once, at init.
  // Errors appear later, so mirror changes onto the button ourselves.
  useEffect(() => {
    const $button = dropZoneRef.current?.querySelector<HTMLButtonElement>('.nhsuk-file-upload__drop-button')
    if (!$button) return
    if (ariaDescribedBy) $button.setAttribute('aria-describedby', ariaDescribedBy)
    else $button.removeAttribute('aria-describedby')
  }, [ariaDescribedBy])

  // Listen on the input itself. A dropped file makes the NHS component set
  // `input.files` and dispatch a non-bubbling change event, which React's
  // onChange (delegated on the root) never hears.
  useEffect(() => {
    const input = dropZoneRef.current?.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) return
    const handle = () => {
      const files = Array.from(input.files ?? [])
      if (multiple) onFilesChangeRef.current?.(files)
      else onFileChangeRef.current(files[0] ?? null)
    }
    input.addEventListener('change', handle)
    return () => input.removeEventListener('change', handle)
  }, [multiple])

  useEffect(() => {
    const $root = dropZoneRef.current
    if (!$root || $root.hasAttribute('data-nhsuk-file-upload-init')) return
    // NHS.UK frontend gates all components on this body class (set by NhsFrontendInit;
    // repeated here because effect order between siblings is not guaranteed).
    document.body.classList.add('nhsuk-frontend-supported')
    let cancelled = false
    void import('nhsuk-frontend-v10/dist/nhsuk/components/file-upload/file-upload.mjs').then(({ FileUpload }) => {
      if (cancelled || $root.hasAttribute('data-nhsuk-file-upload-init')) return
      new FileUpload($root)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const labelEl = (
    <label className={`nhsuk-label${size ? ` nhsuk-label--${size}` : ''}`} htmlFor={id}>
      {label}
    </label>
  )

  return (
    <div
      className={`nhsuk-form-group nhsuk-file-upload${error ? ' nhsuk-form-group--error' : ''}${className ? ` ${className}` : ''}`}
    >
      {labelAsPageHeading ? <h1 className="nhsuk-label-wrapper">{labelEl}</h1> : labelEl}
      {hint ? (
        <div className="nhsuk-hint" id={hintId}>
          {hint}
        </div>
      ) : null}
      {afterHint}
      {error ? (
        <span className="nhsuk-error-message" id={errorId} role="alert">
          <span className="nhsuk-u-visually-hidden">Error:</span> {error}
        </span>
      ) : null}
      <div ref={dropZoneRef} className="nhsuk-file-upload nhsuk-file-upload__drop-zone" data-module="nhsuk-file-upload">
        <input
          className="nhsuk-file-upload__input"
          id={id}
          name={id}
          type="file"
          multiple={multiple || undefined}
          aria-describedby={ariaDescribedBy}
        />
      </div>
    </div>
  )
}

export default NhsFileUpload
