/**
 * Supplier portal — routes, sample data and status model.
 *
 * Structure follows the HealthStore Supplier Portal information architecture
 * (Lucidspark "Supplier onboarding" frame). Sections marked "scope TBC" there
 * (Account management, Contact us) are skeleton pages; Company information is
 * the Section A questionnaire (see lib/supplierCompany.ts).
 *
 * Prototype: there is no back office. Sample products and their starting
 * statuses live here; supplier edits are kept in the browser (see
 * components/supplier-portal/useSupplierPortal.ts).
 */

export const PORTAL_NAME = 'Supplier portal'
export const PORTAL_SERVICE_NAME = 'HealthStore Supplier portal'

export const PORTAL_BASE_PATH = '/supplier-portal'

export const PORTAL_PATHS = {
  dashboard: PORTAL_BASE_PATH,
  signIn: `${PORTAL_BASE_PATH}/sign-in`,
  products: `${PORTAL_BASE_PATH}/products`,
  manage: `${PORTAL_BASE_PATH}/products/manage`,
  onboard: `${PORTAL_BASE_PATH}/products/onboard`,
  published: `${PORTAL_BASE_PATH}/published`,
  supplierPage: `${PORTAL_BASE_PATH}/published/supplier`,
  company: `${PORTAL_BASE_PATH}/company`,
  account: `${PORTAL_BASE_PATH}/account`,
  contact: `${PORTAL_BASE_PATH}/contact`,
} as const

export function managedProductHref(productId: string): string {
  return `${PORTAL_PATHS.manage}/${productId}`
}

export function managedProductFieldHref(productId: string, fieldId: string, options?: { returnTo?: 'check-answers' }): string {
  const href = `${managedProductHref(productId)}/${fieldId}`
  return options?.returnTo === 'check-answers' ? `${href}?return=check-answers` : href
}

export function managedProductCheckAnswersHref(productId: string): string {
  return `${managedProductHref(productId)}/check-answers`
}

export function managedProductConfirmationHref(productId: string): string {
  return `${managedProductHref(productId)}/confirmation`
}

export function publishedProductHref(productId: string): string {
  return `${PORTAL_PATHS.published}/products/${productId}`
}

export function publishedProductCheckAnswersHref(productId: string): string {
  return `${publishedProductHref(productId)}/check-answers`
}

export function publishedProductConfirmationHref(productId: string): string {
  return `${publishedProductHref(productId)}/confirmation`
}

export function publishedSupplierCheckAnswersHref(): string {
  return `${PORTAL_PATHS.supplierPage}/check-answers`
}

export function publishedSupplierConfirmationHref(): string {
  return `${PORTAL_PATHS.supplierPage}/confirmation`
}

/** Prototype dummy answers for published page fields (fill shortcut). */
export const PUBLISHED_PAGE_DUMMY_ANSWERS: Record<string, string> = {
  overview:
    'myHeart is a digital therapeutic that supports people with heart failure to self-manage their condition between appointments, including symptom tracking and guided education.',
  why_it_matters:
    'Supports local pathway goals for remote monitoring and reduced unplanned admissions for heart failure patients.',
  contact_name: 'Sam Patel',
  contact_email: 'sam.patel@mymhealth.example',
  about:
    'my mhealth develops evidence-based digital therapeutics for long-term conditions, used by NHS organisations across England to support self-management and remote care.',
  website: 'https://mymhealth.com',
  enquiries_email: 'nhs@mymhealth.example',
}

/** True for every page in the portal, including sign-in. */
export function isSupplierPortalPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return pathname === PORTAL_BASE_PATH || pathname.startsWith(`${PORTAL_BASE_PATH}/`)
}

/**
 * Pages that keep the "no navigation" NHS header: sign-in, onboarding form
 * questions / check answers / confirmation, Manage products check answers /
 * confirmation, Published pages check answers / confirmation, and Company
 * information questions / check answers / confirmation.
 */
export function isPortalFocusedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (pathname === PORTAL_PATHS.signIn) return true
  if (pathname.startsWith(`${PORTAL_PATHS.company}/`)) {
    const segments = pathname.slice(PORTAL_PATHS.company.length + 1).split('/').filter(Boolean)
    return segments[0] === 'questions' || segments[0] === 'check-answers' || segments[0] === 'confirmation'
  }
  if (pathname.startsWith(`${PORTAL_PATHS.onboard}/`)) {
    return pathname.slice(PORTAL_PATHS.onboard.length + 1).split('/').filter(Boolean).length > 1
  }
  if (pathname.startsWith(`${PORTAL_PATHS.manage}/`)) {
    const segments = pathname.slice(PORTAL_PATHS.manage.length + 1).split('/').filter(Boolean)
    return segments.length === 2 && (segments[1] === 'check-answers' || segments[1] === 'confirmation')
  }
  if (pathname.startsWith(`${PORTAL_PATHS.published}/`)) {
    const segments = pathname.slice(PORTAL_PATHS.published.length + 1).split('/').filter(Boolean)
    // products/[id]/check-answers|confirmation or supplier/check-answers|confirmation
    if (segments[0] === 'products' && segments.length === 3) {
      return segments[2] === 'check-answers' || segments[2] === 'confirmation'
    }
    if (segments[0] === 'supplier' && segments.length === 2) {
      return segments[1] === 'check-answers' || segments[1] === 'confirmation'
    }
  }
  return false
}

