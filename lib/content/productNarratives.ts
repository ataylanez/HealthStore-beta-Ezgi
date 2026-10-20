import type { ProductNarrative } from './productModel'
import { dtacPack } from './assuranceDomains'

/**
 * Assurance position wording (Assurance team feedback, Sep 2026). The NHS HealthStore does
 * not run national assurance or certify products — it provides verified supplier source
 * documents for the commissioner's local assurance.
 */
export const LOCAL_ASSURANCE_SENTENCE =
  'We make assurance easier and faster by providing access to source documents in your workspace once verified for your local assurance purposes.'

export const ASSURANCE_SUPPORT_NOTE =
  'We make it faster by providing access to source documents in your workspace once verified for your local assurance purposes.'

/** NICE status and "Last reviewed" dates checked on nice.org.uk, September 2026. */
const EVA_STATUS = 'Recommended for use in the NHS during the evidence generation period (early value assessment)'

const NICE_HTG736 = {
  ref: 'NICE HTG736',
  url: 'https://www.nice.org.uk/guidance/htg736',
  status: EVA_STATUS,
  last_updated: '3 February 2026',
}

const NICE_HTG761 = {
  ref: 'NICE HTG761',
  url: 'https://www.nice.org.uk/guidance/htg761',
  status: EVA_STATUS,
  last_updated: '4 December 2025',
}

const NICE_HTG766 = {
  ref: 'NICE HTG766',
  url: 'https://www.nice.org.uk/guidance/htg766',
  status: EVA_STATUS,
  last_updated: '22 January 2026',
}

/** MHRA PARD records (pard.mhra.gov.uk), checked September 2026. */
const MY_MHEALTH_PARD = {
  url: 'https://pard.mhra.gov.uk/manufacturer-details/13445',
  registered_name: 'my mhealth self management platform',
}

