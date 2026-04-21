// ============================================
// Servicio de Email — Real (Nodemailer) + fallback demo
// ============================================
// Intenta enviar vía /api/email/send (Nodemailer SMTP).
// Si falla o no está configurado, hace fallback a modo demo
// (log en consola + almacenamiento en localStorage).
// ============================================

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  status: 'sent' | 'failed';
  mode: 'smtp' | 'demo';
}

// ---- Almacén local de emails (para historial / debug) ----
function getEmailLog(): EmailMessage[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('ema_email_log');
  return raw ? JSON.parse(raw) : [];
}

function saveEmailLog(log: EmailMessage[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ema_email_log', JSON.stringify(log));
}

/** Obtener historial de emails enviados (para debug/demo) */
export function getSentEmails(): EmailMessage[] {
  return getEmailLog();
}

// ---- Envío real vía API (con fallback demo) ----
async function sendEmail(to: string, subject: string, html: string): Promise<EmailMessage> {
  const email: EmailMessage = {
    id: crypto.randomUUID(),
    to,
    subject,
    html,
    sentAt: new Date().toISOString(),
    status: 'sent',
    mode: 'demo',
  };

  try {
    const resp = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await resp.json();

    if (resp.ok && data.ok) {
      email.mode = data.mode === 'smtp' ? 'smtp' : 'demo';
      email.status = 'sent';
      console.log(`📩 Email ${data.mode === 'smtp' ? 'REAL' : 'demo'} enviado → ${to}`);
    } else {
      // API respondió pero sin SMTP configurado → siempre fallback a demo exitoso
      console.warn(`⚠️ Email API sin SMTP → ${to}, modo demo`);
      email.mode = 'demo';
      email.status = 'sent';
    }
  } catch {
    // Si el API no responde, modo demo puro con latencia simulada
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
    email.mode = 'demo';
    email.status = 'sent';
    console.warn(`⚠️ API no disponible, modo demo → ${to}`);
  }

  // Guardar en log local siempre
  const log = getEmailLog();
  log.unshift(email);
  if (log.length > 50) log.length = 50;
  saveEmailLog(log);

  // Log visual en consola
  console.group(`📩 Email ${email.mode === 'smtp' ? '(REAL ✅)' : '(DEMO 📋)'}`);
  console.log(`Para: ${to}`);
  console.log(`Asunto: ${subject}`);
  console.log(`Fecha: ${email.sentAt}`);
  console.log(`Estado: ${email.status}`);
  if (email.mode === 'demo') {
    console.log(`HTML preview:`, html.substring(0, 200) + '...');
  }
  console.groupEnd();

  return email;
}

// ============================================
// PLANTILLAS DE EMAIL
// ============================================

const BRAND_COLOR = '#C9A84C';
const ACCENT_COLOR = '#2D4A3E';

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,${BRAND_COLOR},${ACCENT_COLOR});border-radius:16px 16px 0 0;padding:30px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:28px;font-weight:800;">ORDERLY</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Sistema de pedidos digital</p>
    </div>
    <div style="background:white;border-radius:0 0 16px 16px;padding:30px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
      ${content}
    </div>
    <div style="text-align:center;padding:20px;color:#999;font-size:12px;">
      <p>ORDERLY — Pedidos digitales</p>
      <p>Este email fue generado automáticamente.</p>
    </div>
  </div>
