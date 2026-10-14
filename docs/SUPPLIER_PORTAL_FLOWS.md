# Supplier portal — user flows

The supplier dashboard is the home page after sign-in. From there, a supplier either picks up something in **Needs your attention**, or opens one of four working areas: company information, onboard a product, update an existing product, or publish a Commissioning Store page. Contact and Account management are placeholder pages with no journey yet.

## Sign in

Any supplier portal address sends a signed-out person to sign-in, then back to the page they were opening. A filled-in email and password are enough; this prototype accepts any values.

```mermaid
flowchart TD
  open[Open a supplier portal page] --> signedIn{Signed in?}
  signedIn -->|Yes| page[That page]
  signedIn -->|No| signIn[Sign in]
  signIn --> filled{Email and password entered?}
  filled -->|No| errors[Show what is missing]
  errors --> signIn
  filled -->|Yes| land[Dashboard, or the page they were opening]
```

## What the dashboard offers

**Needs your attention** is the work queue. It lists company information that has never been submitted, an onboarding form that is incomplete or needs action, product documents that need action, and a product page or the supplier page that is unpublished or needs action. Draft changes, unpublished changes, and items already in review stay off this list.

The section cards are the longer routes below.

```mermaid
flowchart TD
  dash[Dashboard] --> queue[Needs your attention]
  dash --> sections[Section cards]
  queue --> company[Company information]
  queue --> form[Onboarding form]
  queue --> docs[Product documents and content]
  queue --> productPage[Product page]
  queue --> supplierPage[Supplier page]
  sections --> companyCard[Company information]
  sections --> onboard[Product onboarding]
  sections --> manage[Manage products]
  sections --> published[Published pages]
```

## Company information

Dashboard, then Company information. This is the Section A supplier questionnaire, split into three chapters, each submitted on its own. A chapter that has not been submitted is a row in a task list, marked Incomplete. Opening it runs through its questions one per page (Save and continue), then that chapter's Check your answers and Confirm and submit. Once submitted, the chapter appears on the page as a read-only summary list under its title, with one Change button next to the title. There is no page-level Submit. Once every chapter has been submitted a status and last-updated date are shown on top.

Submitting a chapter applies its answers straight away. There is no HealthStore review for company information.

Chapters and questions (A2 to A4 from the Section A spec are about a product, so they open each product onboarding form instead):

1. Company details: A1 company name; does the company trade under a different name? (added, No / Yes) and, if yes, the trading name; type of organisation (added); A9 country of registration; A10 Companies House, charity number or reference; A8 registered address (NHS Addresses pattern: address lines, town, county, postcode); company website (added)
2. Relationship manager: A5 first name, last name and job title; A6 email and phone number
3. Care Quality Commission: A11 required to register with the CQC? (Yes / No); if yes, A11 date of last assessment and A12 upload of the latest CQC report (file only, no reference name)

```mermaid
flowchart TD
  page[Company information page] --> row[Chapter not yet submitted: task-list row, Incomplete]
  page --> ro[Chapter submitted: title, Change button, read-only summary list]
  row -->|Open| q[One question per page: Save and continue]
  q --> q
  q -->|Last question| check[Check your answers for the chapter]
  check -->|Change link on a row| one[Edit that question: Save and exit]
  one --> check
  check --> confirm[Confirm and submit]
  confirm --> done[Confirmation: chapter submitted, chapters still to complete]
  done --> page
  ro -->|Change| q
  q -->|Save and exit part-way| roDraft[Summary list with rows marked Not yet submitted: Review and submit, or Discard changes]
  roDraft --> check
  roDraft --> ro
```

Save and exit on any question keeps the answers as a draft and returns to the Company information page; Cancel and exit discards that page's unsaved edits. Nothing changes until Confirm and submit on the chapter's Check your answers. Submitting one chapter leaves drafts in other chapters as they are.

## Onboard a new product

Dashboard, then Product management, then Product onboarding. Each product has its own form. The sample form is myCOPD. Answers save as you go. Submit stays unavailable until every task is completed.

The form has four sections and seven tasks. Each task is a run of one-question-per-page screens, and some questions only appear depending on earlier answers in the same task (see "Product onboarding question routes" below).

1. Product details (A2 product name, A3 version number, A4 type of product, with a description page when Other)
2. Value proposition (Section B, not scored)
3. Technical questions: Clinical safety (C1), Data protection (C2), Technical security (C3), Interoperability (C4)
4. Key principles for success: Usability and accessibility (Section D)

