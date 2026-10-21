import { test, expect, Page } from '@playwright/test';
import { SolucionesPage } from '@pages/SolucionesPage';
import { ContactFormPage } from '@pages/ContactFormPage';
import { ContactFormData, TEXTOS, URLS } from '@data/contactForm.data';
import { scanPage } from '@utils/pageScanner';

/**
 * ════════════════════════════════════════════════════════════════
 *  Suite de regresión de hallazgos (BUG-GDW-xxx)
 *  Cada test afirma el comportamiento CORRECTO y está marcado con
 *  test.fail() mientras el bug siga abierto: la suite queda en verde
 *  y avisa ("expected to fail but passed") cuando el bug se corrige.
 *  Todas las pruebas de formulario abortan el POST a /api/enviar.
 * ════════════════════════════════════════════════════════════════
 */
const VALIDOS: ContactFormData = {
  nombre: 'John Smith Prueba',
  email: 'info@godoworks.com',
  telefono: '59895654785',
  empresa: 'QA Test',
  cargo: 'Analista QA + IA',
  pais: 'Uruguay',
};

async function abrirFormulario(page: Page): Promise<ContactFormPage> {
  const form = new ContactFormPage(page);
  await form.blockFormSubmissions();
  await form.goto(`${URLS.gdwHealth}#contacto`);
  await expect(form.form).toBeVisible();
  return form;
}

async function enviarCon(page: Page, override: Partial<ContactFormData>): Promise<ContactFormPage> {
  const form = await abrirFormulario(page);
  await form.fill({ ...VALIDOS, ...override });
  await form.submit();
  await expect(form.aviso).toBeVisible();
  return form;
}

test.describe('Hallazgos · formulario Solicita una Demo', () => {
  test('BUG-GDW-002 · El título del formulario es el del enunciado', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-002');
    const form = await abrirFormulario(page);
    await expect(form.heading).toHaveText(TEXTOS.tituloFormularioEsperado);
  });

  test('BUG-GDW-003 · Teléfono no debe aceptar letras', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-003');
    const form = await enviarCon(page, { telefono: 'abcdef' });
    expect(await form.markedFields()).toContain('telefono');
  });

  test('BUG-GDW-003b · Teléfono no debe aceptar 1 dígito', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-003');
    const form = await enviarCon(page, { telefono: '1' });
    expect(await form.markedFields()).toContain('telefono');
  });

  test('BUG-GDW-004 · Email sin dominio de nivel superior debe rechazarse', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-004');
    const form = await enviarCon(page, { email: 'info@godoworks' });
    expect(await form.markedFields()).toContain('email');
  });

  test('BUG-GDW-005 · Nombre con solo espacios debe rechazarse', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-005');
    const form = await enviarCon(page, { nombre: '   ' });
    expect(await form.markedFields()).toContain('nombre');
  });

  test('BUG-GDW-006 · Faltante de captcha debe informarse junto con los campos vacíos', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-006');
    const form = await enviarCon(page, { empresa: '' });
    await expect(form.aviso).toHaveText(TEXTOS.mensajeCaptcha);
  });

  test('BUG-GDW-001 · Campo con error debe tener aria-invalid y texto descriptivo', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-001');
    const form = await enviarCon(page, { empresa: '' });
    await expect(form.empresa).toHaveAttribute('aria-invalid', 'true');
    await expect(form.empresa).toHaveAttribute('aria-describedby', /.+/);
  });

  test('BUG-GDW-012 · "política de privacidad" debe enlazar al documento', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-012');
    const form = await abrirFormulario(page);
    await expect(form.section.getByRole('link', { name: /política de privacidad/i })).toBeVisible();
  });
});

test.describe('Hallazgos · página Soluciones', () => {
  // Ancho en el que se reprodujo el desbordamiento (ventana Chrome 1223x945)
  test.use({ viewport: { width: 1223, height: 945 } });

  test('BUG-GDW-007 · Sin desbordamiento horizontal a 1223px', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-007');
    const sol = new SolucionesPage(page);
    await sol.open();
    const scan = await scanPage(page);
    expect(scan.horizontalOverflowPx).toBe(0);
  });

  test('BUG-GDW-009 · Sin excepciones JavaScript no controladas', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-009');
    const sol = new SolucionesPage(page);
    await sol.open();
    await page.waitForLoadState('networkidle');
    expect(sol.getConsoleErrors()).toEqual([]);
  });

  test('BUG-GDW-010 · Todas las imágenes deben tener texto alternativo', async ({ page }) => {
    test.fail(true, 'Bug abierto BUG-GDW-010');
    const sol = new SolucionesPage(page);
    await sol.open();
    const scan = await scanPage(page);
    expect(scan.images.withoutAlt).toBe(0);
  });
});
