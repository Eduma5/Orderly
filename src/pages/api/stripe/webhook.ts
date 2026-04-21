// POST /api/stripe/webhook
// Webhook de Stripe para confirmar pagos completados
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!secretKey || !webhookSecret) {
    return new Response('Webhook not configured', { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('No signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.order_id;

    if (orderId) {
      // Marcar pedido como pagado
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_method: 'card',
          stripe_payment_id: paymentIntent.id,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Obtener datos del pedido para crear ticket
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (order) {
        const ticketItems = (order.order_items || []).map((item: any) => ({
          name: item.product_name,
          qty: item.quantity,
          price: item.unit_price,
        }));

        await supabase.from('tickets').insert({
          order_id: orderId,
          table_number: order.table_number,
          session_id: order.session_id,
          total: order.total,
          payment_method: 'card',
          items: ticketItems,
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
