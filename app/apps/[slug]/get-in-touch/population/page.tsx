'use client'

import { Suspense } from 'react'
import PopulationStep from '@/components/eoi/journey/steps/PopulationStep'

export default function GetInTouchPopulationPage() {
  return (
    <Suspense fallback={null}>
      <PopulationStep />
    </Suspense>
  )
}
