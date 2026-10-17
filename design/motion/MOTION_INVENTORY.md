# Oreno motion inventory

The static Figma exports do not contain an authored animation timeline. These effects implement the approved motion brief while preserving the existing layouts, content and visual hierarchy.

## Homepage motion implementation plan — October 17, 2026

| Change | Implementation | Guardrail | Status |
|---|---|---|---|
| Persistent navigation | Render one viewport-fixed homepage navbar above the route-transition layer, using the same `--ink` green as the hero and a restrained shadow after scroll | Preserve mobile menu behaviour and offset in-page anchors below the bar | Implemented |
| Desktop cursor tracking | Use a 42 px teal/mint lead glow with four progressively smaller spring-followed echoes; switch to Oreno pink over interactive controls | Activate from real mouse pointer events so hybrid laptops work; native cursor remains; reduced motion keeps only the lead glow | Implemented |
| Section entrances after the hero | Reveal the Hiring Simplified columns, hiring-guide intro/navigation, each showcase visual and copy block, final CTA content and footer columns on first viewport entry | Use clearly visible 52–86 px travel, scale and stagger; do not replay on scroll; collapse to short fades for reduced motion | Implemented |
| Motion QA | Check desktop, tablet and mobile layout; confirm keyboard focus, sticky guide clearance, reduced motion and production compilation | No backend integration or product-workflow files are part of this pass | In verification |

## Shared tokens

| Token group | Values | Use |
|---|---|---|
| Control feedback | 160–220 ms | Buttons, focus, status changes and inline feedback |
| Page and panel movement | 280–440 ms | Route entry, calendar direction, dialogs and task-view changes |
| Stagger | 40–75 ms | Related cards, rows and timeline items |
| Travel | 8–36 px | Entrance and directional continuity |
| Ambient cycles | 19–26 seconds | Grid, glows, authentication art and footer shape |
| Easing | `cubic-bezier(.22,1,.36,1)` | Standard restrained entrance and layout feedback |

Source: `lib/motion/tokens.ts` and `lib/motion/variants.ts`.

## Effect register

