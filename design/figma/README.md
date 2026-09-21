# Figma website handoff

This directory records the exact frames and visible homepage structure needed to begin the Oreno website implementation.

## Exact nodes

| Purpose | Node ID | Size | Coverage |
|---|---|---:|---|
| Website canvas | `27:56` | Canvas | Parent container named “The Website” |
| Desktop homepage | `27:61` | 1440 × 7168 | Complete public homepage |
| Mobile homepage | `111:1182` | 390 × 844 | Designed mobile hero |
| Design colours reference | `85:3183` | 1080 × 800 | Figma colour reference frame |

## Resume extraction

Use Figma `get_design_context` on the desktop and mobile frames, then use `download_assets` for each frame. Keep screenshots as QA references and store production image/SVG assets in `public/assets/figma/` with stable descriptive filenames.

Do not use the website-canvas node (`27:56`) as the implementation node; it is only the parent canvas. The implementation nodes are `27:61` and `111:1182`.

## Known design coverage

The desktop design is a full 7,168-pixel homepage. Its visible top-level structure includes:

1. Desktop navigation and hero
2. “Hiring Simplified” problem/benefit section
3. “Hire the best talents from Africa; Save time & resources” section
4. Three-step hiring explanation
5. Three large showcase/content sections
6. Closing call-to-action area
7. Newsletter and multi-column footer

The mobile frame currently covers only the hero. Its remaining responsive layout must be inferred from the desktop source without changing the content hierarchy.

## Asset status

The Figma Starter-plan MCP quota blocked `get_design_context` and `download_assets` for the implementation frames on 21 September 2026. No substitute artwork has been added. This is deliberate: exact exported assets should replace placeholders once the quota resets or the file is accessed through an account with sufficient Figma MCP calls.

See [`website-manifest.json`](website-manifest.json) for the machine-readable frame and section map.

