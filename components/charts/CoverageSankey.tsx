'use client'

export interface SankeyStage {
  label: string
  value: number
  dropLabel?: string
}

interface Props {
  stages: SankeyStage[]
  ariaLabel: string
}

export default function CoverageSankey({ stages, ariaLabel }: Props) {
  if (stages.length < 2) return null

  const maxValue = stages[0].value || 1
  const viewW = 720
  const viewH = 260
  const barW = 80
  const gapX = (viewW - barW * stages.length) / (stages.length - 1)
  const maxBarH = 180
  const topMargin = 40

  return (
    <div>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', maxWidth: 720, height: 'auto', display: 'block' }}
      >
        {stages.map((stage, i) => {
          const barH = Math.max(12, (stage.value / maxValue) * maxBarH)
          const x = i * (barW + gapX)
          const y = topMargin + (maxBarH - barH)

          const nextStage = stages[i + 1]
          const fill = i === stages.length - 1 ? '#007f3b' : '#005eb8'

          return (
            <g key={i}>
              {/* Bar */}
              <rect x={x} y={y} width={barW} height={barH} fill={fill} rx={4} opacity={0.85} />

              {/* Value label above bar */}
              <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize={16} fontWeight={700} fill="#212b32">
                {stage.value.toLocaleString()}
              </text>

              {/* Label below */}
              <text x={x + barW / 2} y={topMargin + maxBarH + 24} textAnchor="middle" fontSize={14} fill="#4c6272">
                {stage.label}
              </text>

              {/* Flow connector to next stage */}
              {nextStage && (() => {
                const nextBarH = Math.max(12, (nextStage.value / maxValue) * maxBarH)
                const nextX = (i + 1) * (barW + gapX)
                const nextY = topMargin + (maxBarH - nextBarH)
                const startX = x + barW
                const endX = nextX
                const midX = (startX + endX) / 2

                const pathTop = `M ${startX} ${y} C ${midX} ${y}, ${midX} ${nextY}, ${endX} ${nextY}`
                const pathBot = `M ${startX} ${y + barH} C ${midX} ${y + barH}, ${midX} ${nextY + nextBarH}, ${endX} ${nextY + nextBarH}`

                const dropOff = stage.value - nextStage.value
                const dropPct = maxValue > 0 ? Math.round((dropOff / stage.value) * 100) : 0
                const dropLabel = stage.dropLabel ?? `${dropOff.toLocaleString()} lost (${dropPct}%)`
                const labelY = Math.max(y, nextY) + Math.max(barH, nextBarH) / 2 - 8

                return (
                  <g>
                    <path d={`${pathTop} L ${endX} ${nextY + nextBarH} C ${midX} ${nextY + nextBarH}, ${midX} ${y + barH}, ${startX} ${y + barH} Z`}
                      fill="#005eb8" opacity={0.12} />
                    <text x={midX} y={labelY} textAnchor="middle" fontSize={14} fill="#d5281b" fontWeight={600}>
                      {dropLabel}
                    </text>
                  </g>
                )
              })()}
            </g>
          )
        })}
      </svg>

      {/* Accessible table fallback */}
      <details className="hs-text-label" style={{ marginTop: 8 }}>
        <summary style={{ cursor: 'pointer', color: '#005eb8' }}>View as table</summary>
        <table className="hs-table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Count</th>
              <th>% of eligible</th>
              <th>Drop-off from previous</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, i) => {
              const prev = i > 0 ? stages[i - 1].value : stage.value
              const drop = i > 0 ? prev - stage.value : 0
              return (
                <tr key={i}>
                  <td>{stage.label}</td>
                  <td>{stage.value.toLocaleString()}</td>
                  <td>{maxValue > 0 ? Math.round((stage.value / maxValue) * 100) : 0}%</td>
                  <td>{i > 0 ? `${drop.toLocaleString()} (${Math.round((drop / prev) * 100)}%)` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </details>
    </div>
  )
}
