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

Results and remaining limitations are recorded below after execution.
