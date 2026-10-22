# Basketball 101

A basketball fundamentals site built with Next.js, React and TypeScript. Learn
fitness, dribbling, passing, shooting and basketball IQ, with an optional AI coach.
The original high-school HTML/CSS site remains in `Old Files/`.

## Run locally

Use Node.js 22 or 24 and npm:

```sh
npm ci
npm run dev
```

Development runs at http://localhost:5000. For a production build:

```sh
npm run build
npm start
```

Production runs at http://localhost:3000. Lessons work without any credentials.
`npm run build` first removes generated `.next` output to prevent stale route
caches. Stop any server using that output before rebuilding.
Image optimization requires a Next.js server; this is not a static-export build.

## Optional AI coach

Copy `.env.example` to `.env.local`. Leave `CHAT_ENABLED=false` unless live AI
usage has been approved. To enable it, set all three server-only variables:

- `CHAT_ENABLED=true`
- `GEMINI_API_KEY`: your server-side Google Gemini API key
- `GEMINI_MODEL`: a currently supported model available to your account

Do not put secrets in client code, `NEXT_PUBLIC_*` variables, screenshots or git.
Check [Google's model lifecycle](https://ai.google.dev/gemini-api/docs/deprecations)
and account costs before choosing a model. There is intentionally no hard-coded
fallback model. A missing key, model or enable flag produces a friendly 503.

The API validates JSON, message roles/order, mode, UTF-8 body size (32 KiB),
question length (2,000 characters), history (11 messages / 20,000 characters),
and completed replies. It limits output to 768 tokens, disables automatic
provider retries, imposes a 25-second generation deadline and forwards
cancellation. The client has a 28-second fallback deadline and keeps a failed
question ready to retry. Closing chat, stopping, resetting or changing mode
cancels the pending request. Conversations stay in memory and are cleared by a
page reload. Submitted questions/history are sent to Google when AI is enabled.

Replies arrive as one completed JSON response instead of token streaming. This
lets the server reject provider errors and truncated answers before displaying
an answer. The tradeoff is a longer wait before the first visible answer; a
status message and Stop button remain available.

An instance-wide ceiling permits 10 generation attempts per minute. **This is
not a global spending cap or a distributed rate limiter.** Before public AI
activation, configure shared gateway quotas and provider billing limits; review
the deployment's proxy/origin behavior. No live model quality, billing or
production hosting behavior is claimed by the local tests.

## Checks and evidence

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run audit:ui -- after
npm audit --omit=dev
```

Browser tests start their own production server with AI disabled and block
external requests. Success/failure chat scenarios use local mocks. `npm test`
uses an injected fake generator; no test needs or uses an API key.

See [the audit and measurements](docs/AUDIT.md), including before/after screenshots.
The audit helper starts its own local server; `node scripts/audit.mjs after`
can instead target an already running server via `AUDIT_URL`.

Next.js is pinned to a patched 15.x release. The PostCSS 8.5.31 override replaces
Next's old transitive PostCSS pin, and the Playwright core override keeps axe's
browser types aligned with the test runner. Both are locked and tested. Build
output, environment files and TypeScript caches are ignored; don't commit them.
