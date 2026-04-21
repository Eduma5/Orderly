import 'stripe';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  {
    return new Response(
      JSON.stringify({ error: "Stripe no está configurado. Añade STRIPE_SECRET_KEY en el panel de admin." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
