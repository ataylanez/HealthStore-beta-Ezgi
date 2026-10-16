# NHS Design System migration — mapping matrix & gap register

Working reference for the migration of HealthStore onto the **NHS Design System**
(`nhsuk-frontend`), filling gaps with **GOV.UK Frontend** recoloured to NHS, and
keeping our React layer for behaviour. This is the Phase 0 deliverable; it is
kept in step with the live code as each phase lands.

- NHS DS: https://service-manual.nhs.uk/design-system (+ live patterns on nhs.uk)
- GOV.UK DS: https://design-system.service.gov.uk (gap-fill, recoloured)
- Installed: `nhsuk-frontend@9.6.4`, `govuk-frontend@6.3.0`, `sass`.

## Provenance labels

Every component/pattern in `public/DS` and in code review carries one label:

| Label | Meaning |
| --- | --- |
| **NHS** | Official `nhsuk-frontend` markup + CSS. NHS owns the visual + a11y contract. |
| **GOV.UK-recoloured** | Official `govuk-frontend` component, brand/link/focus tokens overridden to NHS. Used only where NHS has no equivalent. |
| **Bespoke (no DS equivalent)** | Built in-house to NHS principles (spacing, focus, colour, type). No upstream component exists. Carries a backlog note proposing it to the NHS community. |

## Governance

- **Design lead** owns the mapping matrix and signs off provenance changes.
- **Accessibility specialist** signs off every component against WCAG 2.2 AA + the NHS service standard before a phase is "done".
- **Frontend engineer** keeps `app/styles/_src/*.scss` as the single source of truth; generated CSS is built by `npm run build:ds-css` (runs automatically on `prebuild`).
- **Content designer** owns NHS-style content (sentence case, plain English, "Warning"/"Important" callout voice).
- **User researcher** runs the Phase 7 usability round; findings feed the backlog.
- Changes to a **NHS** component's markup/classes must not diverge from upstream; if we need a variant, it becomes **Bespoke** and is documented as such.

## Foundation decisions (Phase 1)

- **SCSS build**: precompiled. `app/styles/_src/nhsuk-theme.scss` and
  `app/styles/_src/govuk-gaps.scss` compile to committed `*.generated.css`
  artifacts via `npm run build:ds-css`. Chosen over a live Next Sass pipeline so
  the output is deterministic and reviewable, and so Tailwind's PostCSS step only
  ever sees plain CSS.
- **Tailwind preflight reconciliation**: we keep Tailwind preflight (the app relies
  on its generic element resets — buttons, borders, images) and introduce an
  explicit cascade-layer order in `app/globals.css`:
  `theme, base, nhs, components, govuk, utilities`. NHS sits **after** `base` so it
  overrides preflight for links/tables/typography, and **before** `utilities` so
  per-element Tailwind utilities still win. Tailwind is therefore "layout utilities
  only" over an NHS base.
- **Fonts**: NHS `$nhsuk-font` overridden to our self-hosted `"Frutiger"` and
  `$nhsuk-include-font-face: false` (we ship the TTFs in `/public/fonts`). Added a
  weight-600 `@font-face` mapping to `Frutiger-Bold.ttf` so NHS bold (600) renders.
- **GOV.UK recolour**: `$govuk-brand-colour`, link, visited, active and focus
  tokens overridden to NHS blue/dark-pink/purple/yellow in `govuk-gaps.scss`.

## Component mapping matrix (current → target)

