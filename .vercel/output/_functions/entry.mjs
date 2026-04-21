import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D1sdus4L.mjs';
import { manifest } from './manifest_ChGQkQD_.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/email/send.astro.mjs');
const _page3 = () => import('./pages/api/stripe/create-intent.astro.mjs');
const _page4 = () => import('./pages/api/stripe/webhook.astro.mjs');
const _page5 = () => import('./pages/grupo/_id_.astro.mjs');
const _page6 = () => import('./pages/mesa/_mesa_.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/email/send.ts", _page2],
    ["src/pages/api/stripe/create-intent.ts", _page3],
    ["src/pages/api/stripe/webhook.ts", _page4],
    ["src/pages/grupo/[id].astro", _page5],
    ["src/pages/mesa/[mesa].astro", _page6],
    ["src/pages/index.astro", _page7]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "57e1eadb-a296-4686-90dc-e13138d9c5c4",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
