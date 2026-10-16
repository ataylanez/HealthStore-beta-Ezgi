'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ChatMessage from '@/components/ai/ChatMessage'
import ChatInput from '@/components/ai/ChatInput'
import FundingResults from '@/components/ai/FundingResults'
import { type FundingResult } from '@/lib/ai/funding'
import {
  aiAdvisorBlueStripStyle,
  aiAdvisorNavBarClass,
  aiAdvisorStripButtonClass,
} from '@/components/ai/aiAdvisorChrome'
import { BotMessageSquare, PanelRightClose, PoundSterling } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

export type AiAdvisorClientProfile = {
  commissionerName: string
  roleTitle: string
  icbName: string
  region: string
  starterPrompts: { label: string; prompt: string }[]
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  funding?: FundingResult[]
  fundingMeta?: { region: string; selectionLabel: string }
}

type Props = {
  open: boolean
  onClose: () => void
  profile: AiAdvisorClientProfile
}

function AiAdvisorChat({ profile }: { profile: AiAdvisorClientProfile }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [commentary, setCommentary] = useState('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, commentary, scrollToBottom])

  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return

      const userMsg: Message = {
        id: `msg-${++idCounter.current}`,
        role: 'user',
        content,
      }

      const newMessages = [...messages, userMsg]
      setMessages(newMessages)
      setIsLoading(true)
      setCommentary('')
      setError(null)

      const assistantId = `msg-${++idCounter.current}`

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          throw new Error(errData?.error ?? `Request failed (${res.status})`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''
        let assistantText = ''
        let assistantMessageAdded = false

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          let eventType = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              const dataStr = line.slice(6)
              try {
                const data = JSON.parse(dataStr)
                if (eventType === 'text_delta' && data.text) {
                  if (!assistantMessageAdded) {
                    assistantMessageAdded = true
                    setCommentary('')
                    setMessages(prev => [
                      ...prev,
                      { id: assistantId, role: 'assistant', content: '' },
                    ])
                  }
                  assistantText += data.text
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantId ? { ...m, content: assistantText } : m,
                    ),
                  )
                } else if (eventType === 'commentary' && data.text !== undefined) {
                  setCommentary(data.text)
                } else if (eventType === 'funding_results' && Array.isArray(data.results)) {
                  if (!assistantMessageAdded) {
                    assistantMessageAdded = true
                    setCommentary('')
                    setMessages(prev => [
                      ...prev,
                      { id: assistantId, role: 'assistant', content: '' },
                    ])
                  }
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantId
                        ? {
                            ...m,
                            funding: data.results as FundingResult[],
                            fundingMeta: {
                              region: data.region ?? '',
                              selectionLabel: data.selectionLabel ?? '',
                            },
                          }
                        : m,
                    ),
                  )
                } else if (eventType === 'funding_fallback' && typeof data.message === 'string') {
                  setError(data.message)
                } else if (eventType === 'error') {
                  throw new Error(data.message ?? 'Unknown error')
                }
              } catch (e) {
                if (e instanceof Error && e.message !== 'Unknown error') {
                  if (eventType === 'error') throw e
                }
              }
            }
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong'
        setError(msg)
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      } finally {
        setIsLoading(false)
        setCommentary('')
      }
    },
    [messages, isLoading],
  )

  const startFundingConversation = useCallback(() => {
    sendMessage('I want to find NHS funding for deploying a digital therapeutic.')
  }, [sendMessage])

  const isEmpty = messages.length === 0
  const lastAssistantMessageId = [...messages].reverse().find(m => m.role === 'assistant')?.id

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center pt-8 pb-8">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: '#E6F0FB' }}
              >
                <BotMessageSquare
                  className="h-8 w-8"
                  style={{ color: 'var(--nhs-blue)' }}
                />
              </div>
              <h2
                className="mb-1 hs-text-lede hs-font-bold"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'Frutiger, Arial, sans-serif',
                }}
              >
                Hello, {profile.commissionerName}
              </h2>
              <p
                className="mb-1 hs-text-label hs-font-normal"
                style={{ color: 'var(--text-secondary)' }}
              >
                {profile.roleTitle}
              </p>
              <p
                className="mb-6 hs-text-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                {profile.icbName}
                {profile.region ? ` · ${profile.region}` : ''}
              </p>
              <p
                className="mb-8 max-w-md text-center leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                I can help you explore digital health options, model costs for your
                population, find funding, and work through implementation planning.
                Tell me what you&rsquo;re working on.
              </p>
              <div className="grid w-full max-w-lg grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={startFundingConversation}
                  disabled={isLoading}
                  className="group flex w-full items-start gap-2 rounded-xl border px-4 py-4 text-left transition-colors disabled:opacity-40"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text-primary)',
                    fontFamily: 'Frutiger, Arial, sans-serif',
                  }}
                >
                  <PoundSterling
                    className="mt-1 h-4 w-4 flex-shrink-0"
                    style={{ color: 'var(--nhs-blue)' }}
                  />
                  <span>Find NHS funding &amp; deployment routes</span>
                </button>
              </div>
              <p
                className="mt-8 hs-text-caption"
                style={{ color: 'var(--text-muted)' }}
              >
                Data sourced from the NHS HealthStore catalogue. Verify all information with
                suppliers before procurement decisions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(m => (
                <div key={m.id} className="space-y-4">
                  {(m.content || !m.funding) && (
                    <ChatMessage
                      role={m.role}
                      content={m.content}
                      onSuggestClick={sendMessage}
                      suggestionsDisabled={isLoading}
                      showSuggestions={
                        !(isLoading && m.role === 'assistant' && m.id === lastAssistantMessageId)
                      }
                    />
                  )}
                  {m.funding && (
                    <FundingResults
                      results={m.funding}
                      region={m.fundingMeta?.region ?? ''}
                      selectionLabel={m.fundingMeta?.selectionLabel ?? ''}
                      onFollowUp={sendMessage}
                      disabled={isLoading}
                    />
                  )}
                </div>
              ))}
              {error && (
                <div
                  className="rounded-lg border px-4 py-4"
                  style={{
                    borderColor: 'var(--nhs-red)',
                    background: '#FEF2F2',
                    color: 'var(--nhs-red)',
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        {commentary && (
          <div className="px-4">
            <div className="mx-auto flex max-w-3xl items-center gap-2 py-2">
              <span className="ai-thinking-dot" />
              <span
                className="hs-text-caption"
                style={{ color: 'var(--text-muted)', fontFamily: 'Frutiger, Arial, sans-serif' }}
              >
                {commentary}
              </span>
            </div>
          </div>
        )}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}

export default function AiAdvisorPanel({ open, onClose, profile }: Props) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleClose = useCallback(() => {
    setIsFullScreen(false)
    onClose()
  }, [onClose])

  const panelClasses = isFullScreen
    ? 'flex w-full flex-col bg-white'
    : 'flex w-[560px] max-w-full flex-col border-l border-[var(--border)] bg-white'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      variant="drawer"
      ariaLabel="AI Advisor"
      initialFocusRef={closeButtonRef}
      restoreFocus="previous"
      keepMounted
      zIndexClass="z-[60]"
      panelClassName={panelClasses}
    >
      <div className="flex-shrink-0 bg-white">
        <div style={aiAdvisorBlueStripStyle} />
        <div
          className={`${aiAdvisorNavBarClass} border-b`}
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className={`${aiAdvisorStripButtonClass} justify-center border-r md:justify-start`}
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            aria-label="Close AI Advisor"
          >
            <PanelRightClose className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--nhs-blue)' }} />
            <span className="hidden md:inline">AI Advisor</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4">
            <span
              className="truncate hs-text-label hs-font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
            >
              NHS HealthStore AI Advisor
            </span>
            <button
              type="button"
              onClick={() => setIsFullScreen(prev => !prev)}
              className="hidden flex-shrink-0 hs-text-label hs-font-normal transition-colors underline hover:no-underline md:block"
              style={{ color: 'var(--text-secondary)', fontFamily: 'Frutiger, Arial, sans-serif' }}
            >
              {isFullScreen ? 'Exit full screen view' : 'Full screen view'}
            </button>
          </div>
        </div>
      </div>

      <AiAdvisorChat profile={profile} />
    </Modal>
  )
}
