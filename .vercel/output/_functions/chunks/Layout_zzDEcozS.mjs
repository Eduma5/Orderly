import { e as createComponent, g as addAttribute, l as renderHead, n as renderSlot, r as renderTemplate, h as createAstro } from './astro/server_0IadgrTN.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "ORDERLY - Carta Digital" } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet"><meta name="generator"${addAttribute(Astro2.generator, "content")}><meta name="description" content="ORDERLY - Sistema de pedidos digital"><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/Usuario/Desktop/Tfg_EMA/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