/* ------------------------------------------------------------------------ */
/* Statuses                                                                  */
/* ------------------------------------------------------------------------ */

/** Onboarding form statuses (working names from the IA). */
export type OnboardingFormStatus = 'incomplete' | 'submitted' | 'action_needed'

/** Onboarded product statuses. The IA marks these TBC — placeholders. */
export type ManagedProductStatus = 'up_to_date' | 'draft_changes' | 'in_review' | 'action_needed'

/**
 * Why a product field needs the supplier's attention. Drives the error summary
 * wording. Expiry is reserved for later document-expiry work.
 */
export type ActionNeededReason = 'review_rejection' | 'expired'

/**
 * Commissioning Store page statuses. A page starts Unpublished; edits saved to a
 * page that has been published become Unpublished changes until submitted.
 * Action needed is set when a review is rejected.
 */
export type PublishedPageStatus =
  | 'published'
  | 'unpublished'
  | 'unpublished_changes'
  | 'in_review'
  | 'action_needed'

export type PortalStatus = OnboardingFormStatus | ManagedProductStatus | PublishedPageStatus

/* ------------------------------------------------------------------------ */
/* Sample supplier                                                           */
/* ------------------------------------------------------------------------ */

export const SAMPLE_SUPPLIER = {
  name: 'my mhealth Limited',
  contactName: 'Brandson Sanderson',
  email: 'sam.patel@mymhealth.example',
  /** Supplier information held from supplier onboarding (read-only on the Supplier page). */
  registeredAddress: 'Unit 4, Bournemouth Business Park, Bournemouth BH8 8EZ',
  companyNumber: '07614236',
  icoRegistration: 'ZA000000',
}

/* ------------------------------------------------------------------------ */
/* Product onboarding                                                        */
/* ------------------------------------------------------------------------ */

export type OnboardingForm = {
  /** URL segment and storage key for this product's form. */
  id: string
  productName: string
  /** ISO date the form was started (shown until the supplier saves something). */
  startedOn: string
  /**
   * Back office outcome on a previous submission. Shows "Action needed" until the
   * supplier submits the form again.
   */
  actionNeeded?: string
}

/** Products awaiting onboarding. */
export const ONBOARDING_FORMS: OnboardingForm[] = [
  { id: 'mycopd', productName: 'myCOPD', startedOn: '2026-09-02' },
]

export function findOnboardingForm(formId: string): OnboardingForm | undefined {
  return ONBOARDING_FORMS.find((f) => f.id === formId)
}

/* ------------------------------------------------------------------------ */
/* Manage products                                                           */
/* ------------------------------------------------------------------------ */

export type ContentField = {
  id: string
  label: string
  hint?: string
  type: 'text' | 'textarea'
}

/** Content shown read-only because it comes from onboarding. */
export type ReadOnlyRow = { label: string; value: string }

export type DocumentField = {
  id: string
  label: string
  hint?: string
}

/** Product information the supplier can update after onboarding. */
export const PRODUCT_CONTENT_FIELDS: ContentField[] = [
  { id: 'summary', label: 'Product summary', hint: 'One or two sentences describing what the product does.', type: 'textarea' },
  { id: 'target_patients', label: 'Who the product is for', type: 'textarea' },
  { id: 'support_email', label: 'Support contact email', hint: 'Where commissioners and patients can get help.', type: 'text' },
]

/** Assurance documents held for an onboarded product (DTAC order). */
export const PRODUCT_DOCUMENT_FIELDS: DocumentField[] = [
  { id: 'paq', label: 'PAQ form' },
  { id: 'dcb0129', label: 'DCB0129 clinical safety case report' },
  { id: 'hazard_log', label: 'DCB0129 hazard log' },
  { id: 'ico', label: 'ICO registration certificate' },
  { id: 'cyber_essentials', label: 'Cyber Essentials certificate' },
  { id: 'pen_test', label: 'Penetration test summary report' },
  { id: 'wcag', label: 'WCAG 2.2 AA audit report' },
  { id: 'dtac', label: 'Completed DTAC form' },
]