export const LUSCII_NARRATIVE: ProductNarrative = {
  decision_summary: {
    one_line_proposition: 'A 24/7 remote monitoring service for high-risk COPD patients — patients report symptoms in the app, a clinical hub intervenes before an emergency.',
    pathway_problem: 'COPD drives more emergency admissions than any other respiratory condition — 140,000 per year in England, costing the NHS over £1.9 billion annually. The majority are repeat admissions by a small high-risk cohort who deteriorate silently between appointments. Virtual ward capacity reaches only a fraction of this population, and post-exacerbation monitoring is inconsistent, with most patients receiving no structured follow-up until they present again in crisis.',
    intervention_class: 'Remote patient monitoring with clinical hub',
    why_relevant: 'The strongest NHS evidence in the COPD portfolio for fewer admissions and A&E attendances — when deployed with a monitoring hub. Bradford deployment showed 30–48% admission reduction across 786 patients. North West London enrolled 6,000+ patients with similar signals.',
  },
  what_it_does_bullets: [
    'Patients submit symptoms and vital signs through the app between appointments',
    'A 24/7 clinical monitoring hub reviews alerts and escalates early',
    'Clinicians enrol eligible patients — the app replaces ad-hoc verbal advice with a structured pathway',
  ],
  pathway_model: {
    current_steps: [
      { id: 'c1', label: 'GP or hospital identifies high-risk COPD patient', role: 'GP / hospital clinician' },
      { id: 'c2', label: 'Verbal self-management advice at discharge or review', role: 'Respiratory nurse' },
      { id: 'c3', label: 'Patient waits for symptoms to worsen', role: 'Patient' },
      { id: 'c4', label: 'Unplanned A&E or admission', role: 'Emergency services' },
    ],
    future_steps: [
      { id: 'f1', label: 'Clinician enrols eligible patient on monitoring pathway', role: 'Respiratory team', change: 'changed' },
      { id: 'f2', label: 'Patient submits symptoms and vitals via app', role: 'Patient', change: 'added' },
      { id: 'f3', label: 'Clinical hub reviews alerts and intervenes early', role: 'Monitoring hub (24/7)', change: 'added' },
      { id: 'f4', label: 'Planned review or virtual consultation', role: 'Respiratory nurse', change: 'changed' },
      { id: 'f5', label: 'Admission only when clinically necessary', role: 'Acute team', change: 'changed', notes: 'Fewer avoidable admissions under evaluation' },
    ],
    roles: ['Respiratory nurse', 'Monitoring hub', 'GP', 'Patient'],
    changed_resources: ['Fewer unplanned admissions', 'Hub capacity required', 'Digital enrolment replaces ad-hoc paper plans'],
  },
  evidence_claims: [
    {
      claim_id: 'luscii-scale',
      claim_text: '6,000 COPD patients enrolled at North West London ICS',
      basis: 'observed_operational',
      evidence_strength: 'NHS programme data',
      source_reference: 'NWL ICS / Imperial College Healthcare NHS Trust',
      source_date: '2023',
    },
    {
      claim_id: 'luscii-adm',
      claim_text: '48% fewer emergency respiratory admissions',
      metric: 'Admissions',
      unit: '% reduction',
      effect_central: 40,
      effect_lower: 30,
      effect_upper: 48,
      basis: 'evaluated_outcome',
      evidence_strength: 'NHS evaluation',
      study_population: '786 patients, Bradford',
      comparator: 'Before implementation',
      source_reference: 'Bradford District and Craven ICB evaluation',
      source_date: '2023',
      benefit_category: 'capacity_released',
      limitations: 'Effect depends on hub model and which patients are enrolled',
    },
    {
      claim_id: 'luscii-ae',
      claim_text: '31% fewer A&E attendances',
      metric: 'A&E',
      unit: '% reduction',
      effect_central: 25,
      effect_lower: 16,
      effect_upper: 31,
      basis: 'evaluated_outcome',
      evidence_strength: 'NHS evaluation',
      source_reference: 'Bradford evaluation; Lenus COPD service',
      source_date: '2023',
      benefit_category: 'capacity_released',
    },
  ],
  regulatory_position: {
    device_class: 'Class IIa medical device',
    assurance_speed_note: ASSURANCE_SUPPORT_NOTE,
    nice: { ...NICE_HTG736 },
    mhra_pard: { url: 'https://pard.mhra.gov.uk/manufacturer-details/31696', registered_name: 'Luscii Vitals' },
    dtac_complete: true,
  },
  // DTAC-ordered assurance pack — see docs/assurance-feedback-before-after.md.
  assurance_domains: dtacPack({
    deviceStatus: 'Medical device — Class IIa SaMD',
    clinicalSafety: {
      review_due: '2026-09',
      residual_action: 'Complete local clinical safety assessment before go-live',
    },
    dataProtectionVerified: '2024-04',
    cyberEssentials: 'Not confirmed in reviewed sources',
    iso27001: 'Certified',
    nice: 'NICE HTG736 EVA recommendations.',
    niceVerified: '2024-12',
    niceReviewDue: '2027-12',
    dtacForm: {
      summary: 'DTAC completed April 2024 — confirmed in G-Cloud 14 Service Definition.',
      verified_date: '2024-04',
    },
  }),
  commercial_readiness: {
    proposition_type: 'Service-led (software + 24/7 clinical hub)',
    route_status: 'PSR route — NHS HealthStore buyer pack for local provider selection',
    commercial_status: 'Buyer selection pack ready',
    buyer_pack_status: 'PSR evidence pack, price schedule and contract schedules available',
    price_summary: 'Pricing on application — contact supplier (figures pending verification)',
    healthstore_role: `The NHS HealthStore supports you through the purchase — from buyer pack and pricing to introductions and contract support. ${LOCAL_ASSURANCE_SENTENCE}`,
  },
  commissioner_economics: {
    headline: 'For 500 monitored patients, about £245k net economic value per year — mostly from freed acute capacity, with additional Green Book productivity and wellbeing gains.',
    cash_vs_capacity: 'Avoided admissions free beds and clinician time first — that is capacity, not cash until you convert it. About 40% of freed capacity can convert to paid elective activity (cash). Beyond NHS costs, Green Book methodology values reduced informal carer burden, productivity from fewer sick days, and wellbeing gains (QALY-based) — important for HM Treasury-facing submissions and system-level business cases.',
    tariff_note: 'Emergency COPD admissions attract the emergency tariff (HRG DZ65A-F, approximately £2,500–£5,500 per spell). Avoided admissions reduce commissioner expenditure at tariff price, but provider income falls in parallel — model as a system benefit requiring aligned incentives. QOF indicator COPD007 rewards recording a review within 3 months of exacerbation — remote monitoring enables this at scale. The COPD Best Practice Tariff (BPT) rewards complete discharge bundles (see myCOPD). Virtual ward tariff applies where patients meet the NHSE virtual ward definition.',
    settings: [
      {
        label: 'Conservative (250 patients)',
        net_value_gbp: 95000,
        capacity_gbp: 120000,
        cash_gbp: 50000,
        cost_gbp: 28000,
        note: 'Cautious 25% admission reduction. Capacity freed in acute, cash from elective conversion.',
      },
      {
        label: 'Central (500 patients)',
        net_value_gbp: 245000,
        capacity_gbp: 300000,
        cash_gbp: 120000,
        cost_gbp: 55000,
        note: 'Evidence-based central case. Scales toward £0.5m–£1m at full high-risk population.',
      },
      {
        label: 'Full Green Book value (500 patients)',
        net_value_gbp: 380000,
        capacity_gbp: 300000,
        cash_gbp: 120000,
        cost_gbp: 55000,
        note: 'Includes productivity gains (£600 per avoided admission in sick days), carer time savings and QALY-based wellbeing (£20,000/QALY, 0.02 QALY per patient/year).',
      },
    ],
    funding_levers: [
      { label: 'Emergency tariff avoidance', status: 'Live', note: 'Each avoided admission saves £2,500–£5,500 at national tariff. Commissioner benefit where activity reduction is sustained.' },
      { label: 'Virtual ward tariff', status: 'Live 2026/27', note: 'Remote monitoring patients meeting virtual ward criteria attract the VW tariff — creates cash income for the provider while reducing emergency admissions.' },
      { label: 'QOF — COPD007', status: 'Supports achievement', note: 'Post-exacerbation review within 3 months is a QOF indicator. Remote monitoring makes this auditable and achievable at scale.' },
      { label: 'Elective recovery', status: 'Live', note: 'Freed bed capacity can be converted to elective activity priced at 100% tariff — a direct cash bridge.' },
      { label: 'MedTech Funding Mandate', status: 'Future', note: 'ICB-level funding obligation when NICE formally recommends. Luscii is positioned for this under HTG736.' },
    ],
  },
  engagement_signals: [
    { metric: 'Retention at 3 months', value: '98%', source: 'Imperial HF study (cross-condition)', caveat: 'Heart failure cohort — COPD retention may differ' },
    { metric: 'Patients enrolled', value: '6,000+', source: 'NWL ICS / Imperial College Healthcare NHS Trust' },
    { metric: 'Digital inclusion support', value: 'iPads provided', source: 'Sunderland deployment (lower-SES population)' },
  ],
  implementation: {
    human_wrapper: 'Luscii requires a 24/7 clinical monitoring hub to triage alerts and escalate deteriorating patients. This can be an existing virtual ward hub, a third-party provider, or a dedicated respiratory nursing team. The hub reviews patient-submitted data daily and contacts patients who flag amber or red alerts. Without an active hub, the product is a patient diary — not a monitoring service.',
    workforce: 'Clinical hub staffing: approximately 1 WTE band 6/7 respiratory nurse per 200 monitored patients (can be shared across conditions). Respiratory team for patient selection, enrolment conversations and periodic review. Admin support (0.2 WTE) for invitation and onboarding in first 3 months.',
    timescale: '3–6 months from agreement to steady-state. First 4 weeks: hub setup, protocol agreement, safety sign-off. Weeks 5–8: pilot cohort (50–100 patients). Months 3–6: scale to full eligible population. Supplier provides technical integration, training materials and ongoing account management.',
    prerequisites: ['Named clinical owner (respiratory consultant or advanced practitioner)', 'Hub capacity — existing virtual ward or commissioned service', 'Referral pathway and patient selection criteria agreed', 'Local clinical safety assessment completed', 'IG sign-off and DPA executed'],
    owner: 'ICB virtual ward / respiratory lead',
  },
  publishing: { content_owner: 'NHS HealthStore product team', review_date: '2026-06-25', next_review: '2026-09-25' },
}