</body>
</html>`;
}

// ---- Email de bienvenida ----
export async function sendWelcomeEmail(name: string, email: string): Promise<EmailMessage> {
  const subject = 'Bienvenido a ORDERLY 🎉';
  const html = emailWrapper(`
    <h2 style="color:#0A0A0A;margin:0 0 16px;font-size:22px;">¡Hola, ${name}! 👋</h2>
    <p style="color:#555;line-height:1.6;font-size:15px;">
      Gracias por registrarte en <strong>ORDERLY</strong>. Estamos encantados de tenerte con nosotros.
    </p>
    <p style="color:#555;line-height:1.6;font-size:15px;">
      A partir de ahora podrás:
    </p>
    <ul style="color:#555;line-height:1.8;font-size:15px;padding-left:20px;">
      <li>📱 Hacer pedidos cómodamente desde tu mesa</li>
      <li>💳 Pagar con tu monedero digital (tienes <strong>10€ de regalo</strong>)</li>
      <li>🧾 Consultar tus tickets e historial</li>
      <li>🤖 Pedir recomendaciones a nuestro chatbot</li>
    </ul>
    <div style="text-align:center;margin:24px 0;">
      <a href="${typeof window !== 'undefined' ? window.location.origin : '#'}" 
         style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLOR},${ACCENT_COLOR});color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        Abrir ORDERLY
      </a>
    </div>
    <p style="color:#999;font-size:13px;text-align:center;">
      Tu cuenta: <strong>${email}</strong>
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ---- Email de recuperación de contraseña ----
export async function sendPasswordResetEmail(name: string, email: string, code: string): Promise<EmailMessage> {
  const subject = 'Recuperar contraseña — ORDERLY';
  const html = emailWrapper(`
    <h2 style="color:#0A0A0A;margin:0 0 16px;font-size:22px;">Recuperar contraseña</h2>
    <p style="color:#555;line-height:1.6;font-size:15px;">
      Hola <strong>${name}</strong>, hemos recibido una solicitud para restablecer tu contraseña en <strong>ORDERLY</strong>.
    </p>
    <p style="color:#555;line-height:1.6;font-size:15px;">
      Tu código de verificación es:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#f5f0e8;border:2px solid ${BRAND_COLOR};border-radius:12px;padding:16px 40px;letter-spacing:8px;font-size:32px;font-weight:800;color:#0A0A0A;">
        ${code}
      </div>
    </div>
    <p style="color:#999;font-size:13px;text-align:center;">
      Este código expira en <strong>15 minutos</strong>.
    </p>
    <p style="color:#999;font-size:13px;text-align:center;">
      Si no solicitaste este cambio, ignora este email.
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ---- Email con ticket individual ----
export async function sendTicketEmail(
  email: string,
  ticket: {
    ticket_number?: number;
    table_number: number;
    items: { name: string; qty: number; price: number }[];
    total: number;
    payment_method: string;
    created_at: string;
  }
): Promise<EmailMessage> {
  const date = new Date(ticket.created_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const methodLabels: Record<string, string> = {
    bizum: 'Bizum',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Monedero ORDERLY',
    split: 'Pago dividido',
  };

  const itemsHtml = ticket.items.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">
        ${item.qty}x ${item.name}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;text-align:right;">
        ${(item.price * item.qty).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  const subject = `Tu ticket de ORDERLY — ${date}`;
  const html = emailWrapper(`
    <h2 style="color:#0A0A0A;margin:0 0 8px;font-size:20px;">🧾 Tu ticket</h2>
    <p style="color:#999;font-size:13px;margin:0 0 20px;">${date} · Mesa ${ticket.table_number}</p>
    
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid ${BRAND_COLOR};color:${BRAND_COLOR};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Producto</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid ${BRAND_COLOR};color:${BRAND_COLOR};font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin-top:16px;padding:16px;background:#FBF6E8;border-radius:10px;">
      <table style="width:100%;"><tr>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:13px;color:#999;">Método de pago</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#333;">${methodLabels[ticket.payment_method] || ticket.payment_method}</p>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <p style="margin:0;font-size:13px;color:#999;">Total</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:${BRAND_COLOR};">${ticket.total.toFixed(2)} €</p>
        </td>
      </tr></table>
    </div>

    <p style="color:#bbb;font-size:12px;text-align:center;margin-top:20px;">
      Este ticket es válido como justificante de pago.
    </p>
  `);

  return sendEmail(email, subject, html);
}

// ---- Email con resumen de todos los tickets ----
export async function sendAllTicketsEmail(
  email: string,
  userName: string,
  tickets: {
    ticket_number?: number;
    table_number: number;
    items: { name: string; qty: number; price: number }[];
    total: number;
    payment_method: string;
    created_at: string;
  }[]
): Promise<EmailMessage> {
  const totalGlobal = tickets.reduce((s, t) => s + t.total, 0);
  const methodLabels: Record<string, string> = {
    bizum: 'Bizum', cash: 'Efectivo', card: 'Tarjeta',
    wallet: 'Monedero', split: 'Dividido',
  };

  const ticketsHtml = tickets.map((ticket) => {
    const date = new Date(ticket.created_at).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const itemsList = ticket.items.map((i) =>
      `<li style="color:#555;font-size:13px;line-height:1.6;">${i.qty}x ${i.name} — ${(i.price * i.qty).toFixed(2)} €</li>`
    ).join('');

    return `
      <div style="border:1px solid #eee;border-radius:10px;padding:16px;margin-bottom:12px;">
        <table style="width:100%;margin-bottom:8px;"><tr>
          <td style="font-size:13px;color:#999;">${date} · Mesa ${ticket.table_number}</td>
          <td style="text-align:right;">
            <span style="font-size:12px;font-weight:600;color:${BRAND_COLOR};background:#FBF6E8;padding:2px 8px;border-radius:4px;">
              ${methodLabels[ticket.payment_method] || ticket.payment_method}
            </span>
          </td>
        </tr></table>
        <ul style="margin:0;padding-left:16px;">${itemsList}</ul>
        <div style="text-align:right;margin-top:8px;font-weight:700;color:#333;font-size:15px;">
          ${ticket.total.toFixed(2)} €
        </div>
      </div>
    `;
  }).join('');

  const subject = `Resumen de tickets ORDERLY — ${tickets.length} consumiciones`;
  const html = emailWrapper(`
    <h2 style="color:#0A0A0A;margin:0 0 8px;font-size:20px;">📋 Resumen de tickets</h2>
    <p style="color:#999;font-size:13px;margin:0 0 20px;">
      Hola ${userName}, aquí tienes el resumen de tus ${tickets.length} consumiciones.
    </p>

    ${ticketsHtml}

    <div style="margin-top:20px;padding:20px;background:linear-gradient(135deg,${BRAND_COLOR},${ACCENT_COLOR});border-radius:12px;text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;">Total general</p>
      <p style="margin:8px 0 0;color:white;font-size:28px;font-weight:800;">${totalGlobal.toFixed(2)} €</p>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">${tickets.length} tickets</p>
    </div>

    <p style="color:#bbb;font-size:12px;text-align:center;margin-top:20px;">
      Este resumen es válido como justificante de gastos.
    </p>
  `);

  return sendEmail(email, subject, html);
}
