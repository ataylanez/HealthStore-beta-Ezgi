'use client'

import { Suspense } from 'react'
import WorkflowStep from '@/components/eoi/journey/steps/WorkflowStep'

export default function GetInTouchWorkflowPage() {
  return (
    <Suspense fallback={null}>
      <WorkflowStep />
    </Suspense>
  )
}
