import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { log } from '@utils/logger';

/**
 * ════════════════════════════════════════════════════════════════
 *  /gdw-health/ — landing de la solución GDW Health
 * ════════════════════════════════════════════════════════════════
 */
export class GdwHealthPage extends BasePage {
  readonly title: Locator;
  /** Botón del cuerpo (bajo "GoDoWorks en cifras"); el del header apunta a "/#contacto" (home). */
  readonly solicitaDemoButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1, name: 'GDW Health' });
    this.solicitaDemoButton = page.locator('a[href="#contacto"]').filter({ hasText: /Solicita una Demo/i });
  }

  async assertLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  async clickSolicitaDemo(): Promise<void> {
    log.step('Click en "Solicita una Demo"');
    await this.solicitaDemoButton.scrollIntoViewIfNeeded();
    await this.solicitaDemoButton.click();
    await this.page.waitForURL(/#contacto$/);
  }
}
