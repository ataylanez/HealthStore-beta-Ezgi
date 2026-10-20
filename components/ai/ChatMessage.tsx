'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { parseSuggestions } from '@/lib/ai/parseSuggestions'
import SuggestionPromptButton from '@/components/ai/SuggestionPromptButton'

type Props = {
  role: 'user' | 'assistant'
  content: string
  onSuggestClick?: (prompt: string) => void
  showSuggestions?: boolean
  suggestionsDisabled?: boolean
}

const mdComponents: Components = {
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table
        className="w-full border-collapse"
        style={{ borderColor: 'var(--border)' }}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead style={{ background: 'var(--surface)' }} {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-2 text-left nhsuk-body-s nhsuk-u-font-weight-bold border-b"
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="px-4 py-2 border-b"
      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      {...props}
    >
      {children}
    </td>
  ),
  a: ({ children, href, ...props }) => {
    const isExternal = href?.startsWith('http')
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center gap-1 underline decoration-1 underline-offset-2"
        style={{ color: 'var(--nhs-blue)' }}
        {...props}
      >
        {children}
        {isExternal && <> (opens in a new tab)</>}
      </a>
    )
  },
  strong: ({ children, ...props }) => (
    <strong style={{ color: 'var(--text-primary)' }} {...props}>
      {children}
    </strong>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 my-2 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>
      {children}
    </ol>
  ),
  p: ({ children, ...props }) => (
    <p className="my-2 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="hs-text-body hs-font-bold mt-4 mb-1" style={{ color: 'var(--text-primary)' }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="nhsuk-heading-s" {...props}>
      {children}
    </h4>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-3 pl-4 my-2"
      style={{ borderColor: 'var(--nhs-blue)' }}
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr className="my-4" style={{ borderColor: 'var(--border)' }} {...props} />
  ),
}

export default function ChatMessage({
  role,
  content,
  onSuggestClick,
  showSuggestions = true,
  suggestionsDisabled = false,
}: Props) {
  if (!content) return null

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-4 leading-relaxed"
          style={{
            background: 'var(--nhs-blue)',
            color: '#fff',
            fontFamily: 'Frutiger, Arial, sans-serif',
          }}
        >
          {content}
        </div>
      </div>
    )
  }

  const { body, suggestions } = parseSuggestions(content)

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div
          className="rounded-2xl rounded-bl-md border px-4 py-4 leading-relaxed"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'Frutiger, Arial, sans-serif',
          }}
        >
          {body ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {body}
            </ReactMarkdown>
          ) : null}
        </div>
        {showSuggestions && suggestions.length > 0 && onSuggestClick && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {suggestions.map(s => (
              <SuggestionPromptButton
                key={s.label}
                label={s.label}
                disabled={suggestionsDisabled}
                onClick={() => onSuggestClick(s.prompt)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