export const MYCOPD_NARRATIVE: ProductNarrative = {
  decision_summary: {
    one_line_proposition: 'A digital discharge bundle — patients get structured self-management, inhaler training and a 6-week home pulmonary rehab programme through the app.',
    pathway_problem: 'One in four COPD patients are readmitted within 30 days of discharge. The primary drivers are poor inhaler technique (up to 90% of patients use inhalers incorrectly), incomplete discharge bundles (many trusts fail to reach the 60% BPT gateway), and inaccessible pulmonary rehabilitation — national PR waiting lists mean only 16% of eligible patients complete a programme. These are addressable problems that persist because structured support ends at the hospital door.',
    intervention_class: 'Self-management digital therapeutic',
    why_relevant: 'Directly addresses the three main readmission drivers: replaces the paper discharge checklist with a dependable digital bundle, provides in-app inhaler technique training with video feedback, and delivers a 6-week home-based PR programme that bypasses waiting lists. Helps hospitals cross the COPD best-practice tariff gateway (worth ~£94k/year for 500 admissions).',
  },
  what_it_does_bullets: [
    'Replaces the paper discharge checklist with a digital bundle patients complete on their phone',
    'Delivers inhaler technique training and a 6-week home pulmonary rehabilitation programme',
    'Optional clinician dashboard (Pro tier) for remote review of patient progress',
  ],
  pathway_model: {
    current_steps: [
      { id: 'c1', label: 'Hospital discharge with paper checklist', role: 'Ward team' },
      { id: 'c2', label: 'Verbal inhaler training', role: 'Nurse' },
      { id: 'c3', label: 'PR referral if capacity exists', role: 'Therapist' },
      { id: 'c4', label: '90-day readmission risk', role: 'System' },
    ],
    future_steps: [
      { id: 'f1', label: 'Digital discharge bundle via app', role: 'Ward team', change: 'changed' },
      { id: 'f2', label: 'In-app inhaler training and PR programme', role: 'Patient', change: 'added' },
      { id: 'f3', label: 'Clinician dashboard review (Pro tier)', role: 'Respiratory team', change: 'added' },
      { id: 'f4', label: 'Scheduled follow-up', role: 'GP / community', change: 'changed' },
    ],
    roles: ['Ward team', 'Respiratory nurse', 'Patient', 'GP'],
    changed_resources: ['Dependable discharge documentation', 'Digital PR replaces face-to-face where appropriate'],
  },
  evidence_claims: [
    {
      claim_id: 'mycopd-tariff',
      claim_text: 'Helps cross the 60% COPD discharge bundle gateway',
      basis: 'modelled_economic',
      evidence_strength: 'Payment mechanism',
      source_reference: 'NHS best practice tariff rules 2026/27',
      source_date: '2026',
    },
    {
      claim_id: 'mycopd-gp',
      claim_text: '19% fewer unscheduled GP appointments',
      metric: 'GP appointments',
      unit: '% reduction',
      effect_central: 19,
      effect_lower: 15,
      effect_upper: 19,
      basis: 'observed_operational',
      evidence_strength: 'Supplier real-world data',
      source_reference: 'my mhealth real-world evaluation',
      source_date: '2024',
      benefit_category: 'capacity_released',
    },
    {
      claim_id: 'mycopd-readmit',
      claim_text: '20% fewer 90-day readmissions',
      metric: 'Readmissions',
      unit: '% reduction',
      effect_central: 20,
      effect_lower: 15,
      effect_upper: 53,
      basis: 'evaluated_outcome',
      evidence_strength: 'Weak — trial positive but not statistically significant',
      source_reference: 'RESCUE RCT',
      source_date: '2022',
      limitations: 'Upper bound from supplier data not used in central scenario',
      benefit_category: 'capacity_released',
    },
  ],
  regulatory_position: {
    device_class: 'Class I medical device',
    assurance_speed_note: ASSURANCE_SUPPORT_NOTE,
    nice: { ...NICE_HTG736 },
    mhra_pard: { ...MY_MHEALTH_PARD },
    dtac_complete: true,
  },
  // DTAC-ordered assurance pack — see docs/assurance-feedback-before-after.md.
  assurance_domains: dtacPack({
    deviceStatus: 'Medical device — Class I SaMD',
    clinicalSafety: { verified_date: '2025-01', residual_action: 'Local deployment safety sign-off required' },
    cyberEssentials: 'Held, expires 30 November 2026',
    iso27001: 'Not confirmed in reviewed sources',
    nice: 'NICE HTG736 EVA recommendations.',
    niceVerified: '2024-12',
    dtacForm: {
      summary:
        'Central DTAC completion is over 3 years old. Updated DTAC form (February 2026) applies from April 2026 — request the current form from the supplier.',
    },
  }),
  commercial_readiness: {
    proposition_type: 'Software-led with optional clinical dashboard',
    route_status: 'PA23 / software procurement route — NHS HealthStore buyer pack attached',
    commercial_status: 'Buyer selection pack ready',
    buyer_pack_status: 'Core pack with route note, assurance passport and price schedule',
    price_summary: 'Indicative £120,000 annual licence (provider footprint)',
    healthstore_role: `The NHS HealthStore provides your buyer pack, pricing transparency, contract templates and hands-on support through the purchase process. ${LOCAL_ASSURANCE_SENTENCE}`,
  },
  commissioner_economics: {
    headline: 'Crossing the discharge bundle tariff gateway is worth approximately £94,500 cash per year for 500 admissions. Adding readmission reduction, PR capacity release and Green Book benefits takes total economic value to £250k+.',
    cash_vs_capacity: 'The BPT top-up is real cash for the acute trust (direct payment uplift per admission). Readmission avoidance is capacity released — beds and clinician time freed but not cash until converted. PR capacity release means more patients rehabilitated without additional physiotherapy staff. Green Book economic value includes productivity gains from fewer exacerbation-related sick days and reduced informal carer burden — relevant for HM Treasury-facing business cases.',
    tariff_note: 'The COPD Best Practice Tariff (BPT) pays a top-up of approximately £189 per eligible admission when at least 60% include a documented discharge bundle. The app makes that bundle dependable and auditable — often the difference between failing and passing the gateway. Separately, QOF indicator COPD007 rewards recording a post-exacerbation review — the app provides the evidence trail. QOF indicator COPD003 rewards spirometry recording which the self-management programme supports.',
    settings: [
      {
        label: 'BPT gateway only (500 admissions)',
        net_value_gbp: 89000,
        cash_gbp: 94500,
        capacity_gbp: 0,
        cost_gbp: 120000,
        note: 'Cash-positive from tariff alone if gateway crossed. This is the minimum defensible case.',
      },
      {
        label: 'BPT + readmission reduction (500 admissions)',
        net_value_gbp: 175000,
        cash_gbp: 94500,
        capacity_gbp: 200000,
        cost_gbp: 120000,
        note: 'Adds 20% readmission reduction (RESCUE RCT central estimate). Capacity value from freed bed-days.',
      },
      {
        label: 'Full economic value incl. Green Book (500 admissions)',
        net_value_gbp: 260000,
        cash_gbp: 94500,
        capacity_gbp: 200000,
        cost_gbp: 120000,
        note: 'Includes PR capacity (2x throughput), productivity gains (£400/avoided readmission in sick days) and QALY-based health gain valued at £20,000/QALY.',
      },
    ],
    funding_levers: [
      { label: 'COPD Best Practice Tariff', status: 'Live 2026/27', note: '~£189 per eligible admission when 60% discharge bundle gateway crossed. Worth £94.5k/year for a trust with 500 COPD admissions. Cash in the provider\'s hands.' },
      { label: 'QOF — COPD007', status: 'Supports achievement', note: 'Post-exacerbation review within 3 months. The app provides structured evidence of self-management and review completion.' },
      { label: 'QOF — COPD003', status: 'Supports achievement', note: 'Spirometry recording. The self-management programme supports ongoing monitoring and recording compliance.' },
      { label: 'CQUIN', status: 'Live', note: 'Discharge bundle improvement can be structured as a CQUIN goal. Directly incentivises adoption without QOF cost pressure.' },
      { label: 'Central licence funding', status: 'Proposed 2027/28', note: 'NHSE has signalled central funding for NICE-recommended COPD DTx. Would cover the £120k licence cost — making the BPT income pure surplus.' },
    ],
  },
  engagement_signals: [
    { metric: 'Activation rate', value: '78.8%', source: 'NHS Highland (Cooper et al.)', caveat: 'No correlation with age, wealth, rurality or severity' },
    { metric: 'Daily login rate', value: '60%', source: 'Jersey COPD deployment (800+ video views/week)' },
    { metric: 'PR throughput', value: '2x more patients completing PR per year', source: 'Southend University Hospital — digital PR allowed the service to double the number of patients completing pulmonary rehabilitation without additional physiotherapy staff' },
    { metric: 'Patient activation (PAM)', value: 'OR 1.65', source: 'EARLY RCT', caveat: 'Patient activation measure — patients more engaged in managing their condition' },
  ],
  implementation: {
    human_wrapper: 'Primarily a patient-facing self-management tool — the clinical wrapper is lighter than Luscii. Ward team introduces the app at discharge (takes 2–3 minutes per patient). Optional Pro tier adds a clinician dashboard for respiratory team oversight. The supplier handles all technical setup and provides training materials for ward staff.',
    workforce: 'Ward staff time for introduction at discharge (2–3 minutes per patient during existing discharge conversation). No ongoing clinical monitoring required at standard tier. Pro tier: respiratory nurse reviews dashboard weekly (approximately 0.1 WTE per 500 active patients). Admin support for initial embedding: 0.1 WTE band 4 for 6 weeks.',
    timescale: '6–12 weeks. Weeks 1–2: Trust IG approvals and licence agreement. Weeks 3–4: Ward staff training (2-hour session per ward) and process mapping. Weeks 5–8: Pilot on one respiratory ward. Weeks 9–12: Roll-out to remaining wards. Supplier provides on-site training, integration support and monthly review calls during embedding.',
    prerequisites: ['Named discharge pathway owner (respiratory nurse or ward manager)', 'Ward staff briefed on app introduction process', 'Baseline BPT gateway performance documented (to measure improvement)', 'IG/DPA executed', 'Wi-Fi or 4G coverage in ward areas for patient activation'],
    onboarding_steps: [
      'Infrastructure assessment',
      'Pathway embedding with clinical teams',
      'Patient invitation',
      'Staff training',
    ],
    onboarding_ongoing_step: 'Ongoing account management',
    onboarding_note: 'Digital Health Advisors support patients throughout onboarding and ongoing use.',
  },
  publishing: { content_owner: 'NHS HealthStore product team', review_date: '2026-06-25', next_review: '2026-09-25' },
}

