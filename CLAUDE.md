# Claude Code Working Agreement

Follow the canonical rules in [AGENTS.md](AGENTS.md) without exception.

Claude Code and OpenCode may work in parallel only on separate files/branches and must integrate through reviewed PRs.

Use the static site architecture already present. Do not replace it with a heavier framework unless a specific, documented requirement justifies that decision.

The C-suite economic simulator is a *scenario engine*, not evidence of realized DAEDORYX value. Its source of truth is `model.mjs`. Add or update tests when changing its formulas.

UI work should preserve the DAEDORYX identity: dark navy surfaces, cyan and violet light, architecture-oriented visualization, clear executive copy, accessible interactive elements, and keyboard-operable event mode.

Do not invent production APIs, email addresses, company addresses, subscription prices, adoption metrics, audit certifications, investors, or customer outcomes.

Run `node --test tests/*.test.mjs` and `node scripts/validate-site.mjs` before proposing a PR. Explicitly report any validation that could not be run.
