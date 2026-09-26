# Visual QA status

Visual comparison is intentionally deferred to the product owner at their request.

## Completed engineering checks

- `npm run lint` completed without reported lint errors.
- `npx tsc --noEmit` completed successfully.
- `npm run build` completed successfully under Next.js 16.3.6.
- All application routes resolve through the company and talent catch-all route modules.
- Desktop layouts target the supplied 1440×1024 artboards.
- Responsive rules cover tablet and mobile navigation, tables, grids, forms, messages, jobs, and task boards.

## Suggested owner review

Use the original exports in `design/figma/the app designs/` and `design/figma/screens/` as the comparison source.

Recommended viewport checks:

- Desktop: 1440×1024 for each route in `SCREEN_INVENTORY.md`.
- Tablet: 900×1024 to confirm navigation drawer, two-column reductions, and horizontal data-table scrolling.
- Mobile: 390×844 to confirm single-column forms, cards, job details, settings, chat, and navigation drawer behavior.

The inferred MVP screens are registered in `../product/MISSING_SCREENS_REGISTER.md`. Review those routes for product fit at desktop, tablet, and mobile widths. Their UI extends the established Oreno colour, typography, shell, form, table, card, status, and dialog patterns rather than claiming to be additional Figma-authored designs.

## Motion review checklist

Motion visual QA remains with the product owner. Review `/`, `/company`, `/company/tasks/calendar`, `/company/salaries`, `/company/messages`, `/talent`, `/talent/tasks`, `/talent/applications/app-john`, and `/talent/offers/offer-chibuokem` with normal motion and with the operating system's reduced-motion preference enabled.

- Confirm text and controls remain stationary and readable over ambient homepage effects.
- Confirm route, drawer, dialog, calendar, salary-period, task and message transitions never delay the underlying action.
- Confirm task cards can be moved with the keyboard-accessible arrow control as well as pointer drag feedback.
- Confirm mobile removes parallax, the connector and secondary ambient layers.
- Confirm reduced-motion mode removes continuous drift, pulsing, floating and parallax while preserving final states and focus feedback.
- Use `?state=loading` on a supported product route to review the normal and reduced-motion skeleton variants.
- Confirm the browser tab displays the exported teal Oreno mark after a hard refresh.
- With Grammarly or a similar extension enabled, confirm no hydration-error overlay appears after a hard refresh.
- Confirm workspace ambient orbs, catalogue glows, notification pulses and card elevation remain prominent without obscuring text or controls.
- Confirm the rotating hero role never shifts “just became” outside the headline area at desktop or mobile widths.
- Confirm the talent carousel works with pointer dragging, arrow buttons, and keyboard arrow keys.
- Confirm all three showcase scenes remain legible and contained within their media panels.
- Confirm the footer is the final homepage section with no white artboard area beneath it.

## Source ambiguities preserved

- Company performance and talent-profile performance have blank content regions in the exported source. The implementation intentionally preserves those blank regions.
- `Login.svg` and `Sign up.svg` from the talent ZIP are blank artboards. No details were invented from those files; the complete company authentication screens from the company canvas were implemented.
- `5d514e4a3a8fdb1711cba4e281cacc5a 1.svg` appears to be a third-party Joblist reference image, so it was not exposed as an Oreno route.
