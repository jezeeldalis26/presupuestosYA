import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/smoke',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: 1,
  reporter: [['list']],
  use: { baseURL: process.env.LIVE_URL ?? 'https://presupuestosya-e5962.web.app', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  workers: 1,
})