export type ManagedProduct = {
  id: string
  /** Catalogue slug in content/apps (source of the starting content). */
  appSlug: string
  name: string
  /** ISO date of the last approved update. */
  lastUpdated: string
  /** Starting status before the supplier changes anything. */
  status: ManagedProductStatus
  /** Back office note shown when status is action_needed. */
  actionNeeded?: string
  /**
   * Content and document field ids the back office has asked the supplier to
   * change. The red line on the product page is drawn from these.
   */
  actionNeededFields?: string[]
  /** Why those fields need attention. Defaults to a review rejection when omitted. */
  actionNeededReason?: ActionNeededReason
  /** Document file names currently held, keyed by DocumentField id. */
  documents: Record<string, { fileName: string; uploadedOn: string }>
}

function docs(prefix: string, overrides: ManagedProduct['documents'] = {}): ManagedProduct['documents'] {
  const base: ManagedProduct['documents'] = {
    paq: { fileName: `${prefix}-PAQ-v1.0.pdf`, uploadedOn: '2026-01-14' },
    dcb0129: { fileName: `${prefix}-DCB0129-safety-case-v3.2.pdf`, uploadedOn: '2026-03-09' },
    hazard_log: { fileName: `${prefix}-DCB0129-hazard-log-v3.2.xlsx`, uploadedOn: '2026-03-09' },
    ico: { fileName: 'my-mhealth-ICO-registration-2026.pdf', uploadedOn: '2026-05-14' },
    cyber_essentials: { fileName: 'my-mhealth-Cyber-Essentials-2025.pdf', uploadedOn: '2025-11-30' },
    pen_test: { fileName: `${prefix}-pen-test-summary-Feb-2026.pdf`, uploadedOn: '2026-02-12' },
    wcag: { fileName: `${prefix}-WCAG-2.2-AA-audit.pdf`, uploadedOn: '2026-01-20' },
    dtac: { fileName: `${prefix}-DTAC-v2.0.pdf`, uploadedOn: '2026-02-26' },
  }
  return { ...base, ...overrides }
}

export const MANAGED_PRODUCTS: ManagedProduct[] = [
  {
    id: 'myheart',
    appSlug: 'myheart',
    name: 'myHeart',
    lastUpdated: '2026-06-03',
    status: 'up_to_date',
    documents: docs('myHeart'),
  },
]

export function findManagedProduct(productId: string): ManagedProduct | undefined {
  return MANAGED_PRODUCTS.find((p) => p.id === productId)
}

/** Stored alongside a document's file name: ISO date it was uploaded. */
export const UPLOADED_ON_SUFFIX = '__uploaded_on'

export function findProductField(fieldId: string): { kind: 'content'; field: ContentField } | { kind: 'document'; field: DocumentField } | null {
  const content = PRODUCT_CONTENT_FIELDS.find((f) => f.id === fieldId)
  if (content) return { kind: 'content', field: content }
  const document = PRODUCT_DOCUMENT_FIELDS.find((f) => f.id === fieldId)
  if (document) return { kind: 'document', field: document }
  return null
}

/* ------------------------------------------------------------------------ */
/* Published pages                                                           */
/* ------------------------------------------------------------------------ */

/** User-entered content on a product's Commissioning Store page. */
export const PRODUCT_PAGE_FIELDS: ContentField[] = [
  { id: 'overview', label: 'Overview', hint: 'Shown at the top of the product page.', type: 'textarea' },
  { id: 'why_it_matters', label: 'Why it matters locally', type: 'textarea' },
  { id: 'contact_name', label: 'Contact name for commissioners', type: 'text' },
  { id: 'contact_email', label: 'Contact email for commissioners', type: 'text' },
]

/** User-entered content on the supplier's Commissioning Store page. */
export const SUPPLIER_PAGE_FIELDS: ContentField[] = [
  { id: 'about', label: 'About your company', type: 'textarea' },
  { id: 'website', label: 'Website', type: 'text' },
  { id: 'enquiries_email', label: 'General enquiries email', type: 'text' },
]

export const SUPPLIER_PAGE_ID = 'supplier'

/**
 * Prototype public Commissioning Store URL for the supplier page.
 * Used for Store link and Preview changes (opens in a new window).
 */
export const SUPPLIER_STORE_PAGE_HREF = '/suppliers/my-mhealth'

export const SUPPLIER_PAGE_DEFAULTS: Record<string, string> = {
  about:
    'my mhealth develops evidence-based digital therapeutics for long-term conditions, used by NHS organisations across England to support self-management and remote care.',
  website: 'https://mymhealth.com',
  enquiries_email: 'nhs@mymhealth.example',
}

/** ISO date the published pages were last updated (starting value). */
export const PUBLISHED_PAGES_LAST_UPDATED = '2026-08-19'

/* ------------------------------------------------------------------------ */
/* Formatting                                                                */
/* ------------------------------------------------------------------------ */

/** "14 July 2026" from an ISO date or timestamp. */
export function formatPortalDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
