import 'nodemailer';
export { renderers } from '../../../renderers.mjs';

const EMAIL_FROM = "ORDERLY <noreply@orderly.app>";
const transporter = null;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { to, subject, html } = body;
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: "Faltan campos: to, subject, html" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!transporter) {
      console.log(`📩 [DEMO] Email simulado → ${to} | Asunto: ${subject}`);
      return new Response(JSON.stringify({
        ok: true,
        mode: "demo",
        message: "SMTP no configurado — email simulado en consola del servidor"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log(`✅ Email real enviado → ${to} | MessageId: ${info.messageId}`);
    return new Response(JSON.stringify({
      ok: true,
      mode: "smtp",
      messageId: info.messageId
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("❌ Error enviando email:", err);
    return new Response(JSON.stringify({
      ok: false,
      error: err?.message || "Error desconocido al enviar email"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
