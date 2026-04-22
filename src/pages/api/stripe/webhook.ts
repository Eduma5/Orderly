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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.type === 'wallet_recharge') {
      const sessionId = session.metadata.session_id;
      const amountStr = session.metadata.amount;
      if (sessionId && amountStr) {
        const amount = Number(amountStr);
        // 1. Check if wallet exists
        const { data: w } = await supabase.from('wallets').select('balance').eq('session_id', sessionId).single();
        
        let newBalance = amount;
        if (w) {
          newBalance = Math.round((Number(w.balance) + amount) * 100) / 100;
          await supabase.from('wallets').update({ balance: newBalance }).eq('session_id', sessionId);
        } else {
          await supabase.from('wallets').insert({ session_id: sessionId, balance: newBalance });
        }
        
        // 2. Insert transaction
        await supabase.from('wallet_transactions').insert({
          session_id: sessionId,
          type: 'recharge',
          amount: amount,
          description: `Recarga de Monedero por Stripe (${amount}€)`,
          stripe_payment_id: session.payment_intent as string || session.id
        });
        
        console.log(`Recargado monedero para ${sessionId}: +${amount}€`);
      }
    }
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
