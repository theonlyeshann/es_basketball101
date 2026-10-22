# Basketball 101 renovation audit

Baseline: `300fcb25f3d94011e5c3383b59bb3f46fa601e5d` (main).
Work branch: `feat/reliability-accessibility-audit`. Date: 2026-10-22.

## Initial inspection

| Area | Evidence in baseline | Priority |
| --- | --- | --- |
| Responsive UI | Chat has fixed 360px width plus 24px right offset; minimum message height 280px; no short-viewport containment | High |
| Accessibility | Close/send buttons unnamed; input uses placeholder only; no dialog semantics, Escape or focus handling; subpages start at h2; low-opacity text | High |
| Performance | `images.unoptimized: true` sends original images; README incorrectly says images are optimized | High |
| Chat reliability | Unvalidated JSON/roles/history, unlimited input, hard-coded model, no explicit deadline or cancellation, failed responses added to model context; mode switch can race a pending reply | High |
| Configuration | No environment example or enable switch; unused OpenAI dependency; generated `.next`, `.DS_Store` and TypeScript cache tracked (58 files) | High |
| Testing | No test script or tests; `next lint` requires interactive setup | High |

## Method and scope

Local production builds and Chromium at 320×568, 390×844 and 1440×900,
device scale factor 1. `scripts/audit.mjs` captures screenshots, image response
body bytes, chat bounds and axe WCAG A/AA findings. Browser contexts are fresh
and block all non-local network requests. Measurements concern this local run,
not field Core Web Vitals. Automated accessibility scans are not a complete
accessibility certification.

No provider credentials are read or supplied during validation. Live AI calls,
provider availability, answer quality and deployed infrastructure are outside
the verified scope. No paid service calls or deployment are part of this PR.

## Review stages

1. Build hygiene and reproducible checks.
2. Responsive layout, keyboard/focus behavior, contrast and image delivery.
3. Bounded chatbot endpoint, cancellation/error handling and regression coverage.
4. Measurements and review evidence.

Results and remaining limitations are recorded below.

## Measured results

| Check | Before | After |
| --- | --- | --- |
| Home image response body bytes (all 5 images, DPR 1) | 3,402,108 | 39,550 (98.8% lower) |
| Chat left edge at 320px width | −64px, clipped | 16px, contained |
| axe violation categories with chat open | 2 (3 affected nodes) | 0 |
| Home axe violation categories | 0 | 0 |
| First-load JS reported by Next (home) | 110 kB | 111 kB |
| Tracked generated files | 58 | 0 |
| Production npm audit finding counts | 12: 2 critical, 5 high, 5 low | 0 |
| Lint | Interactive configuration prompt, exit 1 | Noninteractive ESLint |

Image numbers match at all three measured widths. These are encoded response
body bytes, not total page-transfer bytes or a claim about real-user speed.
Browser contexts are new, but the server image cache may be warm. Image
optimization CPU time and cache misses were not benchmarked. The small JS
increase is retained for the tested reliability and accessibility behavior.
Build compilation times are recorded but not used as before/after speed claims,
because dependency installation and cache conditions differed.

[Before raw metrics](evidence/before/metrics.json) ·
[After raw metrics](evidence/after/metrics.json) ·
[Before build](evidence/build-before.txt) · [After build](evidence/build-after.txt)

### Screenshot evidence

| View | Before | After |
| --- | --- | --- |
| Mobile chat, 320×568 | [Before](evidence/before/chat-320.png) | [After](evidence/after/chat-320.png) |
| Mobile home, 320×568 | [Before](evidence/before/home-320.png) | [After](evidence/after/home-320.png) |
| Phone chat, 390×844 | [Before](evidence/before/chat-390.png) | [After](evidence/after/chat-390.png) |
| Phone home, 390×844 | [Before](evidence/before/home-390.png) | [After](evidence/after/home-390.png) |
| Desktop chat, 1440×900 | [Before](evidence/before/chat-1440.png) | [After](evidence/after/chat-1440.png) |
| Desktop home, 1440×900 | [Before](evidence/before/home-1440.png) | [After](evidence/after/home-1440.png) |

