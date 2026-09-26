# Oreno frontend handoff

The public website, exported company/talent application screens, and missing MVP product journeys are implemented as responsive Next.js App Router experiences. Screens without a supplied Figma source are explicitly classified as inferred MVP work in [`../product/MISSING_SCREENS_REGISTER.md`](../product/MISSING_SCREENS_REGISTER.md).

## Run locally

```bash
npm install
npm run dev
```

Start with `http://localhost:3000`, `/company`, or `/talent`.

## Public and authentication routes

- Discovery: `/talent-catalogue`, `/talent-catalogue/john-doe`, `/jobs`, `/jobs/product-designer`
- Leads: `/request-demo`, `/contact`
- Newsletter: `/newsletter/confirmed`, `/newsletter/unsubscribe`
- Talent identity: `/auth/talent-signup`, `/auth/talent-login`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`
- Invitations and system states: `/invitations/accept`, `/unauthorised`, `/error-demo`, plus the global not-found route
- Company identity remains at `/company/signup` and `/company/login`

The marketing navigation and primary calls to action now connect to these local product routes.

## Company routes

The original company screens remain available, including dashboard, talent/staff views, departments, roles, managers, salaries, messages, hiring, settings, and the four onboarding steps. Added MVP routes are:

- Setup and access: `/company/onboarding/complete`, `/company/organisation`, `/company/access`, `/company/access/invitations`, `/company/access/roles`
- Hiring: `/company/jobs`, `/company/jobs/product-designer`, `/company/jobs/product-designer/edit`, `/company/discover`, `/company/applications`, `/company/applications/app-john`, `/company/shortlists`
- Interviews and offers: `/company/interviews`, `/company/interviews/interview-john`, `/company/offers`, `/company/offers/offer-chibuokem`, `/company/placements/offer-chibuokem`, `/company/replacements/new`
- Work management: `/company/teams`, `/company/tasks/task-1`, `/company/tasks/calendar`, `/company/time`, `/company/performance`
- Records and preferences: `/company/compensation`, `/company/compensation/payroll/2026-09`, `/company/compensation/salary/john-doe`, `/company/compensation/payments`, `/company/notifications`, `/company/preferences`

## Talent routes

The original task, team, messages, settings, and application screens remain available. Added MVP routes are:

- Dashboard and onboarding: `/talent`, `/talent/onboarding/basics`, `/talent/onboarding/professional`, `/talent/onboarding/availability`, `/talent/onboarding/complete`
- Profile: `/talent/profile`, plus `/experience`, `/education`, `/certifications`, `/portfolio`, `/availability`, and `/skills` below that path
- Discovery and applications: `/talent/jobs`, `/talent/jobs/product-designer`, `/talent/jobs/product-designer/apply`, `/talent/jobs/product-designer/apply/standard`, `/talent/applications`, `/talent/applications/app-john`
- Hiring outcomes: `/talent/interviews/interview-john`, `/talent/offers/offer-chibuokem`
- Placed work: `/talent/team/current`, `/talent/tasks/task-1`, `/talent/tasks/calendar`, `/talent/time`
- Records and notifications: `/talent/performance`, `/talent/compensation`, `/talent/compensation/payments`, `/talent/notifications`

## Implementation structure

- `components/platform/`: the Figma-derived company/talent shells and exported screens.
- `components/product/`: shared inferred product states plus public, company, and talent journey screens.
- `app/platform.css` and `app/product.css`: isolated application styling, tokens, responsive layouts, tables, boards, forms, dialogs, and mobile navigation.
- `lib/platform/contracts.ts`: domain and request contracts.
- `lib/platform/product-service.ts`: replaceable local fixture adapter; components do not access a database.
- `data/platform-product-fixtures.ts`: dedicated development data for the inferred flows.
- `lib/platform/product-policy.ts`: route manifests, allowed lifecycle transitions, and validation helpers covered by unit tests.
- `public/assets/figma/app/`: exact raster assets extracted from supplied exports.

## Product decisions preserved

- Matching explanations disclose rule inputs and never present an opaque hiring verdict.
- Performance screens do not invent a score when no approved measurement policy exists.
- Compensation and payroll screens model agreements and payment records only; they do not claim to transfer money.
- Destructive and irreversible-looking actions require confirmation, and status never relies on colour alone.
- Platform-owner administration remains a separately scoped product surface.
- Forms and mutations provide local demo results only and never claim production persistence.

## States and accessibility

Shared data screens support loading, empty, no-result, API-error/retry, permission-denied, archived, and success states through `DataStateBoundary`. Use `?state=loading`, `empty`, `no-results`, `error`, `denied`, `archived`, or `success` on a compatible route to review them. Forms expose labels and field-level errors; dialogs use native accessible semantics; focus indicators and responsive navigation are retained.

## Backend integration

Replace `productService` in `lib/platform/product-service.ts` with an authenticated HTTP adapter while retaining the contracts. The required `/api/v1` capabilities, error envelope, authorisation expectations, idempotency needs, upload flow, WebSocket work, and integration TODOs are recorded in [`../product/API_REQUIREMENTS.md`](../product/API_REQUIREMENTS.md).

## Motion system

The motion layer uses the `motion` package through a single `LazyMotion` provider, shared timing/easing tokens and small client boundaries. CSS handles control feedback, ambient effects, chart/progress drawing, form focus and reduced-motion fallbacks. Motion for React handles route/view transitions, viewport reveals, layout changes, gesture feedback, status changes and inserted messages.

- Shared components: `components/motion/`
- Tokens and variants: `lib/motion/`
- Global motion and reduced-motion rules: `app/motion.css`
- Effect-by-effect documentation: [`../motion/MOTION_INVENTORY.md`](../motion/MOTION_INVENTORY.md)

The Figma exports contain no authored motion timeline, so the attached approved motion brief—not fabricated Figma keyframes—defines the animation behaviour. Match-score rings, 3D effects and non-existent tooltip/popover/accordion components were deliberately omitted. Task dragging includes a keyboard-operated next-stage control, continuous effects stop under `prefers-reduced-motion`, and mobile uses a reduced visual effect set.

The exact exported Oreno mark at `public/assets/figma/oreno-mark.svg` is also registered as the browser favicon. The root body suppresses hydration warnings caused by browser extensions that inject attributes before React loads; application-originated hydration errors remain visible at their own component boundaries.

The homepage showcase placeholders are now approved code-native product animations, the talent carousel supports drag/keyboard/button navigation, and the duplicate export-only white artboard tail after the footer has been removed.

## Verification

- Unit policy/route/motion tests: passed (11/11).
- ESLint: passed with zero warnings.
- TypeScript: passed.
- Production build: passed.
- Visual QA: deferred to the product owner by request; see [`VISUAL_QA.md`](VISUAL_QA.md).
