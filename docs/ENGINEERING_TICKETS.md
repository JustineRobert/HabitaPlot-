# Engineering Tickets

## Epic: Uganda Launch and Localization

### ENG-101: Add Uganda District Localization
- Description: Extend the listing data model, API, and UI to support Uganda district-level address fields.
- Acceptance Criteria:
  - `district` field exists in the listing model and database schema.
  - `POST /api/v1/listings` accepts `district` in payload.
  - Listing search supports `district` query and filters.
  - UI search filters include a district input field.
  - Listing detail cards show district information if available.
- Notes:
  - Include support for commonly used Uganda districts such as Kampala, Wakiso, Mukono, and Jinja.

### ENG-102: Implement Uganda Mobile Money Payments
- Description: Add MTN MoMo and Airtel Money payment support for premium listings and subscription upgrades.
- Acceptance Criteria:
  - Backend exposes mobile money payment initiation and verification endpoints.
  - Payment UI flow supports provider selection and phone number input.
  - Transaction records capture provider, external ID, amount, and status.
  - Documentation includes Uganda mobile money checkout steps.
- Notes:
  - Use provider-specific request/verify flows and keep payment provider configuration out of source control.

### ENG-103: Create Figma-Ready Wireframes
- Description: Produce detailed UI specs for key product screens so designers can build Figma prototypes.
- Acceptance Criteria:
  - Search page wireframe with district filter is defined.
  - Listing detail page wireframe includes district display and contact actions.
  - Checkout page wireframe supports MTN MoMo/Airtel Money payment flows.
  - Admin listing creation page includes district and Uganda address fields.
- Notes:
  - Frame each screen in a mobile-first layout with component-level annotations.

### ENG-104: Draft Terms, Privacy & Compliance Documentation
- Description: Prepare legal and compliance documentation for launch in Uganda and broader markets.
- Acceptance Criteria:
  - Terms of Service draft covers user accounts, listings, payments, and responsibilities.
  - Privacy Policy draft explains data collection, storage, cookies, and user rights.
  - Compliance section covers local regulations, payment provider privacy, and data retention.
- Notes:
  - Keep language concise and aligned with GDPR-style privacy principles.

### ENG-105: Build a 90-Day Launch Roadmap
- Description: Define a clear 90-day rollout plan for product launch, marketing, and growth.
- Acceptance Criteria:
  - Roadmap includes objectives, milestones, and dependencies for each 30-day phase.
  - Tasks cover product completion, onboarding partners, marketing, and early operations.
  - Risks and mitigation actions are documented.
- Notes:
  - Focus on Kampala and Central Region first, then expand to secondary districts.