const MYHEART_NARRATIVE: ProductNarrative = {
  decision_summary: {
    one_line_proposition: 'A home-based cardiac rehabilitation app — patients complete Phase III and IV rehab from home with exercise prescription, and the clinical team monitors progress remotely.',
    pathway_problem: 'Only 33% of eligible cardiac patients complete rehabilitation nationally. Capacity constraints in face-to-face programmes mean most patients receive no structured recovery support after a cardiac event. The NHS Long-Term Plan requires 85% CR uptake by 2028 — at current trajectories, most areas will fall far short.',
    intervention_class: 'Home-based cardiac rehabilitation programme',
    why_relevant: 'myHeart addresses the largest single barrier to cardiac rehab uptake — limited face-to-face capacity. It offers Phase III and IV rehabilitation content with exercise prescription, enabling patients to participate from home. The Dorset deployment achieved 70% CR uptake, demonstrating that digital CR can exceed face-to-face programme completion rates.',
  },
  what_it_does_bullets: [
    'Structured Phase III and IV cardiac rehabilitation content accessible from home — no clinic attendance required',
    'Exercise prescription with video demonstrations graded by cardiac risk and baseline fitness',
    'Clinical team receives patient progress and completion data to inform follow-up decisions',
    'Scales CR capacity without additional clinical staff — one programme supports unlimited concurrent patients',
  ],
  pathway_model: {
    current_steps: [
      { id: 'c1', label: 'Cardiac event or procedure', role: 'Acute cardiology' },
      { id: 'c2', label: 'Referral to cardiac rehab (6–12 week wait)', role: 'Discharge team' },
      { id: 'c3', label: 'Group-based face-to-face sessions (8 weeks)', role: 'Cardiac rehab team' },
      { id: 'c4', label: '67% drop out or never attend', role: 'Patient' },
    ],
    future_steps: [
      { id: 'f1', label: 'Cardiac event or procedure', role: 'Acute cardiology' },
      { id: 'f2', label: 'Immediate digital CR invitation at discharge', role: 'Discharge team', change: 'changed' },
      { id: 'f3', label: 'Patient starts home-based rehab within days', role: 'Patient', change: 'added' },
      { id: 'f4', label: 'Progress monitored remotely by CR team', role: 'Cardiac rehab team', change: 'changed' },
      { id: 'f5', label: 'Face-to-face reserved for complex patients', role: 'Cardiac rehab team', change: 'changed' },
    ],
    roles: ['Cardiac rehab team', 'Discharge team', 'Patient'],
    changed_resources: ['CR capacity trebled without staff increase', 'Waiting time eliminated for standard-risk patients', 'Face-to-face capacity reserved for high-risk'],
  },
  evidence_claims: [
    {
      claim_id: 'myheart-readmission',
      claim_text: '20% fewer 12-month cardiac readmissions with completed CR',
      metric: 'Readmissions',
      unit: '% reduction',
      effect_central: 20,
      effect_lower: 15,
      effect_upper: 25,
      basis: 'evaluated_outcome' as const,
      evidence_strength: 'NACR national data',
      source_reference: 'National Audit of Cardiac Rehabilitation (NACR) annual report',
      source_date: '2024',
      benefit_category: 'capacity_released' as const,
      limitations: 'Population-level association — not specific to digital CR. Effect applies to completed CR regardless of format.',
    },
    {
      claim_id: 'myheart-uptake',
      claim_text: '70% CR uptake achieved (vs 33% national average)',
      metric: 'CR uptake',
      unit: '%',
      effect_central: 70,
      basis: 'observed_operational' as const,
      evidence_strength: 'NHS deployment data',
      source_reference: 'Dorset County Hospital case study',
      source_date: '2023',
    },
  ],
  commissioner_economics: {
    headline: 'Digital cardiac rehab typically costs £50–£100 per patient against £300–£500 per patient for face-to-face CR. The real value is volume — you can serve 3–5x more patients for the same budget.',
    cash_vs_capacity: 'Direct savings are limited because most CR is already funded within block contracts. The primary value is capacity release — serving 3–5x more patients within the same staffing envelope. Secondary benefits include reduced readmission rates (NACR data suggests completed CR reduces 12-month readmission by 20%) and QOF achievement for coronary heart disease indicators.',
    tariff_note: 'CR is delivered within block contracts for most providers. The BPT for cardiac rehabilitation (BPT04) incentivises early and comprehensive rehab. QOF indicator CHD007 rewards recording CR status. Increasing CR uptake supports both provider BPT achievement and commissioner QOF targets — a rare aligned incentive.',
    settings: [
      { label: 'Conservative (200 patients/yr)', cash_gbp: 0, capacity_gbp: 40000, cost_gbp: 15000, net_value_gbp: 25000, note: 'Capacity released in existing CR team. Enables waiting list clearance.' },
      { label: 'Central (500 patients/yr)', cash_gbp: 30000, capacity_gbp: 120000, cost_gbp: 40000, net_value_gbp: 110000, note: 'Readmission reduction begins to generate cash savings at scale.' },
      { label: 'Evidence-led (1,000 patients/yr)', cash_gbp: 80000, capacity_gbp: 250000, cost_gbp: 75000, net_value_gbp: 255000, note: 'Full pathway transformation. Face-to-face reserved for complex. CR uptake exceeds 70%.' },
    ],
    funding_levers: [
      { label: 'Best Practice Tariff (BPT04)', status: 'Applicable', note: 'Digital CR counts towards BPT achievement for comprehensive cardiac rehab. Confirm local coding approach with provider.' },
      { label: 'QOF — CHD007', status: 'Supports achievement', note: 'Recording CR referral and completion supports QOF achievement for coronary heart disease. Digital CR makes completion more trackable.' },
      { label: 'CQUIN', status: 'Negotiate locally', note: 'CR uptake improvement can be structured as a local CQUIN. Discuss with provider clinical leads.' },
    ],
  },
  implementation: {
    human_wrapper: 'The clinical team handles patient onboarding at discharge and reviews progress data. No monitoring hub required — this is self-management with passive oversight, not remote monitoring.',
    workforce: 'Existing cardiac rehab team capacity. No additional clinical roles needed. Admin support for initial patient invitations (typically 0.2 WTE band 4 for first 3 months).',
    timescale: '4–6 weeks from agreement to first patients enrolled. Integration with patient administration systems takes 2–4 weeks. Full steady-state within 3 months.',
    prerequisites: [
      'Cardiac rehab lead identified and engaged',
      'Referral trigger agreed (discharge, outpatient review, or community)',
      'Patient invitation process established (text, letter, or clinician-led)',
      'Outcome reporting agreement with supplier',
    ],
  },
  regulatory_position: {
    device_class: 'Class I medical device',
    assurance_speed_note: ASSURANCE_SUPPORT_NOTE,
    nice: { ...NICE_HTG761 },
    mhra_pard: { ...MY_MHEALTH_PARD },
    dtac_complete: true,
  },
  assurance_domains: dtacPack({
    deviceStatus: 'Medical device — Class I SaMD',
    nice: 'NICE HTG761 EVA recommendations.',
    interop: {
      summary:
        'FHIR integration available. EMIS integration available. NHS Notify supported. API integration available. Outcome data exportable for commissioner reporting. Connects to Bluetooth devices (blood pressure monitors). Confirm local EPR integration requirements with supplier.',
    },
    cyberEssentials: 'Not confirmed in reviewed sources',
    iso27001: 'Certified',
  }),
  commercial_readiness: {
    commercial_status: 'Available',
    price_summary: '£50–£100 per patient pathway',
    proposition_type: 'Per-patient licence with unlimited access',
    route_status: 'Direct award or G-Cloud framework',
    buyer_pack_status: 'Available from the NHS HealthStore',
    healthstore_role: `The NHS HealthStore provides the buyer pack, pricing, introductions and hands-on support through the purchase. ${LOCAL_ASSURANCE_SENTENCE}`,
  },
  publishing: { content_owner: 'NHS HealthStore', review_date: '2026-06-25', next_review: '2026-09-25' },
}