| Current (code) | Target | Provenance | Phase |
| --- | --- | --- | --- |
| `ui/Button.tsx` | `.nhsuk-button` (primary/secondary/reverse/warning); `destructive`→warning | NHS | 2 |
| `ui/Button.tsx` `toggle` variant | bespoke toggle (Save / Compare); bordered press shadow matches border (`var(--nhs-blue)`); borderless uses `#AEB7BD` / `--nhs-dark` | Bespoke | 2/4 |
| `ui/Button.tsx` `on-accent` | bespoke on-accent + segmented control | Bespoke | 2/4 |
| `ui/FormField.tsx` + TextInput/Select/Textarea | NHS Input/Select/Textarea/Fieldset/Hint/Label/Error message (+ Error summary) | NHS | 2 |
| `Nav.tsx` (app bar: compare-basket count, AI advisor strip, commissioning-context row, prototype tag, active-state tinting) | **Bespoke** app bar to NHS principles (NHS Header can't express these without regressing features). Footer migrated to NHS Footer. | Bespoke / NHS (footer) | 2 |
| `PageBreadcrumb.tsx` | NHS Breadcrumb + Back link (`components/BackLink.tsx`) | NHS | 2 |
| skip link (`.skip-link` → `.nhsuk-skip-link`) | NHS Skip link | NHS | 2 |
| `Badges.tsx` (badge/pill: DTAC, maturity, evidence, condition, topic) | NHS Tag (`.nhsuk-tag`) colour variants | NHS | 2 |
| Cards (`.hs-surface-card`, `.app-card`, `FundingDirectoryCard`) | NHS Card (incl. clickable + care-card) | NHS | 2 |
| `PdpTabs.tsx` (hand-rolled `.nhsuk-tabs*` in globals) | NHS Tabs (official CSS) | NHS | 3 |
| `Collapsible.tsx` / `CollapsibleSection.tsx` / `ProductPageExpander.tsx` | NHS Details / Expander; long-form → GOV.UK Accordion | NHS / GOV.UK-recoloured | 3 |
| `DeploymentRegisterTable.tsx`, `LiveSitesStructuredList.tsx`, PDP tables | NHS Table (responsive) | NHS | 3 |
| `AppDetailSections` alerts / `AlertBox` usage | NHS Warning callout / Inset text / Care card | NHS | 3 |
| list pagination (apps/browse) | NHS Pagination | NHS | 3 |
| `CookieBanner.tsx` / `CookieConsentRoot.tsx` | GOV.UK Cookie banner recoloured | GOV.UK-recoloured | 5 |
| `PdpSection.tsx`, section headers | NHS typography + section break | NHS | 3/6 |

## Gap register — Bespoke (no NHS or GOV.UK equivalent)

Built to NHS principles, annotated "Bespoke" in `public/DS`, each with a backlog note.

| Component (code) | Why it's a gap | NHS-principles approach |
| --- | --- | --- |
| `ui/Modal.tsx` (+ `ExpressInterestModal`, `ClearDataModal`) | No modal/dialog in NHS or GOV.UK (both prefer a dedicated page) | Native `<dialog>`-style focus trap, NHS focus ring, NHS button row, max-width + NHS spacing |
| `ui/Toast.tsx` | Closest is GOV.UK Notification banner, not an equivalent (toasts are transient) | NHS colour semantics, role=status, NHS focus, no auto-dismiss for errors |
| Compare workspace + `CompareLensControl` segmented "lens" | Product-specific composition; NHS has no segmented control | NHS focus/colour, radio-group semantics, 44px targets |
| Dashboard bento (`DashboardV4`, `WidgetShell`, widgets) | Product-specific composition | NHS Card-based tiles, NHS spacing scale |
| AI advisor drawer (`AiAdvisorPanel`, `ChatInput`, …) | Product-specific | NHS surfaces, focus management, NHS form inputs |
| Loading skeletons | No DS equivalent | NHS grey-4 shimmer, `prefers-reduced-motion` aware, `aria-busy` |
| `HealthIcons.tsx` condition glyphs | Domain SVGs | Decorative `aria-hidden`, NHS sizing |

## Delivery status (iteration 1)

Landed:
- Foundations: `nhsuk-frontend@9.6.4` + `govuk-frontend@6.3.0` + `sass`; precompiled SCSS
  (`app/styles/_src/*` → `*.generated.css` via `npm run build:ds-css`, run on `prebuild`);
  Tailwind preflight reconciled via cascade layers; Frutiger wired; GOV.UK recoloured.
- Components: Button, FormField + inputs, Tag (Badges), Card (FundingDirectoryCard), Breadcrumb,
  Back link, Skip link, Footer, Tabs, Expander/Details, Table, Warning callout/Inset text, Pagination.
- Gap components annotated Bespoke (Modal, Toast, compare lens, skeletons) and aligned to NHS focus/colour.
- Consent: GOV.UK Cookie banner recoloured.
- Docs: provenance label system in `public/DS` (`ds.js`/`ds.css`) + labels on every page; NHS overview + legend.
- Accessibility audit: `docs/NHS_DS_ACCESSIBILITY_AUDIT.md`.

Iterative follow-ups:
- Roll NHS Card / NHS Button markup through the remaining inline card/CTA call sites (catalogue, PDP).
- Embed scoped NHS component CSS into `public/DS` example demos (kept out of the docs chrome for now to avoid restyling the reference site itself).
- Adopt `nhsuk-error-summary` on multi-field forms; wire `Pagination` into list views.
- Consider migrating the bespoke app bar toward NHS Header once its product features have NHS-compatible equivalents.

## Delivery status (iteration 2 — flat/square visual alignment)

Goal: make the product visually read as NHS, matching the flat + square nhsuk-frontend
aesthetic (reference: the HealthStore reporting-service mockup, which loads `nhsuk.min.css`).

Landed (foundation-level, so it flattens the whole app with few edits):
- Radius: `@theme` named radii (`--radius-sm/md/lg/xl/2xl/3xl`) all set to NHS `4px`;
  `--radius-pill` kept for chips/toggles/FABs. Badges/tags squared to `0` to match the NHS Tag.
  Remaining hand-rolled radii in `app/globals.css` flattened to `var(--radius-lg)` (4px).
- Elevation: NHS surfaces are flat. `--shadow-sm`/`--shadow-md` set to `none`; `--shadow-lg`
  retained for true overlays (modals, toasts, popovers). `.app-card`/`.hs-surface-card`
  shadows removed; `.app-card` hover lift replaced with a border-colour change.
- Buttons: kept **NHS blue** for primary CTAs (product decision — NHS ships only a green
  action button). A `@layer components` override recolours the primary `.nhsuk-button` to
  NHS blue with a dark-blue 4px press-shadow, retaining the official NHS button shape,
  focus and behaviour. Secondary (grey), warning (red) and reverse (white) keep NHS defaults.
- Surface sweep: removed inline `shadow-*` from high-traffic content cards (catalogue,
  home, PDP where-live, videos, case studies, auth card, AI panels); overlays keep elevation.
- Typography: now matches the **exact nhsuk-frontend responsive type scale**
  (`core/settings/_typography.scss`). Body weight `300` (Light) → NHS `400` (Regular);
  headings normalised to NHS `600` (renders the Bold TTF). `--text-*` tokens snapped to
  NHS scale points (hero 64, page-title 48, section 36, section-alt 26, card-title 22,
  body 19, small 16) and made **responsive** — mobile sizes in `:root`, tablet/desktop
  step re-declared in a `@media (min-width: 641px)` block (NHS tablet breakpoint). Body
  and headings carry NHS line-heights (body 1.5 → 1.47; headings ~1.12–1.19). Mirrored in
  `public/DS/assets/ds.css` + `public/DS/styles/typography.html`.

### Delivery status (iteration 3 — typography audit)

- Added missing NHS scale tokens: `--text-lede` (24/20) and `--text-caption` (14/12).
- Introduced `.hs-text-*` / `.hs-font-*` utility classes; replaced Tailwind `text-xs`–`text-6xl`
  across 64 component/page files with NHS token utilities.
- Replaced `font-bold`/`font-semibold`/`fontWeight: 700` with NHS `600` (`.hs-font-bold`);
  body/link copy uses `.hs-font-normal` (400).
- Swept hardcoded sizes (11px, 1.125rem, 1.4rem, 1.5rem, 1.75rem) to token utilities.
- Raised compare chrome micro-type (11px/13px) to `--text-caption` (NHS 14 minimum at tablet).
- DS docs site chrome aligned to NHS tokens where possible; monospace meta sizes documented
  as DS-only exceptions in `public/DS/styles/typography.html`.

### Delivery status (iteration 4 — spacing & layout audit)

- Added the **NHS spacing scale** as tokens (`--space-1`…`--space-9` = 4/8/16/24/32/40/48/56/64px)
  plus responsive `--section-gap` / `--section-gap-lg` and `--gutter`, stepping up at the tablet
  breakpoint (768px) like the NHS responsive spacing scale.
- Added layout utilities: `.hs-page` (centred ~1280px canvas, NHS 16→32px gutters),
  `.hs-page-narrow` (48rem reading pages), `.hs-measure` (~66ch), and `.hs-section` /
  `.hs-section-lg` responsive rhythm. Replaced the repeated
  `max-w-7xl mx-auto px-4 sm:px-6 py-10` wrapper across ~15 page files; aligned home/dashboard
  gutters to NHS (`px-4 md:px-8`).
- Swept off-scale Tailwind spacing to nearest NHS points across ~63 files (421 utilities):
  12px→16, 20px→24, 28px→32, fractional 2/6/10/14px→4/8/8/16, `mt-20`(80)→64. Arbitrary
  `[..]` values and `min-h-[44px]` touch targets left intact.
- `Button` SIZE paddings reconciled to NHS steps (8/16/24px) with `min-h` holding the 44px target.
- Page width kept at ~1280px (not NHS 960px) by decision; Tailwind grid/flex layouts retained —
  only gutters/spacing normalised, no swap to `.nhsuk-grid-*`. **Reversed in iteration 5 — see below.**
- Mirrored tokens/utilities in `public/DS/assets/ds.css` + `public/DS/styles/spacing.html`.

### Delivery status (iteration 5 — NHS layout & typography alignment)

Designer-facing audit with before/after screenshots and the prioritised plan lives at
`public/nhs-audit/index.html` (URL `/nhs-audit`, reachable by URL only — not linked from any
navigation) and `public/nhs-audit/NHS-Audit.pdf`.

- **The 1280px decision is reversed.** Every page now uses `.nhsuk-width-container` (960px) and
  `.nhsuk-main-wrapper` (`--s` below breadcrumbs). The 80rem overrides on the header, navigation
  and phase banner were removed so the whole frame follows the NHS container. `.hs-page` is kept
  only as a thin alias of the NHS geometry and has no remaining consumers; `.hs-page-narrow` was
  removed; `.hs-measure` now equals the two-thirds column (613px).
- Reading content, forms, journeys and the supplier portal sit in `nhsuk-grid-row >
  nhsuk-grid-column-two-thirds`; PDP and catalogue use one-third + two-thirds; card rows use
  `nhsuk-card-group` with one-third / one-half columns.
- Headings: `.page-title-h1` → `nhsuk-heading-xl` (with `nhsuk-caption-xl` for PDP supplier);
  PDP section titles `nhsuk-heading-l`, sub-sections `nhsuk-heading-s`; lede `nhsuk-lede-text`
  (22/26, replacing the deprecated 24pt). Custom `.page-title-h1` / `.hs-section-title` rules
  removed.
- Removed all uppercase + letter-spaced labels, weight-500 usage and the unused Frutiger Light
  face; fixed-px chart/pill text raised to NHS body-s; links underlined at rest.
- Home relaid on `nhsuk-hero` + width container; PDP uses `nhsuk-contents-list`, summary lists and
  inset text; catalogue uses a one-third filter column and a stacked `nhsuk-card` list.
- Deferred / needs decision (detailed in the audit): breadcrumb outside `<main>`, `nhsuk-pagination`,
  BackToTop FAB, AI Advisor drawer, compare count badge, GOV.UK-styled `.nhsuk-tag`, compare tables
  at 960px, deletion of unused CSS and `* 2.tsx` duplicates.

Notes:
- Links inherit the NHS underline from the `nhs` cascade layer (Tailwind preflight sits lower).
- `Button` public API is unchanged; `radius`/`pill` props still apply to the bespoke
  ghost/toggle/iconOnly paths only.

## Out of scope / preserved

- `public/DS/Audits/*` history left intact.
- No data-model, routing, or backend changes.
