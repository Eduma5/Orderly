// ============================================
// API Endpoint — Envío REAL de emails via Nodemailer
// POST /api/email/send
// ============================================
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Configuración SMTP desde variables de entorno
const EMAIL_HOST = import.meta.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = Number(import.meta.env.EMAIL_PORT || 587);
const EMAIL_USER = import.meta.env.EMAIL_USER || '';
const EMAIL_PASS = import.meta.env.EMAIL_PASS || '';
const EMAIL_FROM = import.meta.env.EMAIL_FROM || EMAIL_USER || 'ORDERLY <noreply@orderly.app>';

// Crear transporter solo si hay credenciales
const transporter = EMAIL_USER && EMAIL_PASS
  ? nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: 'Faltan campos: to, subject, html' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Si no hay transporter configurado → modo demo
    if (!transporter) {
      console.log(`📩 [DEMO] Email simulado → ${to} | Asunto: ${subject}`);
      return new Response(JSON.stringify({
        ok: true,
        mode: 'demo',
        message: 'SMTP no configurado — email simulado en consola del servidor',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Envío real
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`✅ Email real enviado → ${to} | MessageId: ${info.messageId}`);

    return new Response(JSON.stringify({
      ok: true,
      mode: 'smtp',
      messageId: info.messageId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('❌ Error enviando email:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: err?.message || 'Error desconocido al enviar email',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
