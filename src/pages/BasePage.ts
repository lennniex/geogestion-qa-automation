import { Page, TestInfo } from '@playwright/test';
import { log } from '@utils/logger';
import { URLS } from '@data/contactForm.data';

/**
 * ════════════════════════════════════════════════════════════════
 *  BasePage — comportamiento común a todas las páginas
 * ════════════════════════════════════════════════════════════════
 */
export abstract class BasePage {
  protected readonly consoleErrors: string[] = [];

  constructor(protected readonly page: Page) {
    page.on('pageerror', (err) => this.consoleErrors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') this.consoleErrors.push(`console.error: ${msg.text()}`);
    });
  }

  /** Red de seguridad: ninguna prueba envía leads reales al endpoint del formulario. */
  async blockFormSubmissions(): Promise<void> {
    await this.page.route(URLS.apiEnvio, (route) => {
      log.warn(`Envío interceptado y abortado: ${route.request().method()} ${route.request().url()}`);
      return route.abort();
    });
  }

  async goto(path: string): Promise<void> {
    log.step(`Navegando a ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async evidence(testInfo: TestInfo, name: string): Promise<void> {
    const body = await this.page.screenshot({ fullPage: false });
    await testInfo.attach(name, { body, contentType: 'image/png' });
  }

  getConsoleErrors(): string[] {
    return [...this.consoleErrors];
  }
}
