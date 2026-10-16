import { ClickableChevronCard } from '@/components/ui/ClickableChevronCard'

export type PortalCard = { href: string; title: string; description: string }

/** Clickable NHS cards in an NHS card group (one-third columns), as on the catalogue. */
export function PortalCardGrid({ cards }: { cards: PortalCard[] }) {
  return (
    <ul className="nhsuk-grid-row nhsuk-card-group">
      {cards.map((card) => (
        <li key={card.href} className="nhsuk-grid-column-one-third nhsuk-card-group__item">
          <ClickableChevronCard
            variant="primary"
            href={card.href}
            title={card.title}
            description={card.description}
            headingLevel={2}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  )
}