Home screenshots and archived baseline chat screenshots include the full page.
Final chat screenshots capture only the viewport: Chromium full-page capture
mispaints native top-layer dialog headers. The viewport captures were visually
checked. In the original full-page captures, the fixed background only paints
the initial viewport; this is not counted as a separate accessibility defect.
All geometry and image measurements use the stated original viewport sizes.

## Test scope and review notes

- Unit tests inject a fake generator and exercise validation, UTF-8 byte limits,
  configuration, instance quota, sanitized failures, timeout and cancellation.
- Browser tests cover all seven pages, images, headings, small-screen overflow,
  axe checks, keyboard focus/escape, skip navigation, mocked success, retry,
  empty/malformed/offline responses, mode changes, stopping and the disabled API.
- Repeated builds initially served stale HTML from `.next/server/route-cache`,
  including an earlier chat bundle. The build command now clears `.next` first;
  final browser checks and screenshots use a clean production build.
- Initial browser testing found focus could leave the dialog's document controls
  at the Tab boundary. Explicit forward/backward wrapping fixes it. Initial retry
  assertions also matched Next's route announcer; selectors now target chat alerts.
- No live provider calls were made. Provider answer quality, supported model access,
  account limits and deployed network/proxy behavior still require an approved
  live smoke test. AI stays off until explicitly configured.
- The original plain-text stream is replaced with a completed JSON reply so
  provider failure/truncation cannot masquerade as a successful empty/partial
  answer. This increases time to first visible answer; it is a deliberate tradeoff.
- An instance-only quota is not sufficient for a public multi-instance deployment
  or a hard spending budget. Shared rate limiting and provider budget controls
  must precede public AI enablement. Prompt instructions are not a security boundary.
- Chromium is tested; Safari, Firefox, real device keyboards and manual
  screen-reader testing remain outside this run. No accessibility certification
  or field Core Web Vitals improvement is claimed.
- Full dependency audit still reports **5 high development-tool findings**.
  The suggested automatic fix changes the framework lint-tool compatibility;
  this PR does not force that migration. Production audit reports zero findings.
  Public JSON evidence contains aggregate counts only. Detailed advisories and
  dependency paths were excluded after automatic publication review rejected
  exposing the full security reports. Run `npm audit` locally to inspect details.
- Pattern-based scanning of current source found no matching Gemini/OpenAI key
  strings. This is not a full-history secret audit or proof that no secret exists.

## Reproduce baseline separately

Use a disposable worktree/check-out at the baseline commit; never overwrite the
working branch. Install its locked dependencies and build without provider keys.
Copy the audit scripts and pinned browser tooling from this branch into that
throwaway directory, then run `node scripts/local-audit.mjs before`. The scripts
never submit a question and block non-local browser requests. Keep results in
the throwaway directory to avoid replacing the checked-in evidence.

Sources used for implementation: [AI SDK generation reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text),
[Google model lifecycle](https://ai.google.dev/gemini-api/docs/deprecations), and
the installed AI SDK 6 TypeScript definitions. The website's latest documentation
may describe a newer SDK major; installed types/build are the compatibility gate.

## Final validation

- `npm run lint`: pass, zero warnings.
- `npm run typecheck`: pass.
- `npm test`: **20 passed**, zero failed ([log](evidence/unit-tests.txt)).
- `npm run build`: pass from cleared generated output ([log](evidence/build-after.txt)).
- `npm run test:e2e`: **23 passed**, zero failed ([log](evidence/browser-tests.txt)).
- `npm run audit:ui -- after`: completed; zero measured axe violation categories.
- `npm audit --omit=dev`: zero findings ([JSON](evidence/dependencies-after.json)).
- Full dependency audit: 5 development-only high findings ([JSON](evidence/dependencies-including-dev.json)).
- `git diff --check`: pass. Original `Old Files/` content untouched.

No CI workflow, deployment, live AI request or merge was executed. All checks
were local. The repository's default branch remained at the recorded baseline
while the feature branch was prepared for review.
