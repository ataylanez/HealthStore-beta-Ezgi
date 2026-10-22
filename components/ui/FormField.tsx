'use client'

import { forwardRef, useId } from 'react'
import type {
  InputHTMLAttributes,
  Ref,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/**
 * Labelled form field. [Provenance: NHS]
 *
 * Renders the official NHS form-group structure: `.nhsuk-form-group` wrapping a
 * `.nhsuk-label`, optional `.nhsuk-hint`, the control, and a `.nhsuk-error-message`
 * (with visually-hidden "Error:" prefix). Accessibility attributes (`id`,
 * `aria-describedby`, `aria-invalid`, `aria-required`) are wired onto the control
 * via the render prop. Focus styling comes from the NHS focus ring on the control.
 *
 * NHS guidance avoids required asterisks (it marks optional fields instead); we
 * keep `aria-required` for assistive tech but no longer render a red asterisk.
 *
 * `asPageHeading` follows the NHS question-page pattern for a single question:
 * the label is wrapped in the page `<h1 class="nhsuk-label-wrapper">` and styled
 * `nhsuk-label--l`. `headingRef` lets the page focus that heading on load.
 */
type FieldRenderProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
}

export function FormField({
  label,
  hint,
  error,
  required,
  id: idProp,
  className = '',
  asPageHeading = false,
  headingRef,
  children,
}: {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  id?: string
  className?: string
  asPageHeading?: boolean
  headingRef?: Ref<HTMLHeadingElement>
  children: (field: FieldRenderProps) => ReactNode
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`nhsuk-form-group${error ? ' nhsuk-form-group--error' : ''}${className ? ` ${className}` : ''}`}>
      {label && asPageHeading ? (
        <h1 ref={headingRef} tabIndex={-1} className="nhsuk-label-wrapper outline-none">
          <label htmlFor={id} className="nhsuk-label nhsuk-label--l">
            {label}
          </label>
        </h1>
      ) : label ? (
        <label htmlFor={id} className="nhsuk-label">
          {label}
        </label>
      ) : null}
      {hint ? (
        <div id={hintId} className="nhsuk-hint">
          {hint}
        </div>
      ) : null}
      {error ? (
        <span id={errorId} className="nhsuk-error-message" role="alert">
          <span className="nhsuk-u-visually-hidden">Error:</span> {error}
        </span>
      ) : null}
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })}
    </div>
  )
}

const readOnlyStyle = { background: '#f0f4f5' } as const

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className = '', style, readOnly, ...props }, ref) {
    const invalid = props['aria-invalid']
    return (
      <input
        ref={ref}
        readOnly={readOnly}
        className={`nhsuk-input${invalid ? ' nhsuk-input--error' : ''}${readOnly ? ' cursor-default' : ''}${className ? ` ${className}` : ''}`}
        style={readOnly ? { ...readOnlyStyle, ...style } : style}
        aria-readonly={readOnly || undefined}
        {...props}
      />
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', style, children, ...props }, ref) {
    const invalid = props['aria-invalid']
    return (
      <select
        ref={ref}
        className={`nhsuk-select${invalid ? ' nhsuk-select--error' : ''}${className ? ` ${className}` : ''}`}
        style={style}
        {...props}
      >
        {children}
      </select>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', style, readOnly, ...props }, ref) {
    const invalid = props['aria-invalid']
    return (
      <textarea
        ref={ref}
        readOnly={readOnly}
        className={`nhsuk-textarea${invalid ? ' nhsuk-textarea--error' : ''}${className ? ` ${className}` : ''}`}
        style={readOnly ? { ...readOnlyStyle, ...style } : style}
        aria-readonly={readOnly || undefined}
        {...props}
      />
    )
  },
)
