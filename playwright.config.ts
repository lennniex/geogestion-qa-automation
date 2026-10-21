import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/** Usa Google Chrome si está instalado; si no, el Chromium de Playwright (npx playwright install chromium). */
function chromeChannel(): { channel?: string } {
  if (process.env.PW_CHANNEL) return process.env.PW_CHANNEL === 'chromium' ? {} : { channel: process.env.PW_CHANNEL };
  const candidatos = [
    path.join(process.env['PROGRAMFILES'] ?? 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['LOCALAPPDATA'] ?? '', 'Google/Chrome/Application/chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/opt/google/chrome/chrome',
  ];
  const hayChrome = candidatos.some((c) => { try { return fs.existsSync(c); } catch { return false; } });
  if (!hayChrome) console.warn('⚠️  No se encontró Google Chrome: se usará el Chromium de Playwright.');
  return hayChrome ? { channel: 'chrome' } : {};
}
const CHROME = chromeChannel();

/**
 * ════════════════════════════════════════════════════════════════
 *  GeoGestión · GoDoWorks — Configuración Playwright
 *  Autor: Lennin Alexander Martinez (Senior QA Automation)
 * ════════════════════════════════════════════════════════════════
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  outputDir: 'reports/test-results',
  use: {
    baseURL: 'https://www.godoworks.com',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    viewport: { width: 1366, height: 768 },
    screenshot: 'on',
    // El video necesita ffmpeg (npx playwright install ffmpeg). Se activa con PW_VIDEO=1.
    video: process.env.PW_VIDEO === '1' ? 'retain-on-failure' : 'off',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      // Paso 1: "Levantar en el navegador Chrome" → canal Google Chrome estable
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], ...CHROME, viewport: { width: 1366, height: 768 } },
    },
    {
      // Flujo completo con captcha: Chrome visible; el test espera a que la persona marque "Soy humano".
      name: 'chrome-captcha',
      testMatch: /solicitud-demo-gdw-health\.spec\.ts/,
      timeout: 240_000,
      metadata: { captchaManual: true },
      use: { ...devices['Desktop Chrome'], ...CHROME, viewport: { width: 1366, height: 768 }, headless: false },
    },
  ],
});
