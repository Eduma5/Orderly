import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_0IadgrTN.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_zzDEcozS.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "ORDERLY - Carta Digital", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="landing" data-astro-cid-j7pv25f6> <div class="content" data-astro-cid-j7pv25f6> <h1 class="logo" data-astro-cid-j7pv25f6>ORDERLY</h1> <p class="subtitle" data-astro-cid-j7pv25f6>Sistema de pedidos digital</p> <p class="desc" data-astro-cid-j7pv25f6>
Escanea el código QR de tu mesa para ver el menú y hacer tu pedido.
</p> <div class="links" data-astro-cid-j7pv25f6> <a href="/mesa/1" class="btn btn-primary btn-lg" data-astro-cid-j7pv25f6>Demo Mesa 1</a> <a href="/admin" class="btn btn-outline btn-lg" data-astro-cid-j7pv25f6>Panel Admin</a> </div> </div> </div> ` })} `;
}, "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/index.astro", void 0);

const $$file = "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
