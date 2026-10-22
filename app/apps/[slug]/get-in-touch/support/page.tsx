'use client'

import { Suspense } from 'react'
import SupportStep from '@/components/eoi/journey/steps/SupportStep'

export default function GetInTouchSupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportStep />
    </Suspense>
  )
}
