export type InsightVariant = 'default' | 'warn' | 'good'

export default function InsightCallout({
  children,
  variant = 'default',
  title,
}: {
  children: React.ReactNode
  variant?: InsightVariant
  title?: string
}) {
  const styles: Record<InsightVariant, React.CSSProperties> = {
    default: { borderLeftColor: '#005eb8', background: 'transparent' },
    warn: { borderLeftColor: '#ffb81c', background: '#fff9ee' },
    good: { borderLeftColor: '#007f3b', background: '#f0f7f2' },
  }

  return (
    <div
      style={{
        borderLeft: '8px solid',
        padding: 'var(--space-3) var(--space-4)',
        fontSize: 'var(--text-body)',
        lineHeight: 1.5,
        color: '#212b32',
        ...styles[variant],
      }}
    >
      {title ? <strong style={{ display: 'block', marginBottom: 6 }}>{title}</strong> : null}
      {children}
    </div>
  )
}