const JOINT_ACADEMY_NARRATIVE: ProductNarrative = {
  decision_summary: {
    one_line_proposition: 'NICE HTG766-recommended physiotherapist-guided digital programme for hip and knee osteoarthritis — structured exercise, education and 1:1 physio support, with RCT evidence of 49% achieving clinically meaningful pain improvement.',
    pathway_problem: 'MSK conditions are the largest single cause of disability in England. Orthopaedic waiting lists exceed 700,000 patients nationally. Limited physiotherapy capacity means most OA patients receive a leaflet and a review appointment — not the structured exercise and education that NICE recommends. Many progress to surgical referral unnecessarily.',
    intervention_class: 'Physiotherapist-guided digital MSK programme',
    why_relevant: 'Joint Academy provides what NICE recommends (structured exercise, weight management education, and ongoing support) at scale, without requiring additional physiotherapy appointments. RCT evidence shows 49% achieve clinically meaningful improvement vs 27% in usual care. Each patient who avoids surgical referral represents £6,000–£8,000 in direct cost avoidance.',
  },
  what_it_does_bullets: [
    'Daily personalised exercise programme with video guidance — tailored to joint affected and fitness level',
    'Weekly check-ins with a dedicated physiotherapist via in-app messaging',
    'Structured education on pain management, activity modification and weight management',
    'Outcome tracking and commissioner reporting — NRS pain scores, function and programme completion',
  ],
  pathway_model: {
    current_steps: [
      { id: 'c1', label: 'Patient presents to GP with joint pain', role: 'GP' },
      { id: 'c2', label: 'Leaflet advice, analgesia, physio waitlist', role: 'GP / MSK triage' },
      { id: 'c3', label: 'Wait 8–16 weeks for face-to-face physio', role: 'Community MSK' },
      { id: 'c4', label: '6 physio sessions over 12 weeks', role: 'Physiotherapist' },
      { id: 'c5', label: 'Referral to orthopaedics if no improvement', role: 'GP' },
    ],
    future_steps: [
      { id: 'f1', label: 'Patient presents to GP or FCP with joint pain', role: 'GP / FCP' },
      { id: 'f2', label: 'Immediate referral to Joint Academy', role: 'GP / FCP', change: 'changed' },
      { id: 'f3', label: 'Patient starts programme within 48 hours', role: 'Patient', change: 'added' },
      { id: 'f4', label: '12-week physio-guided programme at home', role: 'Joint Academy physio', change: 'added' },
      { id: 'f5', label: 'Surgical referral only if programme insufficient', role: 'GP / FCP', change: 'changed' },
    ],
    roles: ['GP', 'First Contact Practitioner', 'Patient', 'Joint Academy physiotherapist'],
    changed_resources: ['Physio waitlist bypassed', 'Orthopaedic referrals reduced 30–40%', 'GP follow-ups reduced 2.3 per patient/year'],
  },
  evidence_claims: [
    {
      claim_id: 'ja-ortho-referral',
      claim_text: '34% reduction in secondary care orthopaedic referrals',
      metric: 'Orthopaedic referrals',
      unit: '% reduction',
      effect_central: 34,
      effect_lower: 25,
      effect_upper: 40,
      basis: 'evaluated_outcome' as const,
      evidence_strength: 'NHS evaluation',
      source_reference: 'AHSN South East MSK pathway evaluation',
      source_date: '2024',
      benefit_category: 'capacity_released' as const,
      limitations: 'Observational study in a redesigned pathway — digital programme was one of several changes.',
    },
    {
      claim_id: 'ja-gp-visits',
      claim_text: '2.3 fewer GP appointments per patient per year',
      metric: 'GP visits reduced',
      unit: 'visits/year',
      effect_central: 23,
      basis: 'observed_operational' as const,
      evidence_strength: 'ICS evaluation',
      source_reference: 'ICS FCP pathway evaluation report',
      source_date: '2025',
      benefit_category: 'capacity_released' as const,
    },
  ],
  commissioner_economics: {
    headline: 'At £200–£350 per patient, Joint Academy costs less than a single face-to-face physio episode (£250–£400 for 6 sessions) and far less than a surgical pathway (£6,000–£8,000 per joint replacement). The real prize is deferring or avoiding surgery for 30–40% of suitable patients.',
    cash_vs_capacity: 'Cash savings arise primarily from deferred or avoided joint replacement surgery — each represents £6,000–£8,000 in direct surgical cost plus rehabilitation. Capacity savings include freed physiotherapy slots and reduced orthopaedic outpatient demand. Green Book economic impact includes productivity gains from faster return to work (OA patients are often of working age) and reduced social care dependency.',
    tariff_note: 'Orthopaedic providers derive significant income from elective joint replacement tariffs (HRG codes HN12–HN22). A reduction in surgical referrals will impact provider income — this requires careful system-level discussion. Best structured as a pathway redesign with shared savings. QOF indicator OST001/002 rewards recording OA diagnosis and providing structured management — digital programme completion directly supports achievement.',
    settings: [
      { label: 'Conservative (200 patients/yr)', cash_gbp: 120000, capacity_gbp: 60000, cost_gbp: 50000, net_value_gbp: 130000, note: '10% surgery deferral rate. 2 procedures avoided × £6k each plus physio capacity.' },
      { label: 'Central (500 patients/yr)', cash_gbp: 480000, capacity_gbp: 150000, cost_gbp: 125000, net_value_gbp: 505000, note: '30% surgery deferral. 24 procedures avoided per year. Physiotherapy waiting list cleared.' },
      { label: 'Evidence-led (1,000 patients/yr)', cash_gbp: 960000, capacity_gbp: 350000, cost_gbp: 250000, net_value_gbp: 1060000, note: '40% surgery deferral per evidence. System-level savings exceed £1m when including Green Book productivity gains.' },
    ],
    funding_levers: [
      { label: 'Elective recovery fund', status: 'Applicable', note: 'Reducing orthopaedic referrals frees capacity for the most complex patients. Frames within elective recovery programme.' },
      { label: 'QOF — OST001/002', status: 'Supports achievement', note: 'Recording structured OA management supports QOF osteoarthritis indicators. Programme provides auditable evidence of NICE-concordant care.' },
      { label: 'Community services block', status: 'Negotiate locally', note: 'Joint Academy can replace or supplement face-to-face physio within existing community MSK contracts. Discuss with MSK service lead.' },
      { label: 'Green Book economic value', status: 'Quantifiable', note: 'HM Treasury Green Book methodology values productivity gains from faster return to work. OA patients are often 50–65 years — working age. Each avoided month of disability has measurable economic value beyond NHS costs.' },
    ],
  },
  implementation: {
    human_wrapper: 'Joint Academy provides the physiotherapist as part of the service — no local clinical staff required for the programme itself. Your team needs to establish the referral pathway (GP, FCP, or MSK triage) and review outcome reports.',
    workforce: 'Minimal local effort. Referral pathway set-up with FCP/GP/MSK triage. Population-level outcome reporting reviewed quarterly by commissioner. Estimated 0.1 WTE band 7 for pathway oversight.',
    timescale: '2–4 weeks from agreement to first patients enrolled. Integration with referral management systems takes 1–2 weeks. Full pathway steady-state within 6 weeks.',
    prerequisites: [
      'MSK referral pathway agreed (FCP, GP, or triage service)',
      'Minimum 200-patient cohort identified for meaningful evaluation',
      'Orthopaedic service engaged on pathway redesign implications',
      'Commissioner reporting cadence agreed (quarterly recommended)',
    ],
  },
  regulatory_position: {
    device_class: 'Class I medical device',
    assurance_speed_note: ASSURANCE_SUPPORT_NOTE,
    nice: { ...NICE_HTG766 },
    mhra_pard: { url: 'https://pard.mhra.gov.uk/manufacturer-details/131215', registered_name: 'Joint Academy' },
    dtac_complete: true,
  },
  assurance_domains: dtacPack({
    deviceStatus: 'Medical device — Class I SaMD',
    nice: 'NICE HTG766 EVA recommendations.',
    dtacForm: { summary: 'DTAC on file; refreshed form due — request the current version from the supplier.' },
    cyberEssentials: 'Not confirmed in reviewed sources',
    iso27001: 'Certified',
  }),
  commercial_readiness: {
    commercial_status: 'Available',
    price_summary: '£200–£350 per patient pathway (12 weeks)',
    proposition_type: 'Per-patient programme fee (full clinical service included)',
    route_status: 'Direct award or AHSN-facilitated procurement',
    buyer_pack_status: 'Available from the NHS HealthStore',
    healthstore_role: 'The NHS HealthStore provides the buyer pack, pricing, introductions and hands-on purchase support. Several AHSNs have also facilitated local adoption.',
  },
  publishing: { content_owner: 'NHS HealthStore', review_date: '2026-06-25', next_review: '2026-09-25' },
}

