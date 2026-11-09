# DAEDORYX — Executive Demo, Event Runbook & Release Gates

**Status:** ALPHA / simulated interactive experience. This is a marketing and product concept demonstrator, **not a deployed security product**.

## Three ways to show DAEDORYX

1. **Event deck:** open `present.html` (or `offline/daedoryx-presentation-offline.html`) for a 10-slide narrative. Link "TRY LAB" opens the interactive sandbox.
2. **Interactive lab:** open `demo.html` (or `offline/daedoryx-lab-offline.html`). Visitors choose one of six scenarios, modify the request, run six deterministic security policy checks, handle simulated human approval and export synthetic JSON evidence.
3. **Projector mode:** append `?mode=stage` to `demo.html`, or use STAGE MODE. The interface emphasizes the request workflow and enlarges the workbench. Press F to toggle fullscreen, if the browser allows it.

The lab is completely client-side. It makes **no outbound requests**. It does not access production, credentials, models, GitHub, Jira, IAM, cloud platforms or the user's homelab. Activity is retained only in the current browser tab. No user input or lead data is transmitted by the lab script (although **web hosting may retain standard HTTP access logs**).

## Suggested live demo (4 minutes)

1. **0:00–0:30 | The problem.** Show the dual control domains: enterprise security and security for the agents that operate it. Explain that AI-generated recommendations are not the same as authorized actions.
2. **0:30–1:00 | Safe autonomy.** Choose "A normal autonomous release", then evaluate. All six applicable sandbox policy checks pass. This is a *simulated authorization*, not an actual deployment.
3. **1:00–1:40 | Agent security.** Choose "Prompt injection → data egress" and evaluate. The attempted external export is denied by a deterministic **tool-egress rule**. This is **not prompt-injection detection**, model red-teaming or proof of a deployed defense.
4. **1:40–2:20 | Human authority.** Choose "Production release approval". It returns REVIEW; press SIMULATE APPROVAL and show the new ALLOW decision. Or reject instead. Neither button invokes a real pipeline.
5. **2:20–3:00 | Separation of duties.** Choose "Separation of duties violation". Even with an approval flag, a self-approved merge is denied. The same principal cannot author and review its own code.
6. **3:00–3:30 | Explainability.** Show the six policy checks and the in-memory audit timeline; export JSON (clearly labeled SYNTHETIC). Change the acting agent to UNKNOWN and re-evaluate to demonstrate deny-by-default.
7. **3:30–4:00 | Executive conclusion.** Select CEO/CFO/CIO/CTO/CISO lens and explain that the operating model makes authorization explicit. Invite visitors to run their own case via a **real deployed lab URL**, once available.

### Optional paths by audience

| Audience | Scenario | What to discuss |
| --- | --- | --- |
| CEO | Production release | Delegation with retained human authority |
| CFO | Finance threshold | Autonomous spend caps and approval escalation |
| CIO | Normal release / cross-tool flow | A coherent operating layer, not disconnected AI assistants |
| CTO | Self-merge | Identity, separation of duties and GitHub App design |
| CISO | External export / unknown agent | Deny by default, tool egress, evidence and identity boundary |

**Never claim:** live threat detection, genuine SOC incidents, vulnerability reduction, verified return on investment, production automations, customer results, model-based attack prevention, signed/tamper-proof audit, independent certification, deployed connectors or general commercial availability. Every metric on this lab is either a static feature count or a count of simulated operations performed *this session*.

## Visitor experience

- Runs in modern mobile and desktop browsers without authentication. Use a public URL only after the commercial release gate is completed.
- The interface is English-first for the international events; translated material can follow. The landing already supports a headline language switch, which does not yet apply to the lab.
- Attendee access via QR code must point to an actually deployed public `/demo.html` URL; do **not** hand out a fake demo link.
- There is no contact collection in the lab. Set up a separately reviewed, consent-based lead form if capturing leads becomes a goal. Do not silently transmit audit events or requests.

## Offline event contingency

In the repo root, run:

```sh
npm run check
npm run offline
```

Bring the generated `offline/` folder and an independent copy on a second laptop/USB. Open `offline/daedoryx-lab-offline.html` directly: the CSS and policy/UI scripts are embedded; no HTTP server, Wi-Fi, DNS or external model is needed. The landing and deck link to the offline lab. Browser download of local JSON may depend on kiosk/browser policy; test it before the event.

## Demo's synthetic policy matrix

| Control ID | Boundary | Example |
| --- | --- | --- |
| ID-01 | Registered identity | Unknown actors denied |
| AUTH-02 | Agent-scoped tool grant | Analyst cannot deploy |
| DLP-03 | Restricted external export | Customer-data export to external destination denied |
| SOD-04 | Separation of duties | Self-reviewed merge denied |
| FIN-05 | Financial authority | Over $5,000 reviewed; over $25,000 denied |
| PROD-06 | Production authorization | Mutations in production require a represented human approval |

The policy engine is intentionally transparent, rule-based and testable. It has no LLM and does not inspect arbitrary prompt content. Toggle "Untrusted prompt is present" to explain that authorization at the tool boundary is separate from detecting malicious instructions.

## Release gates (do not skip)

1. **Technical:** `npm run check` and `npm run offline` pass; test Chrome/Safari/Firefox, responsive viewports, keyboard and reduced motion; verify syntax and audit download. CI build produces the offline event package.
2. **Security:** independent review for XSS, unsafe user input, CSP and referrer behavior, hosting headers, dependencies, fake-integration claims, export content, browser storage and permissions. Ensure the repository contains no private infrastructure details.
3. **Product/legal:** verify all claims and operator information, privacy disclosures, branding/IP, no customer names or metrics; keep the simulation label prominent.
4. **Deployment:** choose a static HTTPS host (Vercel/Cloudflare Pages/etc.) with appropriate headers. Publish a real URL and then create the event QR; validate the URL over mobile LTE, not only on venue Wi-Fi.
5. **Event readiness:** pre-warm the browser, validate projector scaling and audio/visual conditions, rehearse demo, verify offline backup and put a human contact process in place.

## Next genuine MVP (separate backend project)

The security lab is **not** a substitute for implementing the product. A first genuine pilot should require:

- Dedicated, disposable **demo tenant** with hard isolation, quotas, rate limiting and automatic resets.
- AgoraPass/enterprise federation or equivalent for actual actors (never use shared user credentials).
- A service/API that emits authenticated non-human identities and short-lived scoped task grants.
- A policy engine such as OPA or Cedar for enforced checks on **every tool invocation**, with enforced approval binding to immutable request details.
- A contained tool-execution worker to perform one harmless real operation (e.g. create an issue in a synthetic GitHub demo repo), never against a customer or production account.
- A central, tamper-evident evidence stream with retention, telemetry and correlated spans; a public demo should still expose only synthetic or redacted records.
- Penetration testing, threat model, adversarial testing and independent verification before a sales claim of effective protection.

**Acceptance criterion for product promotion:** an unregistered agent's denied attempt and an approved agent's allowed action are verified end-to-end against a *disposable integrated service*, with complete correlated evidence and no paths around the policy gate. Do not re-label the current UI as that MVP.
