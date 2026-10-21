import { test, expect } from '@playwright/test';
import { SolucionesPage } from '@pages/SolucionesPage';
import { GdwHealthPage } from '@pages/GdwHealthPage';
import { ContactFormPage } from '@pages/ContactFormPage';
import { DATOS_PASO_5, QA_NAME, TEXTOS } from '@data/contactForm.data';
import { scanPage } from '@utils/pageScanner';
import { log } from '@utils/logger';

/**
 * ════════════════════════════════════════════════════════════════
 *  CP-GDW-01 · Solicitud de demo GDW Health con "Empresa" vacía
 *  Flujo: pasos 1 a 7 del ejercicio práctico
 *  Autor: Lennin Alexander Martinez
 * ════════════════════════════════════════════════════════════════
 */
test.describe('GeoGestión · Soluciones > GDW Health > Solicita una Demo', () => {
  test('CP-GDW-01 · Validación obligatoria de "Nombre de la empresa"', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'autor', description: QA_NAME });
    log.banner('CP-GDW-01 · Solicitud de demo GDW Health');

    const soluciones = new SolucionesPage(page);
    const health = new GdwHealthPage(page);
    const form = new ContactFormPage(page);
    await soluciones.blockFormSubmissions();

    await test.step('Paso 1 · Levantar en Chrome la URL /soluciones/', async () => {
      await soluciones.open();
      await expect(page).toHaveTitle(/Soluciones/i);
      await soluciones.evidence(testInfo, 'paso1-soluciones');
    });

    await test.step('Extra · Escanear los elementos de la página Soluciones', async () => {
      const scan = await scanPage(page);
      await testInfo.attach('scan-soluciones.json', {
        body: JSON.stringify(scan, null, 2),
        contentType: 'application/json',
      });
      log.info(`Links: ${scan.links.length} · Botones: ${scan.buttons.length} · Inputs: ${scan.inputs.length}`);
      log.info(`Imágenes: ${scan.images.total} (sin alt: ${scan.images.withoutAlt}, rotas: ${scan.images.broken.length})`);
      if (scan.horizontalOverflowPx > 0) log.bug(`Overflow horizontal de ${scan.horizontalOverflowPx}px (ver BUG-GDW-007)`);
      expect(scan.images.broken, 'No debe haber imágenes rotas').toHaveLength(0);
      await expect(soluciones.gdwHealthVerSolucion).toBeVisible();
    });

    await test.step('Paso 2 · Click en la opción GDW Health', async () => {
      await soluciones.openGdwHealth();
      await health.assertLoaded();
      await health.evidence(testInfo, 'paso2-gdw-health');
    });

    await test.step('Paso 3 · Click en el botón Solicitar una demostración ("Solicita una Demo")', async () => {
      await health.clickSolicitaDemo();
    });

    await test.step('Paso 4 · Verificar que lleva al final de la página y muestra el formulario', async () => {
      await expect(page).toHaveURL(/#contacto$/);
      await expect(form.form).toBeInViewport();
      await expect(form.nombre).toBeVisible();
      // El enunciado espera otro título. Si no coincide, se deja registrado como BUG-GDW-002
      // en el reporte (anotación) y el flujo continúa. La validación estricta del título vive
      // en hallazgos-regresion.spec.ts (BUG-GDW-002), marcada como falla esperada.
      const actual = (await form.heading.innerText()).trim();
      log.info(`Título actual del formulario: "${actual}"`);
      if (actual !== TEXTOS.tituloFormularioEsperado) {
        log.bug(`BUG-GDW-002 · Se esperaba "${TEXTOS.tituloFormularioEsperado}"`);
        testInfo.annotations.push({
          type: 'BUG-GDW-002',
          description: `Título esperado: "${TEXTOS.tituloFormularioEsperado}". Título actual: "${actual}".`,
        });
      }
      await form.evidence(testInfo, 'paso4-formulario');
    });

    await test.step('Paso 5 · Completar los campos (Empresa vacía) y captcha Soy humano', async () => {
      await form.fill(DATOS_PASO_5);
      await expect(form.nombre).toHaveValue(DATOS_PASO_5.nombre);
      await expect(form.email).toHaveValue(DATOS_PASO_5.email);
      await expect(form.telefono).toHaveValue(DATOS_PASO_5.telefono);
      await expect(form.empresa).toHaveValue('');
      await expect(form.cargo).toHaveValue(DATOS_PASO_5.cargo);
      await expect(form.pais).toHaveValue(DATOS_PASO_5.pais);
      const manual = testInfo.project.metadata?.captchaManual === true;
      const marcado = await form.marcarCaptcha(manual);
      testInfo.annotations.push({ type: 'captcha', description: marcado ? 'Soy humano: marcado' : 'Soy humano: sin marcar (headless)' });
      await form.evidence(testInfo, 'paso5-formulario-diligenciado');
    });

    await test.step('Paso 6 · Click en "Enviar consulta"', async () => {
      await form.submit();
    });

    await test.step('Paso 7 · Verificar mensaje "Faltan datos. Revisá los campos marcados"', async () => {
      await expect(form.aviso).toBeVisible();
      await expect(form.aviso).toHaveText(TEXTOS.mensajeFaltanDatos);
      await expect(form.empresa).toHaveCSS('border-color', TEXTOS.colorBordeError);
      expect(await form.markedFields()).toContain('empresa');
      await form.evidence(testInfo, 'paso7-error-faltan-datos');
      log.ok('Mensaje de validación mostrado y campo Empresa marcado');
    });
  });
});
