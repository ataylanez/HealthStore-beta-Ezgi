'use client'

import { Suspense } from 'react'
import TimelineStep from '@/components/eoi/journey/steps/TimelineStep'

export default function GetInTouchTimelinePage() {
  return (
    <Suspense fallback={null}>
      <TimelineStep />
    </Suspense>
  )
}
