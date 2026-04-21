// POST /api/stripe/create-intent
// Crea un PaymentIntent de Stripe para pagar un pedido con tarjeta
import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return new Response(
      JSON.stringify({ error: 'Stripe no está configurado. Añade STRIPE_SECRET_KEY en el panel de admin.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    const body = await request.json();
    const { amount, orderId, tableNumber } = body;

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Importe inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stripe espera el importe en céntimos
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        order_id: orderId || '',
        table_number: String(tableNumber || ''),
        source: 'ema_app',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Stripe error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Error al crear el pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