```mermaid
flowchart TD
  list[Product onboarding list] --> form[Open the product form]
  form --> tasks[Task list]
  tasks --> question[Answer one question]
  question --> more{More questions in this task?}
  more -->|Yes| next[Save and next]
  next --> question
  more -->|No| exit[Save and exit]
  exit --> tasks
  question --> leave[Save and exit, or cancel]
  leave --> tasks
  tasks --> ready{Every task completed?}
  ready -->|No| tasks
  ready -->|Yes| submit[Submit]
  submit --> check[Check your answers]
  check --> change[Change an answer]
  change --> question
  check --> confirm[Confirm and submit]
  confirm --> done[Confirmation, with a reference number]
  done --> review[HealthStore team reviews the evidence]
  review --> listed[Product can be listed after the review]
```

On the last question, Save and exit marks the task completed when the required answers are in. You can leave earlier and come back; the task stays incomplete until then. After submission the form status is Submitted. The product is not listed on the HealthStore until that review is finished. The team says they will be in touch within 10 working days if they need more information.

### Product onboarding question routes

Save and next only visits the questions on the supplier's route. Questions that are skipped are left out of the Completed check and of Check your answers. Changing an earlier answer can bring a skipped question back; its previous answer, if any, is kept. "Provided / Not provided" questions are followed by a separate upload (or text) page when the answer is Provided.

#### Section B: Value proposition

No branching apart from the B4 upload.

```mermaid
flowchart TD
  B1["B1 Intended use of the product"] --> B2["B2 What the product does and how it is used"]
  B2 --> B3["B3 Intended users, benefits, validation"]
  B3 --> B4{"B4 Data flow with the health IT system"}
  B4 -->|Provided| B4up["Upload data flow or user journey map"]
  B4 -->|Not available| toC1[Go to C1]
  B4up --> toC1
```

#### C1: Clinical safety (DCB 0129)

```mermaid
flowchart TD
  C111{"C1.1.1 Software or AI as a medical device?"}
  C111 -->|Yes| PAQ["Upload PAQ form"]
  PAQ --> C112["C1.1.2 Standalone medical device?"]
  C112 --> C12
  C111 -->|No| C12{"C1.2 Supports real-time or direct care?"}
  C12 -->|No| C121["C1.2.1 Justify why out of scope of DCB 0129"]
  C121 --> C122
  C12 -->|Yes| C122["C1.2.2 Clinical risk management to DCB 0129?"]
  C122 --> C123{"C1.2.3 Clinical risk management system"}
  C123 -->|Provided| C123d["Describe the system"]
  C123 -->|Not provided| C124
  C123d --> C124{"C1.2.4 Safety Case Report and Hazard Log"}
  C124 -->|Provided| C124a["Upload Safety Case Report"]
  C124a --> C124b["Upload Hazard Log"]
  C124b --> C125
  C124 -->|Not provided| C125["C1.2.5 Clinical Safety Officer details"]
  C125 --> toC2[Go to C2]
```

#### C2: Data protection (UK GDPR)

C2.2.1 to C2.2.5 are asked whether or not the product processes personal data.

```mermaid
flowchart TD
  C21["C2.1 DSPT compliance"] --> C22["C2.2 Processes personal data?"]
  C22 --> C221{"C2.2.1 ICO registration"}
  C221 -->|Provided| C221up["Upload ICO certificate"]
  C221 -->|Not provided| C222
  C221up --> C222{"C2.2.2 DPIA"}
  C222 -->|Provided| C222up["Upload DPIA"]
  C222 -->|Not provided| C223
  C222up --> C223{"C2.2.3 Privacy notice"}
  C223 -->|Provided| C223link["Link to privacy notice"]
  C223 -->|Not provided| C224
  C223link --> C224{"C2.2.4 Terms and conditions or EULA"}
  C224 -->|Provided| C224up["Upload file"]
  C224 -->|Not provided| C224why["State why"]
  C224up --> C225
  C224why --> C225{"C2.2.5 Where is data stored and processed?"}
  C225 -->|UK only| toC3[Go to C3]
  C225 -->|Outside the UK| C226["C2.2.6 Country and safeguards"]
  C226 --> toC3
```

#### C3: Technical security

```mermaid
flowchart TD
  C31{"C3.1 Cyber Essentials certificate"}
  C31 -->|Provided| C31up["Upload certificate"]
  C31 -->|Not provided| C32
  C31up --> C32{"C3.2 Signed the NHS Cyber Security Charter?"}
  C32 -->|Yes| toC4a["Go to C4 (rest of C3 skipped)"]
  C32 -->|No| C33{"C3.3 Penetration test summary"}
  C33 -->|Provided| C33up["Upload report"]
  C33 -->|Not provided| C34
  C33up --> C34["C3.4 Software Security Code of Practice"]
  C34 --> C35["C3.5 Plan for MFA on all accounts?"]
  C35 --> C351["C3.5.1 MFA on privileged supplier access?"]
  C351 --> C36["C3.6 Logging and reporting defined?"]
  C36 --> toC4b[Go to C4]
```

#### C4: Interoperability