/**
 * Limited market view. No funding levers, no price and no buyer pack.
 * Assurance domains stay incomplete: nothing is held for local assurance.
 */
export const WELLINKS_NARRATIVE: ProductNarrative = {
  decision_summary: {
    one_line_proposition:
      'An online platform for COPD self-management, with health coaching and connected devices for remote monitoring and education.',
    pathway_problem:
      'COPD care still depends on people managing exacerbations between appointments. NICE guidance expects a self-management plan, inhaler review and access to exercise, usually delivered face to face by a respiratory team. Many people leave hospital after an exacerbation without the support to cope at home, and pulmonary rehabilitation does not reach most of those who are eligible.',
    intervention_class: 'COPD self-management platform with health coaching',
    why_relevant:
      'NICE assessed Wellinks in HTG736 and made no recommendation. The guidance records that it is not used in the NHS and does not have UK regulatory approval. It is included so the wider COPD market is visible next to technologies that can be commissioned.',
  },
  what_it_does_bullets: [
    'Health coaching for self-management, delivered by respiratory professionals, as described by NICE',
    'A patient app with connected devices, such as pulse oximeters and spirometers, for monitoring and education',
    'Virtual pulmonary rehabilitation, one-to-one clinical coaching and nurse triage, as published by the supplier for use outside the NHS',
  ],
  pathway_model: {
    current_steps: [
      { id: 'c1', label: 'Person with COPD is on the primary care register', role: 'GP practice' },
      { id: 'c2', label: 'Face-to-face review, inhaler check and self-management advice', role: 'Respiratory nurse' },
      { id: 'c3', label: 'Pulmonary rehabilitation if a place is available', role: 'Therapy team' },
      { id: 'c4', label: 'Unplanned care if the person deteriorates at home', role: 'Urgent and emergency care' },
    ],
    future_steps: [
      { id: 'f1', label: 'Supplier enrols the person with a health plan or provider outside the NHS', role: 'Wellinks', change: 'added', notes: 'Not an NHS pathway' },
      { id: 'f2', label: 'Person uses the app and connected monitoring devices', role: 'Patient', change: 'added' },
      { id: 'f3', label: 'Supplier clinical team provides coaching and triage', role: 'Wellinks clinicians', change: 'added' },
      { id: 'f4', label: 'No NHS follow-up pathway is recorded', role: 'NHS', change: 'unchanged' },
    ],
    roles: ['Patient', 'Wellinks clinical team'],
    changed_resources: ['Not an NHS pathway', 'No NHS workforce or tariff impact is recorded'],
  },
  regulatory_position: {
    device_class: 'No UK regulatory approval recorded',
    assurance_speed_note:
      'Verified source documents for local assurance are not held on the HealthStore.',
    nice: {
      ref: 'NICE HTG736',
      url: 'https://www.nice.org.uk/guidance/htg736/chapter/2-The-technologies#wellinks',
      status: 'No recommendation. Wellinks is not used in the NHS and does not have UK regulatory approval.',
      last_updated: '3 February 2026',
    },
    dtac_complete: false,
  },
  assurance_domains: [
    {
      domain: 'Clinical safety',
      status: 'incomplete',
      summary: 'No UK regulatory approval is recorded. A DCB0129 clinical safety case, PAQ and hazard log are not held.',
      items: [
        { label: 'Medical device status', value: 'No UK regulatory approval recorded' },
        { label: 'PAQ form', value: 'Not held' },
        { label: 'DCB0129 hazard log', value: 'Not held' },
        { label: 'DCB0160 local hazard log template', value: 'Not held' },
      ],
    },
    {
      domain: 'Data protection',
      status: 'incomplete',
      summary: 'ICO registration, a data processing agreement and a DPIA are not held.',
      items: [
        { label: 'ICO registration', value: 'Not held' },
        { label: 'Data processing agreement', value: 'Not held' },
        { label: 'DPIA template', value: 'Not held' },
      ],
    },
    {
      domain: 'Technical security',
      status: 'incomplete',
      summary: 'Cyber Essentials, a penetration test and ISO 27001 are not held.',
      items: [
        { label: 'Cyber Essentials', value: 'Not held' },
        { label: 'Penetration test summary', value: 'Not held' },
        { label: 'ISO 27001', value: 'Not held' },
      ],
    },
    {
      domain: 'Interoperability',
      status: 'incomplete',
      summary: 'NHS integration is not confirmed. Wellinks is not used in the NHS.',
    },
    {
      domain: 'Usability and accessibility',
      status: 'incomplete',
      summary: 'User journeys and a WCAG 2.2 AA audit are not held.',
      items: [
        { label: 'User journeys', value: 'Not held' },
        { label: 'WCAG 2.2 AA third-party audit', value: 'Not held' },
      ],
    },
    {
      domain: 'NICE recommendation',
      status: 'incomplete',
      summary:
        'Assessed in NICE HTG736. No recommendation was made, because Wellinks is not used in the NHS and does not have UK regulatory approval.',
    },
    {
      domain: 'Completed DTAC form',
      status: 'incomplete',
      summary: 'A completed DTAC form is not held.',
      items: [{ label: 'DTAC form', value: 'Not held' }],
    },
  ],
  implementation: {
    human_wrapper:
      'NICE describes health coaching by respiratory professionals and a patient app with connected pulse oximeters and spirometers. The supplier also publishes virtual pulmonary rehabilitation and nurse triage. This is the supplier’s published service. It is not an NHS pathway.',
    workforce:
      'No NHS workforce model is held. NICE records that Wellinks is not used in the NHS, so there is no local clinical team, hub or onboarding route to plan from this page.',
    timescale:
      'There is no NHS go-live timeline. UK regulatory approval is not in place, and Wellinks is not available to commission through the NHS HealthStore.',
    prerequisites: [
      'UK regulatory approval is not recorded',
      'DTAC, clinical safety and information governance evidence are not held',
      'No NHS clinical owner or deployment is recorded',
    ],
  },
  publishing: { content_owner: 'NHS HealthStore product team', review_date: '2026-10-19', next_review: '2027-01-19' },
}

