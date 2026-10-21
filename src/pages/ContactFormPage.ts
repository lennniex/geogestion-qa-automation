import { FrameLocator, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ContactFormData } from '@data/contactForm.data';
import { log } from '@utils/logger';

/**
 * ════════════════════════════════════════════════════════════════
 *  Sección #contacto — formulario "Solicita una Demo"
 * ════════════════════════════════════════════════════════════════
 */
export class ContactFormPage extends BasePage {
  readonly section: Locator;
  readonly heading: Locator;
  readonly form: Locator;
  readonly nombre: Locator;
  readonly email: Locator;
  readonly telefono: Locator;
  readonly empresa: Locator;
  readonly cargo: Locator;
  readonly pais: Locator;
  readonly comentarios: Locator;
  readonly enviar: Locator;
  readonly aviso: Locator;
  readonly captchaFrame: FrameLocator;
  readonly privacyNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.section = page.locator('section#contacto');
    this.heading = this.section.getByRole('heading').first();
    this.form = this.section.locator('form.fm');
    this.nombre = this.form.locator('[name="nombre"]');
    this.email = this.form.locator('[name="email"]');
    this.telefono = this.form.locator('[name="telefono"]');
    this.empresa = this.form.locator('[name="empresa"]');
    this.cargo = this.form.locator('[name="cargo"]');
    this.pais = this.form.locator('[name="pais"]');
    this.comentarios = this.form.locator('[name="mensaje"]');
    this.enviar = this.form.getByRole('button', { name: /Enviar consulta/i });
    this.aviso = this.form.locator('.fm__aviso');
    this.captchaFrame = page.frameLocator('iframe[src*="hcaptcha"]').first();
    this.privacyNotice = this.section.getByText(/política de privacidad/i);
  }

  async fill(data: ContactFormData): Promise<void> {
    log.step('Completando formulario');
    await this.nombre.fill(data.nombre);
    await this.email.fill(data.email);
    await this.telefono.fill(data.telefono);
    await this.empresa.fill(data.empresa);
    await this.cargo.fill(data.cargo);
    await this.pais.fill(data.pais);
    if (data.comentarios !== undefined) await this.comentarios.fill(data.comentarios);
  }

  /**
   * Captcha "Soy humano" (hCaptcha).
   * Un captcha real está hecho para que lo resuelva una persona, así que no se "salta" por código:
   *  - manual = true  → Chrome visible: el test se detiene hasta que el tester marca "Soy humano".
   *  - HCAPTCHA_TEST_MODE=1 → entorno QA con la sitekey de prueba de hCaptcha: el click es automático.
   *  - en otro caso (headless/CI) se deja sin marcar y se avisa en el log.
   */
  async marcarCaptcha(manual: boolean, esperaMs = 180_000): Promise<boolean> {
    if (process.env.HCAPTCHA_TEST_MODE === '1') {
      await this.captchaFrame.locator('#checkbox').click();
      log.ok('Captcha marcado (sitekey de prueba de hCaptcha)');
      return true;
    }
    if (!manual) {
      log.warn('Captcha sin marcar: ejecución headless. Usa "npm run test:captcha" para marcarlo a mano.');
      return false;
    }
    log.info('👤 Marca el captcha "Soy humano" en la ventana de Chrome. El test continúa solo cuando esté marcado...');
    await this.captchaFrame.locator('#checkbox').scrollIntoViewIfNeeded().catch(() => undefined);
    await this.page.waitForFunction(
      () => {
        const t = document.querySelector<HTMLTextAreaElement>('[name="h-captcha-response"]');
        return !!t && t.value.length > 0;
      },
      undefined,
      { timeout: esperaMs, polling: 500 },
    );
    log.ok('Captcha "Soy humano" marcado por el tester');
    return true;
  }

  async submit(): Promise<void> {
    log.step('Click en "Enviar consulta"');
    await this.enviar.click();
  }

  /** Campos marcados en rojo por la validación del cliente */
  async markedFields(): Promise<string[]> {
    return this.form.evaluate((f, red) => {
      return Array.from((f as HTMLFormElement).elements)
        .filter((e) => getComputedStyle(e).borderColor === red)
        .map((e) => (e as HTMLInputElement).name);
    }, 'rgb(239, 68, 68)');
  }
}
