/**
 * ════════════════════════════════════════════════════════════════
 *  Logger con prefijos emoji (estilo del equipo QA)
 * ════════════════════════════════════════════════════════════════
 */
const ts = (): string =>
  new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour12: false });

export const log = {
  banner: (title: string): void => {
    const line = '═'.repeat(64);
    console.log(`\n${line}\n  ${title}\n${line}`);
  },
  step: (msg: string): void => console.log(`🔹 [${ts()}] ${msg}`),
  ok: (msg: string): void => console.log(`✅ [${ts()}] ${msg}`),
  warn: (msg: string): void => console.log(`⚠️  [${ts()}] ${msg}`),
  bug: (msg: string): void => console.log(`🐞 [${ts()}] ${msg}`),
  info: (msg: string): void => console.log(`ℹ️  [${ts()}] ${msg}`),
};