export function getProductNarrative(slug: string): ProductNarrative | null {
  if (slug === 'luscii') return LUSCII_NARRATIVE
  if (slug === 'mycopd') return MYCOPD_NARRATIVE
  if (slug === 'myheart') return MYHEART_NARRATIVE
  if (slug === 'joint-academy') return JOINT_ACADEMY_NARRATIVE
  if (slug === 'wellinks') return WELLINKS_NARRATIVE
  return null
}

/** Build a commissioner-facing story from catalogue app data when no curated narrative exists. */
export function buildNarrativeFromApp(app: {
  one_line_value_proposition?: string
  target_problem_statement?: string
  why_it_matters_locally?: string
  supervision_model?: string
  evidence_summary?: string
  condition_tags?: string[]
}): ProductNarrative {
  const supervisionLabel = app.supervision_model
    ? app.supervision_model.replace(/_/g, ' ')
    : 'Digital therapeutic'

  const plainWhy = app.why_it_matters_locally
    ? app.why_it_matters_locally.replace(/G-Cloud[^.]*\./gi, '').trim()
    : 'Relevant where local pathway data shows unmet need.'

  return {
    decision_summary: {
      one_line_proposition: app.one_line_value_proposition ?? 'Digital therapeutic for NHS pathways',
      pathway_problem: app.target_problem_statement ?? 'Pathway gaps between appointments drive unplanned acute activity.',
      intervention_class: supervisionLabel,
      why_relevant: plainWhy,
    },
    what_it_does_bullets: [
      app.one_line_value_proposition ?? 'Structured digital support between appointments',
      'Nationally assured through the NHS HealthStore before local adoption',
      'The NHS HealthStore supports you through the purchase with buyer materials, pricing and introductions',
    ],
    publishing: { content_owner: 'NHS HealthStore catalogue', review_date: '2026-06-25', next_review: '2026-09-25' },
  }
}

export function resolveProductNarrative(
  slug: string,
  app: Parameters<typeof buildNarrativeFromApp>[0],
): ProductNarrative {
  return getProductNarrative(slug) ?? buildNarrativeFromApp(app)
}
