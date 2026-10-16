import { getDeviceClassExplainer } from '@/lib/deviceClassExplainer'

export function DeviceClassDetails({ deviceClass }: { deviceClass: string }) {
  const explainer = getDeviceClassExplainer(deviceClass)
  if (!explainer) return null

  return (
    <details className="mt-2">
      <summary
        className="cursor-pointer hs-text-label hs-font-normal underline-offset-2 underline hover:no-underline outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--nhs-blue)] focus-visible:ring-offset-2"
        style={{ color: 'var(--nhs-blue)' }}
      >
        {explainer.summary}
      </summary>
      <div
        className="mt-2 hs-text-caption pl-4 border-l-2 leading-relaxed"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        {explainer.body}
      </div>
    </details>
  )
}
