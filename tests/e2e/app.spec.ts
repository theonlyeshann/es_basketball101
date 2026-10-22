import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:3000' ? route.continue() : route.abort())
})

for (const [width, height] of [[320, 568], [390, 844], [1440, 900], [844, 390]]) {
  test(`chat fits ${width}x${height}, has accessible controls and traps focus`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
    const dialog = page.getByRole('dialog', { name: 'Basketball 101 Coach' })
    await expect(dialog).toBeVisible()
    await expect(page.getByLabel('Your basketball question')).toBeFocused()
    const bounds = await dialog.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.y).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height)
    const send = await page.getByRole('button', { name: 'Send question' }).boundingBox()
    expect(send!.y + send!.height).toBeLessThanOrEqual(height)
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
    }
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations).toEqual([])
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Open basketball coach chat' })).toBeFocused()
  })
}

for (const path of ['/', '/fitness', '/dribbling', '/passing', '/shooting', '/basketball-iq', '/secret']) {
  test(`lesson ${path} renders accessibly without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('img').first().waitFor()
    await expect.poll(() => page.locator('img').first().evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    expect(await page.locator('img').first().getAttribute('src')).toContain('/_next/image')
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
    expect(errors).toEqual([])
  })
}

test('skip link moves keyboard focus to main content', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})

test('mocked success is rendered as text and next turn includes only successful conversation', async ({ page }) => {
  const bodies: unknown[] = []
  await page.route('**/api/chat', route => {
    bodies.push(route.request().postDataJSON())
    return route.fulfill({ json: { reply: 'Practice <script>alert(1)</script> form shooting.' } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
  await page.getByLabel('Your basketball question').fill('Help with shooting')
  await page.getByRole('button', { name: 'Send question' }).click()
  await expect(page.getByRole('log')).toContainText('<script>alert(1)</script>')
  await page.getByLabel('Your basketball question').fill('What next?')
  await page.getByRole('button', { name: 'Send question' }).click()
  await expect.poll(() => bodies.length).toBe(2)
  expect(bodies[1]).toMatchObject({ mode: 'skills', messages: [
    { role: 'user', content: 'Help with shooting' },
    { role: 'assistant', content: 'Practice <script>alert(1)</script> form shooting.' },
    { role: 'user', content: 'What next?' },
  ] })
})

for (const status of [429, 502, 503, 504]) {
  test(`HTTP ${status} keeps draft and allows a clean retry`, async ({ page }) => {
    let count = 0
    await page.route('**/api/chat', route => {
      count++
      if (count === 1) return route.fulfill({ status, json: { error: 'must not be displayed' } })
      expect(route.request().postDataJSON().messages).toHaveLength(1)
      return route.fulfill({ json: { reply: 'Try ten form shots.' } })
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
    await page.getByLabel('Your basketball question').fill('Help me shoot')
    await page.getByRole('button', { name: 'Send question' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('alert')).not.toContainText('must not be displayed')
    await expect(page.getByLabel('Your basketball question')).toHaveValue('Help me shoot')
    await page.getByRole('button', { name: 'Send question' }).click()
    await expect(page.getByRole('log')).toContainText('Try ten form shots.')
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
}

test('mode changes discard stale responses and clear history', async ({ page }) => {
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/chat', async route => {
    await waiting
    await route.fulfill({ json: { reply: 'Stale response' } }).catch(() => {})
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
  await page.getByLabel('Your basketball question').fill('Help me shoot')
  const started = page.waitForRequest('**/api/chat')
  await page.getByRole('button', { name: 'Send question' }).click()
  await started
  await page.getByRole('button', { name: 'My Roadmap' }).click()
  release()
  await expect(page.getByRole('button', { name: 'My Roadmap' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('Your basketball question')).toHaveValue('')
  await expect(page.getByRole('log')).not.toContainText('Stale response')
})

test('real local endpoint is disabled without a provider call', async ({ request }) => {
  const response = await request.post('/api/chat', { data: { mode: 'skills', messages: [{ role: 'user', content: 'Test' }] } })
  expect(response.status()).toBe(503)
})

for (const failure of ['network', 'empty', 'malformed']) {
  test(`${failure} response is recoverable`, async ({ page }) => {
    await page.route('**/api/chat', route => failure === 'network' ? route.abort() : failure === 'empty' ? route.fulfill({ json: { reply: '' } }) : route.fulfill({ contentType: 'application/json', body: '{broken' }))
    await page.goto('/')
    await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
    await page.getByLabel('Your basketball question').fill('Help me shoot')
    await page.getByRole('button', { name: 'Send question' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByLabel('Your basketball question')).toHaveValue('Help me shoot')
    await expect(page.getByRole('button', { name: 'Send question' })).toBeEnabled()
  })
}

test('stop cancels pending reply without losing the draft', async ({ page }) => {
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/chat', async route => {
    await waiting
    await route.fulfill({ json: { reply: 'Stale response' } }).catch(() => {})
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
  await page.getByLabel('Your basketball question').fill('Help me shoot')
  await page.getByRole('button', { name: 'Send question' }).click()
  await page.getByRole('button', { name: 'Stop response' }).click()
  release()
  await expect(page.getByRole('alert')).toContainText('Request stopped')
  await expect(page.getByLabel('Your basketball question')).toHaveValue('Help me shoot')
  await expect(page.getByRole('log')).not.toContainText('Stale response')
})