```mermaid
flowchart TD
  C41{"C4.1 Exposes APIs or integration channels?"}
  C41 -->|No| C42
  C41 -->|Yes| C411["C4.1.1 Standards used and justification"]
  C411 --> C412{"C4.1.2 Follows GDS Open API guidance?"}
  C412 -->|Confirm| C42
  C412 -->|Cannot confirm| C413["C4.1.3 How APIs are documented"]
  C413 --> C42{"C4.2 Shares or receives data with care systems?"}
  C42 -->|No| toDa["Go to Section D"]
  C42 -->|Yes| C421["C4.2.1 Uses NHS number?"]
  C421 --> C422{"C4.2.2 Validates NHS numbers with PDS or local systems?"}
  C422 -->|"C4.2.1 and C4.2.2 both Yes"| C424
  C422 -->|"Either No"| C423["C4.2.3 Approach to identifying patient records"]
  C423 --> C424{"C4.2.4 Patients use NHS login?"}
  C424 --> C425["C4.2.5 Supports DAPB3051?"]
  C425 -->|"C4.2.4 was Yes"| toDb[Go to Section D]
  C425 -->|"C4.2.4 was No or Not applicable"| C426["C4.2.6 Authentication approach and data protection"]
  C426 --> toDb
```

#### Section D: Usability and accessibility

D1.4 asks which platforms the product supports (iOS, Android, Web). A "None of the above" option exists in the model but is hidden for now; if it is switched on and selected, D1.4.1 to D1.5 are skipped.

```mermaid
flowchart TD
  D11{"D1.1 Fit with care pathways or staff journeys"}
  D11 -->|Provided| D11up["Upload pathway or journey document"]
  D11 -->|Not provided| D12
  D11up --> D12["D1.2 Usability testing with intended users?"]
  D12 --> D13["D1.3 Read the Accessible Information Standard?"]
  D13 --> D14{"D1.4 Which digital platforms does the product support?"}
  D14 -->|"None of the above (hidden)"| done["Section D complete"]
  D14 -->|"iOS, Android or Web"| D141{"D1.4.1 WCAG 2.2 AA or higher?"}
  D141 -->|"Yes or Not applicable"| D143
  D141 -->|"No, plan in place / No"| D142["D1.4.2 Timescale for compliance"]
  D142 --> D143["D1.4.3 Accessibility statement link"]
  D143 --> D15["D1.5 Service availability over 12 months"]
  D15 --> check[Check your answers]
```

## Update an existing product

Dashboard, then Product management, then Manage products. The sample product is myHeart, which starts as Up to date. A supplier can change the product summary, who it is for, the support email, and the assurance documents.

```mermaid
flowchart TD
  products[Manage products] --> product[Open a product]
  product --> view[Content and documents]
  view --> edit[Change one field]
  edit --> save[Save and exit]
  save --> draft[Status becomes Draft changes]
  draft --> view
  view --> canSubmit{Draft changes, or action needed?}
  canSubmit -->|Yes| submit[Submit for review]
  submit --> check[Check your answers]
  check --> edit
  check --> confirm[Confirm and submit]
  confirm --> sent[Confirmation: changes submitted]
  sent --> inReview[Status: In review]
  inReview --> outcome{HealthStore team}
  outcome -->|Approves| current[Status: Up to date]
  outcome -->|Asks for changes| action[Status: Action needed]
  action --> view
```

Draft changes are not seen by the HealthStore team. Submit for review only appears once there are draft changes, or the last review came back as action needed. While the status is In review, this prototype can stand in for the team with Simulate approval and Simulate rejection. A rejection puts the submitted values back into the draft so they can be edited and sent again. The dashboard then lists that product under Needs your attention.

## Publish or update a store page

Dashboard, then Published pages. There is a page for each product and one supplier page. The supplier edits the public wording. Content that came from onboarding is shown on the page and cannot be changed here.

There is no separate check-your-answers step. Submit for review sends the page straight to the team and leaves you on the same screen.

```mermaid
flowchart TD
  pages[Published pages] --> page[Open a product page or the supplier page]
  page --> edit[Edit your content]
  edit --> save[Save and exit]
  save --> first{Has this page been published before?}
  first -->|No| unpublished[Status: Unpublished]
  first -->|Yes| changes[Status: Unpublished changes]
  changes --> live[Commissioners still see the published version]
  edit --> submit[Submit for review]
  submit --> inReview[Status: In review]
  inReview --> outcome{HealthStore team}
  outcome -->|Approves| published[Status: Published]
  outcome -->|Asks for changes| action[Status: Action needed]
  action --> edit
  published --> visible[Commissioners see the new version]
```

A page that has never been published starts as Unpublished, so commissioners cannot see it. After the first approval it is Published. Later saves become Unpublished changes, and the live page stays as it was until the new version is submitted, reviewed, and approved. A rejected page becomes Action needed and returns to Needs your attention, together with any page that is still unpublished.
