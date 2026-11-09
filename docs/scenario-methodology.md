# Executive Impact Studio — Calculation & Disclosure

## Purpose
This is a live *scenario calculator* to encourage rigorous C-suite conversations. It does **not** ingest DAEDORYX customer telemetry. No numbers shown are claims about product efficacy, customer ROI, workforce reductions, audited controls, or implementation maturity.

## Default inputs
| Input | Default | User-adjustable range |
| --- | ---: | ---: |
| Work items / month | 15,000 | 1,000–100,000 |
| Baseline minutes / item | 18 | 5–60 |
| Workload coverage | 45% | 10–90% |
| Time reduction on covered work | 35% | 10–75% |
| Fully loaded hourly cost | USD 55 | USD 25–200 |
| Assumed annual operating cost | USD 150,000 | USD 25,000–500,000 |

## Formulas
- Monthly baseline hours = (items/month × minutes/item)/60.
- Annual baseline hours = monthly baseline hours × 12.
- Annual released hours = annual baseline hours × coverage × reduction.
- Baseline time released percent = coverage × reduction.
- Annual capacity value = annual released hours × loaded hourly cost.
- Conditional modeled net value = annual capacity value − assumed annual operating cost.
- Conditional modeled ROI = net value / annual operating cost × 100%.
- Simple payback = annual operating cost / (annual capacity value / 12), months (not displayed).

## Default outputs
- Baseline 4,500 hours per month / 54,000 per year.
- Released time 708.75 monthly / 8,505 annually.
- Annual capacity value USD 467,775.
- Conditional annual net value USD 317,775.
- Conditional ROI 211.85% (displayed 212%).

## Limitations
- The user assumes covered tasks are eligible and that average time reduction actually occurs.
- Quality, rework, compliance, staff training, model inference fees, tooling, process redesign, and rollout effort can change the economics.
- A saved hour is *capacity*, not cash. Capacity value becomes cashable only with a validated benefits-realization mechanism.
- The annual operating cost slider is not DAEDORYX pricing.
- The governance stage count is a reference architecture count, not a measured control effectiveness or certification.
- Never combine these outputs with language like “DAEDORYX saves X%” or “customer-proven ROI.”

## Evidence required for customer claims
Independent pilot, measured pre/post task volumes and quality, audited costs, adoption rates, sampling, customer permission for a case study, and attribution analysis.
