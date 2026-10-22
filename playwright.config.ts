import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm start -- --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false,
    env: { CHAT_ENABLED: 'false', GEMINI_API_KEY: '', GOOGLE_GENERATIVE_AI_API_KEY: '', NEXT_TELEMETRY_DISABLED: '1' },
  },
})
