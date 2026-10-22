import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'

// Run against a local production server; never send a prompt to a real provider.
const stage = process.argv[2] || 'after'
const baseURL = process.env.AUDIT_URL || 'http://127.0.0.1:3000'
const directory = `docs/evidence/${stage}`
await mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const results = []
for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.origin === new URL(baseURL).origin ? route.continue() : route.abort()
  })
  const page = await context.newPage()
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${directory}/home-${width}.png`, fullPage: true })
  const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  const performance = await page.evaluate(() => ({
    imageBytes: window.performance.getEntriesByType('resource').filter(r => r.initiatorType === 'img').reduce((n, r) => n + r.encodedBodySize, 0),
    images: Array.from(document.images).map(i => ({ src: i.currentSrc, width: i.naturalWidth })),
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
  }))
  await page.getByRole('button', { name: 'Open basketball coach chat' }).click()
  await page.screenshot({ path: `${directory}/chat-${width}.png`, fullPage: false })
  const chat = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  const bounds = await page.locator('form').evaluate(el => {
    const r = (el.closest('dialog') || el.parentElement).getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
  })
  const summarize = audit => audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
  results.push({ width, height, ...performance, chatBounds: bounds, homeViolations: summarize(home), chatViolations: summarize(chat) })
  await context.close()
}
await browser.close()
await writeFile(`${directory}/metrics.json`, JSON.stringify(results, null, 2) + '\n')
console.log(JSON.stringify(results, null, 2))
