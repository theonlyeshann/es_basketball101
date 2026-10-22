import { rm } from 'node:fs/promises'

// Discard stale generated route/asset caches before creating a production build.
await rm(new URL('../.next', import.meta.url), { recursive: true, force: true })
