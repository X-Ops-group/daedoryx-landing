# DAEDORYX Landing — Agent Instructions

## Mission
Create a credible, visually distinctive marketing and event-presentation experience for DAEDORYX, with a transparent and challengeable executive impact simulator.

## Non-negotiables
- **No fabricated product benchmarks, customers, certifications, savings, uptime, or capabilities.**
- DAEDORYX's central security proposition spans **enterprise operations security** and **security for autonomous AI agents**. Explain both without implying production feature availability.
- All website threat paths are illustrative control intentions, not actual security telemetry or deployed mitigations.
- All performance and ROI numbers must be scenario calculations, clearly labeled as assumptions rather than observed results.
- Do not publish private HOLOS/DAEDORYX infrastructure details, endpoint addresses, secrets, or internal architecture assets.
- Do not simulate lead delivery. The current contact interaction copies a brief to the local clipboard and submits nothing.
- Treat availability of Cloud, Hybrid, Enterprise as requiring confirmation, not generally available products.
- Keep the marketing site separate from any authenticated product interface.
- Respect keyboard access, reduced motion, readable contrast, and screen-reader semantics.
- Avoid dependencies for simple behavior. This website is intentionally static and framework-free.

## Development
Run the site on a local HTTP server; JavaScript ES modules will not reliably load directly from file://.
Example: `python3 -m http.server 8080`
Then open `http://localhost:8080` or `/present.html`.

## Verification
```sh
node --check model.mjs
node --check app.mjs
node --check present.mjs
node --test tests/*.test.mjs
node scripts/validate-site.mjs
```

## Architecture
- `index.html` — commercial landing, narrative, C-level scenario inputs.
- `styles.css` — shared design system, accessible responsive styles.
- `app.mjs` — landing interactions, scenario calculations, language switch, contact brief.
- `security.mjs` — defensive enterprise and agent-security threat scenario explorer.
- `model.mjs` — pure reusable scenario engine with tests.
- `present.html` — eight-slide event-ready presentation.
- `presentation.css` / `present.mjs` — deck design and keyboard navigation.
- `privacy.html` — factual description of this prototype's data flow.
- `docs/` — scenario and launch documentation.

## Collaboration
Changes must go through PRs with code review, passing automated checks, and explicit security/publication review before public deployment. The GitHub repository itself is public, so commit only material cleared for publication.

## Definition of Done
A function actually works (or is explicitly labeled unavailable); math is testable; mobile and desktop are validated; scenario data is not represented as observed; no broken local links; no unreviewed public deployment.
