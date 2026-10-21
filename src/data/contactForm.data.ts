/**
 * ════════════════════════════════════════════════════════════════
 *  Datos de prueba — Formulario "Solicita una Demo" (GDW Health)
 * ════════════════════════════════════════════════════════════════
 */
export const QA_NAME = 'Lennin Alexander Martinez';

export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  cargo: string;
  pais: string;
  comentarios?: string;
}

/** Paso 5 — datos entregados en el enunciado (Empresa intencionalmente vacía) */
export const DATOS_PASO_5: ContactFormData = {
  nombre: 'John Smith Prueba',
  email: 'info@godoworks.com',
  telefono: '59895654785',
  empresa: '',
  cargo: 'Analista QA + IA',
  pais: 'Uruguay',
};

export const TEXTOS = {
  tituloFormularioEsperado: 'Solicite una demostración con un experto en Geogestión Empresarial',
  mensajeFaltanDatos: /Faltan datos\. Revisá los campos marcados\.?/,
  mensajeCaptcha: /no sos un robot/i,
  colorBordeError: 'rgb(239, 68, 68)',
} as const;

export const URLS = {
  soluciones: '/soluciones/',
  gdwHealth: '/gdw-health/',
  apiEnvio: '**/api/enviar**',
} as const;