| Effect | Component or selector | Trigger | Duration | Reduced-motion behaviour | Pages |
|---|---|---|---|---|---|
| Route entrance/exit | `PageTransition` | Path change | 160–440 ms | Short opacity-only transition through Motion user preference | All routes |
| Viewport reveal | `Reveal`, homepage Motion groups | First viewport entry | 960–1,080 ms | 80 ms fade, no travel | Homepage headings, visuals, copy and major content groups |
| Staggered cards | `TalentCarousel`, list/card selectors | First entry or filtered remount | 40–75 ms interval | Items appear without stagger or travel | Homepage, catalogues, dashboards and records |
| Hero composition entrance | Hero navigation, headline, CTA and quote | Initial page entry | 550–800 ms | Final composition shown immediately | Homepage hero |
| Hero role typewriter | `HeroRoleRotator` | Page visible | 95 ms typing, 48 ms deletion, 1.65-second hold | Static “Designers” label | Homepage hero |
| Hero grid drift | `AnimatedGrid`, `.motion-grid` | Visible in viewport | 24-second alternate cycle | Static grid | Homepage hero |
| Hero grid scan and links | Grid scan/link selectors | Visible in viewport | 6.8–7.2-second cycles | Hidden/static grid | Homepage hero |
| Grid intersection pulse | `.motion-grid__pulse` | Visible in viewport | 6.5-second cycle | Static intersections | Homepage hero |
| Pointer illumination | `.motion-grid__glow` | Fine-pointer hover/move | 220 ms response | Hidden | Homepage hero |
| Global themed cursor trail | `PointerFollower` | Mouse movement, interactive hover and press | Spring-followed teal/mint trail; pink interactive state | Lead glow only; native pointer remains | All public, talent, company and admin routes |
| Persistent homepage navbar | `Navbar`, `MotionProvider` | Homepage load and scroll | 760 ms first entrance; 320 ms scroll shadow | Static fixed navigation | Homepage |
| Homepage reading progress | `HomepageScrollProgress` | Page scroll | Scroll-linked spring | Direct scroll position | Homepage |
| Candidate emphasis | Crowd image, top-match marker and `CountUp` | Section entry/visible | 940 ms count plus 2.2–11-second ambient cycles | Final number and static image | Hiring Simplified |
| Talent browsing | `TalentCarousel` controls, drag surface and progress | Pointer drag, keyboard or arrow button | Native inertial scroll plus 340 ms focus response | Manual navigation remains available | Hiring process |
| CTA glow layers | `AmbientGradient` | Visible in viewport | 19–26-second cycles | Static gradients | Homepage final CTA |
| Hiring connector draw | `ProgressConnector` | First viewport entry | 1.38 seconds | Immediate line, hidden on mobile | Homepage showcase |
| CTA pointer light and halo | Ambient cursor, title sheen and CTA halo | Pointer movement/page visible | 800 ms response and 2.8–7-second cycles | Static CTA composition | Homepage final CTA |
| Showcase parallax | `Parallax` | Scroll progress | Continuous while visible | Static; disabled on mobile | Homepage showcase cards |
| Showcase product narratives | `ShowcaseMotionScene` | First viewport entry plus restrained loops | 420 ms stagger and 2.4–18-second ambient cycles | Complete static product scenes | Homepage showcase cards |
| CTA arrow response | Arrow selectors | Hover or keyboard focus | 220 ms | Immediate | Public and product CTAs |
| Oreno wordmark response | Full navbar `oreno-logo` | Hover or keyboard focus | 420 ms | Immediate final state | Website navigation |
| Footer ambient shape | `.footer::before` | Page visible | 25-second cycle | Static | Homepage footer |
| Organic authentication art | `.auth-art__orb`, `.auth-art__flower` | Page visible | 13–18-second cycles | Static | Company sign-up and login |
| Newsletter confirmation | `Newsletter` success state | Valid form submission | 220 ms | Immediate confirmation | Homepage footer |
| Form focus expansion | Shared form selectors | Focus/keyboard focus | 160–220 ms | Immediate focus style remains | Public, company and talent forms |
| Validation feedback | `.field-error` | Error enters | 220 ms | No shake | High-risk forms |
| Onboarding direction | Onboarding forms and `PageTransition` | Step navigation | 380 ms | Short fade | Company and talent onboarding |
| Checkmark draw | Completed onboarding step SVG | Completed step mounts | 400 ms | Complete mark shown immediately | Company and talent onboarding |
| Active navigation marker | `.platform-nav__link::before` | Route becomes active | 220 ms | Immediate | Company and talent shells |
| Workspace ambient field | `WorkspaceAmbient` | Workspace or public-product page visible | 16–20-second cycles | Static low-opacity artwork | Company, talent and public product routes |
| Card elevation response | Shared dashboard, record, job and profile cards | Hover or keyboard focus within | 220 ms | Immediate focus styling remains | Company, talent and public product routes |
| Catalogue glow field | `.catalogue-hero::before`, `.catalogue-hero::after` | Page visible | 13–16-second cycles | Static glows | Talent catalogue and jobs |
| Notification pulse | `.platform-notification::after` | Shell visible | 2.6-second cycle | Static notification marker | Company and talent shells |
| Drawer and backdrop | Platform sidebar and Motion backdrop | Open/close | 180–320 ms | Immediate/short fade | Responsive company and talent navigation |
| Count-up metrics | `CountUp` | First reveal | 880 ms | Final value immediately | Company and talent dashboards, salary metrics |
| Chart/progress draw | Chart and progress selectors | Screen mount | 620–800 ms | Final values immediately | Company dashboard, talent table and salaries |
| Filter/list updates | Card, row and record selectors | Item mounts after filter/state change | 280–320 ms | Immediate | Talent, roles, jobs, records and notifications |
| Task drag feedback | `TaskBoard` Motion cards | Pointer drag | Spring/layout response | No scale/elasticity | Company and talent task boards |
| Keyboard task move | Task-card arrow action | Button activation | Layout spring | Immediate relocation | Company and talent task boards |
| Task view crossfade | `TaskBoard` | Cards/calendar tab change | Motion default/short | Opacity only | Task board |
| Calendar direction | `CompanyTaskCalendar` | Previous/next | 320 ms | Opacity only | Company task calendar |
| Salary crossfade | `SalaryOverview` | Period control | 220 ms | Opacity only | Company salaries |
| Timeline/progress line | `Timeline`, `.application-track` | First render/status entry | 460–720 ms | Complete line immediately | Applications, vetting, offers, payroll and placement |
| Status transition | `StatusChip` | Status changes | 220 ms | Short fade | Hiring, tasks, time, offers and payments |
| Message insertion | `MessagesView` | New message appended | Short slide/fade | Fade only | Company and talent messages |
| Dialog entrance/exit | `ConfirmDialog` | Open/close | 320 ms | Short fade | Job lifecycle, withdrawal and offer decisions |
| Toast/inline feedback | Status and success selectors | Feedback enters | 220 ms | Immediate/short fade | Forms, preferences and shell notices |
| Branded skeleton shimmer | `.motion-skeleton` | `?state=loading` | 1.45-second cycle | Static skeleton | Data-state-enabled product screens |
| Empty-state breathing | Product-state icon | Non-loading state shown | 4.8-second cycle | Static icon | Empty, no-result, error and archived states |
| Admin route entrance | `PlatformAdminApp` | Admin path change | 280 ms | Immediate/short fade | Platform administration |
| Admin row reveal | `AdminTable` | Screen or filtered result mounts | 40 ms stagger | Immediate rows | Platform administration |
| Admin mobile drawer | `AdminShell` sidebar/backdrop | Open/close | Motion spring/default | Immediate/short fade | Responsive platform administration |
| Audited action dialog | `AdminConfirmDialog` | High-risk action selected | 320 ms | Short fade | Platform administration mutations |
| Admin live marker | `.admin-live i` | Operational screen visible | 2.4-second restrained pulse | Static dot | Admin overview and system operations |
| Admin authentication entrance | `AdminAuth` panel | Auth screen entry | Motion default | Immediate/short fade | Admin login, 2FA, expiry and denial |

## Performance and usability decisions

- Ambient effects use low-opacity, compositor-friendly transforms; homepage effects pause when their section is outside the viewport where the client boundary can observe it.
- Mobile removes parallax, the connector, one glow layer and one grid pulse.
- Dense tables do not animate continuously while scrolling; only newly mounted rows receive a brief entrance.
- Text blocks, payment values and financial records never loop or move continuously.
- No 3D, particles, video, Spline, Meshy or Three.js dependency was added.
- Match-score rings were omitted because the product intentionally exposes explainable match inputs rather than a synthetic score.
- Tooltips, popovers and accordions were not invented where no such product component currently exists.
