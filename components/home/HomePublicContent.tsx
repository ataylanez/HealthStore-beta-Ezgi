import type { CaseStudy } from '@/lib/conceptHomeTypes'
import type { HomeCampaignItem, HomeNewsItem } from '@/lib/homeContentTypes'
import { type HomeDashSlice } from './HomeFragments'
import { HomeCaseStudiesBand } from './CaseStudies'
import { HomeStorytelling } from './HomeStorytelling'

type HomePublicContentProps = {
  dash: HomeDashSlice
  news: HomeNewsItem[]
  campaigns: HomeCampaignItem[]
  caseStudies: CaseStudy[]
}

/**
 * Everything below the hero sits in one NHS width container + main wrapper
 * (no further full-bleed bands), per the NHS page template.
 */
export default function HomePublicContent({
  dash: _dash,
  news: _news,
  campaigns: _campaigns,
  caseStudies,
}: HomePublicContentProps) {
  return (
    <div className="nhsuk-width-container">
      <div className="nhsuk-main-wrapper">
        <HomeStorytelling />
        <HomeCaseStudiesBand caseStudies={caseStudies} />
      </div>
    </div>
  )
}
