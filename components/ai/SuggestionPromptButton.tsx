'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Props = {
  label: string
  onClick: () => void
  disabled?: boolean
}

export default function SuggestionPromptButton({ label, onClick, disabled }: Props) {
  return (
    <Button
      variant="ghost"
      align="start"
      radius="xl"
      size="none"
      block
      onClick={onClick}
      disabled={disabled}
      className="gap-2 border border-[var(--border)] px-4 py-4 nhsuk-body-m nhsuk-u-margin-bottom-0"
    >
      <Sparkles
        className="mt-1 h-4 w-4 flex-shrink-0"
        style={{ color: 'var(--nhs-blue)' }}
      />
      <span>{label}</span>
    </Button>
  )
}
