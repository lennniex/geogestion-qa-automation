import { Page } from '@playwright/test';

/**
 * ════════════════════════════════════════════════════════════════
 *  Paso 2 — Escaneo de todos los campos/elementos de la página
 *  Devuelve un inventario que se adjunta al reporte HTML.
 * ════════════════════════════════════════════════════════════════
 */
export interface PageScan {
  url: string;
  title: string;
  lang: string;
  viewportWidth: number;
  documentWidth: number;
  horizontalOverflowPx: number;
  headings: string[];
  links: { text: string; href: string }[];
  buttons: string[];
  inputs: { tag: string; type: string; name: string; label: string; required: boolean }[];
  images: { total: number; withoutAlt: number; broken: string[] };
}

export async function scanPage(page: Page): Promise<PageScan> {
  return page.evaluate(() => {
    const visible = (e: Element): boolean => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const imgs = Array.from(document.querySelectorAll('img'));
    const docW = document.documentElement.scrollWidth;
    return {
      url: location.href,
      title: document.title,
      lang: document.documentElement.lang,
      viewportWidth: window.innerWidth,
      documentWidth: docW,
      horizontalOverflowPx: Math.max(0, docW - window.innerWidth),
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(
        (h) => `${h.tagName}: ${(h as HTMLElement).innerText.trim().replace(/\s+/g, ' ')}`,
      ),
      links: Array.from(document.querySelectorAll('a'))
        .filter(visible)
        .map((a) => ({ text: (a as HTMLElement).innerText.trim(), href: a.getAttribute('href') ?? '' })),
      buttons: Array.from(document.querySelectorAll('button,[role=button]'))
        .filter(visible)
        .map((b) => (b as HTMLElement).innerText.trim() || b.getAttribute('aria-label') || '(sin texto)'),
      inputs: Array.from(document.querySelectorAll('input,select,textarea'))
        .filter((e) => (e as HTMLInputElement).type !== 'hidden')
        .map((e) => {
          const el = e as HTMLInputElement;
          return {
            tag: el.tagName,
            type: el.type,
            name: el.name,
            label: el.labels?.[0]?.innerText.trim() ?? '',
            required: el.required,
          };
        }),
      images: {
        total: imgs.length,
        withoutAlt: imgs.filter((i) => !i.alt).length,
        broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      },
    };
  });
}
