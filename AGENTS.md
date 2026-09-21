# Oreno frontend instructions

## Source of truth

The Figma file is the visual source of truth:

`https://www.figma.com/design/eXcW1SL1x7ixOZRZH5o9uj/Softcruit?node-id=27-56`

The interface is branded **Oreno** even though the Figma file is named **Softcruit**. Use Oreno in product-facing copy unless the product owner changes the name.

## First build scope

Build only the public website initially.

- Desktop source frame: `27:61`
- Mobile source frame: `111:1182`
- Do not build the company dashboard or talent application in this phase.
- Implement real responsive React/Next.js components. Do not embed the homepage as a screenshot.

## Required Figma workflow

1. Load the Figma design-to-code guidance before requesting design context.
2. Call `get_design_context` for `27:61` and `111:1182` before implementing.
3. Treat generated React/Tailwind as reference material, not code to paste blindly.
4. Download and commit every exported image, logo, illustration, and icon used by the website under `public/assets/figma/`; temporary Figma asset URLs expire.
5. Never redraw exported icons or invent replacement artwork when the exact Figma asset exists.
6. Compare the running page with the Figma screenshot at desktop and mobile widths before considering a section finished.

## Responsive interpretation

The desktop Figma frame contains the complete homepage. The mobile frame currently designs only the hero area. Match both frames exactly where they exist; derive the remaining mobile sections from the desktop hierarchy and design language while keeping copy and content order intact.

## Component boundary suggestion

Keep the website decomposed into reusable sections such as `Navbar`, `Hero`, `HiringSimplified`, `HiringSteps`, `TalentShowcase`, `FinalCta`, `Newsletter`, and `Footer`. This list is a code-organization suggestion, not permission to change the visual layout.

## Interaction scope for the demo

Navigation and major calls to action should work. Until final destinations are supplied, use clear local routes or accessible modal forms for Start hiring, Apply, Request a demo, and newsletter subscription. Do not pretend those forms are connected to a production backend.

