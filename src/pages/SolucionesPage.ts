import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { URLS } from '@data/contactForm.data';
import { log } from '@utils/logger';

/**
 * ════════════════════════════════════════════════════════════════
 *  /soluciones/ — "Las diez soluciones de GoDoWorks"
 * ════════════════════════════════════════════════════════════════
 */
export class SolucionesPage extends BasePage {
  readonly heroTitle: Locator;
  readonly gdwHealthCardTitle: Locator;
  readonly gdwHealthVerSolucion: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.getByRole('heading', { level: 1, name: /Las diez soluciones/i });
    // filter visible: excluye el ítem "GDW Health" oculto en el submenú Soluciones
    this.gdwHealthCardTitle = page.getByText('GDW Health', { exact: true }).filter({ visible: true }).first();
    this.gdwHealthVerSolucion = page
      .locator(`a[href="${URLS.gdwHealth}"]`)
      .filter({ hasText: 'Ver la solución' });
  }

  async open(): Promise<void> {
    await this.goto(URLS.soluciones);
    await expect(this.heroTitle).toBeVisible();
    log.ok('Página Soluciones cargada');
  }

  async openGdwHealth(): Promise<void> {
    log.step('Click en la opción GDW Health');
    await this.gdwHealthCardTitle.scrollIntoViewIfNeeded();
    await this.gdwHealthCardTitle.click();
    await this.page.waitForURL(`**${URLS.gdwHealth}`);
    log.ok('Navegó a GDW Health');
  }
}
