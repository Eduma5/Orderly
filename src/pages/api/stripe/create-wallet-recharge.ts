import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request, url }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return new Response(JSON.stringify({ error: 'Stripe no está configurado.' }), { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  try {
    const body = await request.json();
    const { amount, sessionId } = body;

    if (!amount || amount < 1 || !sessionId) {
      return new Response(JSON.stringify({ error: 'Cantidad o sesión inválida' }), { status: 400 });
    }

    const { origin } = url; // para armar return URL a la mesa actual
    
    // Crear una sesión de Stripe Checkout para la recarga
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Recarga Monedero ORDERLY' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('referer') || origin}?recharge=success`,
      cancel_url: `${request.headers.get('referer') || origin}?recharge=cancel`,
      metadata: {
        type: 'wallet_recharge',
        session_id: sessionId,
        amount: amount,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (error: any) {
    console.error('Error al crear checkout de recarga:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
