import { ClickableChevronCard } from '@/components/ui/ClickableChevronCard'

export type PortalCard = { href: string; title: string; description: string }

/** Clickable NHS cards in the same grid as the catalogue condition cards. */
export function PortalCardGrid({ cards }: { cards: PortalCard[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li key={card.href} className="flex min-h-0">
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
