function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("ema_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("ema_session_id", sid);
  }
  return sid;
}

function getEmailLog() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("ema_email_log");
  return raw ? JSON.parse(raw) : [];
}
function saveEmailLog(log) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ema_email_log", JSON.stringify(log));
}
async function sendEmail(to, subject, html) {
  const email = {
    id: crypto.randomUUID(),
    to,
    subject,
    html,
    sentAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "sent",
    mode: "demo"
  };
  try {
    const resp = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html })
    });
    const data = await resp.json();
    if (resp.ok && data.ok) {
      email.mode = data.mode === "smtp" ? "smtp" : "demo";
      email.status = "sent";
      console.log(`📩 Email ${data.mode === "smtp" ? "REAL" : "demo"} enviado → ${to}`);
    } else {
      console.warn(`⚠️ Email API sin SMTP → ${to}, modo demo`);
      email.mode = "demo";
      email.status = "sent";
    }
  } catch {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
    email.mode = "demo";
    email.status = "sent";
    console.warn(`⚠️ API no disponible, modo demo → ${to}`);
  }
  const log = getEmailLog();
  log.unshift(email);
  if (log.length > 50) log.length = 50;
  saveEmailLog(log);
  console.group(`📩 Email ${email.mode === "smtp" ? "(REAL ✅)" : "(DEMO 📋)"}`);
  console.log(`Para: ${to}`);
  console.log(`Asunto: ${subject}`);
  console.log(`Fecha: ${email.sentAt}`);
  console.log(`Estado: ${email.status}`);
  if (email.mode === "demo") {
    console.log(`HTML preview:`, html.substring(0, 200) + "...");
  }
  console.groupEnd();
  return email;
}
const BRAND_COLOR = "#C9A84C";
const ACCENT_COLOR = "#2D4A3E";
function emailWrapper(content) {
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
async function sendWelcomeEmail(name, email) {
  const subject = "Bienvenido a ORDERLY 🎉";
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
      <a href="${typeof window !== "undefined" ? window.location.origin : "#"}" 
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
async function sendPasswordResetEmail(name, email, code) {
  const subject = "Recuperar contraseña — ORDERLY";
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
async function sendTicketEmail(email, ticket) {
  const date = new Date(ticket.created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const methodLabels = {
    bizum: "Bizum",
    cash: "Efectivo",
    card: "Tarjeta",
    wallet: "Monedero ORDERLY",
    split: "Pago dividido"
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
  `).join("");
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
async function sendAllTicketsEmail(email, userName, tickets) {
  const totalGlobal = tickets.reduce((s, t) => s + t.total, 0);
  const methodLabels = {
    bizum: "Bizum",
    cash: "Efectivo",
    card: "Tarjeta",
    wallet: "Monedero",
    split: "Dividido"
  };
  const ticketsHtml = tickets.map((ticket) => {
    const date = new Date(ticket.created_at).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const itemsList = ticket.items.map(
      (i) => `<li style="color:#555;font-size:13px;line-height:1.6;">${i.qty}x ${i.name} — ${(i.price * i.qty).toFixed(2)} €</li>`
    ).join("");
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
  }).join("");
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

function load(key) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`ema_${key}`);
  return raw ? JSON.parse(raw) : null;
}
function save(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`ema_${key}`, JSON.stringify(data));
}
function uuid() {
  return crypto.randomUUID();
}
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
let _channel = null;
function getBroadcast() {
  if (typeof window === "undefined") return null;
  if (!_channel) {
    try {
      _channel = new BroadcastChannel("ema_realtime");
    } catch {
    }
  }
  return _channel;
}
function broadcast(event, data) {
  getBroadcast()?.postMessage({ event, data, ts: Date.now() });
}
const c = (n) => `c1000000-0000-0000-0000-00000000000${n}`;
const SEED_CATEGORIES = [
  { id: c(1), name: "Cafés", description: "Espressos, lattes y combinaciones de café", order: 1, active: true },
  { id: c(2), name: "Tés e infusiones", description: "Tés del mundo, infusiones y matcha", order: 2, active: true },
  { id: c(3), name: "Batidos y smoothies", description: "Batidos de fruta, smoothies y bowls", order: 3, active: true },
  { id: c(4), name: "Bollería y dulces", description: "Croissants, tartas y dulces artesanos", order: 4, active: true },
  { id: c(5), name: "Tostas y salados", description: "Tostas gourmet, bocadillos y salados", order: 5, active: true },
  { id: c(6), name: "Bebidas frías", description: "Refrescos, zumos y cervezas", order: 6, active: true },
  { id: c(7), name: "Cachimbas", description: "Hookah con sabores premium", order: 7, active: true },
  { id: c(8), name: "Especiales", description: "Combos, brunch y ofertas", order: 8, active: true }
];
let _pid = 0;
const pid = () => {
  _pid++;
  return `p1000000-0000-0000-0000-${String(_pid).padStart(12, "0")}`;
};
const SEED_PRODUCTS = [
  // ── Cafés ──
  { id: pid(), category_id: c(1), name: "Café solo", description: "Espresso intenso 100% arábica", price: 1.2, cost: 0.25, image_url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop", tags: ["hot", "energizing", "bitter"], allergens: [], available: true, order: 1 },
  { id: pid(), category_id: c(1), name: "Café con leche", description: "Espresso con leche cremosa de origen", price: 1.5, cost: 0.35, image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", tags: ["hot", "energizing", "creamy"], allergens: ["lacteos"], available: true, order: 2 },
  { id: pid(), category_id: c(1), name: "Cortado", description: "Espresso cortado con un toque de leche", price: 1.3, cost: 0.28, image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop", tags: ["hot", "energizing"], allergens: ["lacteos"], available: true, order: 3 },
  { id: pid(), category_id: c(1), name: "Cappuccino", description: "Espresso con leche espumosa y cacao", price: 2, cost: 0.45, image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop", tags: ["hot", "energizing", "creamy", "sweet"], allergens: ["lacteos"], available: true, order: 4 },
  { id: pid(), category_id: c(1), name: "Café bombón", description: "Espresso con leche condensada artesana", price: 1.8, cost: 0.4, image_url: "https://images.unsplash.com/photo-1595981234058-a9302fb97229?w=400&h=400&fit=crop", tags: ["hot", "energizing", "sweet"], allergens: ["lacteos"], available: true, order: 5 },
  { id: pid(), category_id: c(1), name: "Latte macchiato", description: "Capas de leche y espresso con espuma densa", price: 2.2, cost: 0.5, image_url: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=400&fit=crop", tags: ["hot", "energizing", "creamy", "sweet"], allergens: ["lacteos"], available: true, order: 6 },
  { id: pid(), category_id: c(1), name: "Café con hielo", description: "Espresso doble servido con vaso de hielo", price: 1.6, cost: 0.3, image_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop", tags: ["cold", "fresh", "energizing"], allergens: [], available: true, order: 7 },
  { id: pid(), category_id: c(1), name: "Affogato", description: "Espresso caliente sobre helado de vainilla", price: 3, cost: 0.8, image_url: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400&h=400&fit=crop", tags: ["sweet", "cold", "energizing", "creamy"], allergens: ["lacteos", "huevos"], available: true, order: 8 },
  { id: pid(), category_id: c(1), name: "Café irlandés", description: "Café, whisky, nata montada y canela", price: 4.5, cost: 1.5, image_url: "https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400&h=400&fit=crop", tags: ["hot", "sweet", "alcohol", "special"], allergens: ["lacteos", "sulfitos"], available: true, order: 9 },
  // ── Tés e infusiones ──
  { id: pid(), category_id: c(2), name: "Té verde Sencha", description: "Té verde japonés con notas herbales suaves", price: 1.8, cost: 0.3, image_url: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", tags: ["hot", "relaxing", "healthy"], allergens: [], available: true, order: 1 },
  { id: pid(), category_id: c(2), name: "Té negro English Breakfast", description: "Clásico, intenso, ideal con leche", price: 1.8, cost: 0.28, image_url: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop", tags: ["hot", "energizing"], allergens: [], available: true, order: 2 },
  { id: pid(), category_id: c(2), name: "Chai latte", description: "Té negro con especias, leche espumada y canela", price: 2.8, cost: 0.55, image_url: "https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=400&fit=crop", tags: ["hot", "sweet", "creamy", "spicy"], allergens: ["lacteos"], available: true, order: 3 },
  { id: pid(), category_id: c(2), name: "Manzanilla con miel", description: "Infusión relajante con miel natural", price: 1.6, cost: 0.25, image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop", tags: ["hot", "relaxing", "sweet", "healthy"], allergens: [], available: true, order: 4 },
  { id: pid(), category_id: c(2), name: "Matcha latte", description: "Matcha ceremonial batido con leche de avena", price: 3.2, cost: 0.8, image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=400&fit=crop", tags: ["hot", "energizing", "healthy", "creamy"], allergens: ["gluten"], available: true, order: 5 },
  { id: pid(), category_id: c(2), name: "Rooibos vainilla", description: "Infusión sudafricana sin teína con vainilla", price: 2, cost: 0.35, image_url: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop", tags: ["hot", "relaxing", "sweet"], allergens: [], available: true, order: 6 },
  { id: pid(), category_id: c(2), name: "Té helado de melocotón", description: "Té negro frío con melocotón natural y hielo", price: 2.5, cost: 0.45, image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "fruity"], allergens: [], available: true, order: 7 },
  { id: pid(), category_id: c(2), name: "Golden milk", description: "Leche de coco con cúrcuma, jengibre y canela", price: 3, cost: 0.6, image_url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop", tags: ["hot", "healthy", "spicy", "relaxing"], allergens: [], available: true, order: 8 },
  // ── Batidos y smoothies ──
  { id: pid(), category_id: c(3), name: "Batido de fresa", description: "Fresas frescas de temporada con leche", price: 3.5, cost: 1, image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "fruity"], allergens: ["lacteos"], available: true, order: 1 },
  { id: pid(), category_id: c(3), name: "Batido de mango", description: "Mango tropical con yogur griego", price: 3.5, cost: 1.1, image_url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "fruity", "tropical"], allergens: ["lacteos"], available: true, order: 2 },
  { id: pid(), category_id: c(3), name: "Smoothie verde", description: "Espinacas, plátano, manzana y jengibre", price: 4, cost: 1.2, image_url: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop", tags: ["cold", "fresh", "healthy", "energizing"], allergens: [], available: true, order: 3 },
  { id: pid(), category_id: c(3), name: "Açaí bowl", description: "Açaí con granola, plátano y frutos rojos", price: 5.5, cost: 1.8, image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "healthy", "fruity"], allergens: ["gluten", "frutos_cascara"], available: true, order: 4 },
  { id: pid(), category_id: c(3), name: "Batido de plátano y chocolate", description: "Plátano maduro con cacao puro y leche", price: 3.8, cost: 1.05, image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop", tags: ["cold", "sweet", "creamy", "chocolate"], allergens: ["lacteos"], available: true, order: 5 },
  { id: pid(), category_id: c(3), name: "Smoothie tropical", description: "Piña, coco, mango y lima", price: 4.2, cost: 1.3, image_url: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "tropical", "fruity"], allergens: [], available: true, order: 6 },
  // ── Bollería y dulces ──
  { id: pid(), category_id: c(4), name: "Croissant de mantequilla", description: "Croissant artesano, crujiente y hojaldrado", price: 1.8, cost: 0.5, image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=400&fit=crop", tags: ["sweet", "pastry"], allergens: ["gluten", "lacteos", "huevos"], available: true, order: 1 },
  { id: pid(), category_id: c(4), name: "Tostada con tomate", description: "Pan cristal con tomate rallado y AOVE", price: 2.5, cost: 0.6, image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop", tags: ["salty", "healthy"], allergens: ["gluten"], available: true, order: 2 },
  { id: pid(), category_id: c(4), name: "Napolitana de chocolate", description: "Hojaldre crujiente relleno de chocolate belga", price: 2, cost: 0.55, image_url: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=400&fit=crop", tags: ["sweet", "pastry", "chocolate"], allergens: ["gluten", "lacteos", "huevos", "soja"], available: true, order: 3 },
  { id: pid(), category_id: c(4), name: "Carrot cake", description: "Bizcocho de zanahoria con frosting de queso crema", price: 3.8, cost: 1, image_url: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop", tags: ["sweet", "pastry", "creamy"], allergens: ["gluten", "lacteos", "huevos", "frutos_cascara"], available: true, order: 4 },
  { id: pid(), category_id: c(4), name: "Cookie de chocolate", description: "Cookie XXL con pepitas de chocolate negro", price: 2.5, cost: 0.65, image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop", tags: ["sweet", "chocolate"], allergens: ["gluten", "lacteos", "huevos"], available: true, order: 5 },
  { id: pid(), category_id: c(4), name: "Cheesecake", description: "Tarta de queso cremosa con coulis de frutos rojos", price: 4.2, cost: 1.1, image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop", tags: ["sweet", "creamy", "fruity"], allergens: ["gluten", "lacteos", "huevos"], available: true, order: 6 },
  { id: pid(), category_id: c(4), name: "Brownie con nueces", description: "Brownie casero de chocolate negro con nueces", price: 3.5, cost: 0.9, image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop", tags: ["sweet", "chocolate"], allergens: ["gluten", "lacteos", "huevos", "frutos_cascara"], available: true, order: 7 },
  { id: pid(), category_id: c(4), name: "Muffin de arándanos", description: "Muffin esponjoso con arándanos frescos", price: 2.8, cost: 0.6, image_url: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop", tags: ["sweet", "fruity", "pastry"], allergens: ["gluten", "lacteos", "huevos"], available: true, order: 8 },
  // ── Tostas y salados ──
  { id: pid(), category_id: c(5), name: "Tosta de aguacate", description: "Aguacate, tomate cherry, semillas y lima", price: 4.5, cost: 1.5, image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop", tags: ["salty", "healthy", "fresh"], allergens: ["gluten", "sesamo"], available: true, order: 1 },
  { id: pid(), category_id: c(5), name: "Tosta de salmón", description: "Salmón ahumado, queso crema, eneldo y alcaparras", price: 5, cost: 1.8, image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop", tags: ["salty", "protein"], allergens: ["gluten", "pescado", "lacteos"], available: true, order: 2 },
  { id: pid(), category_id: c(5), name: "Tosta de jamón ibérico", description: "Jamón ibérico de bellota con tomate y AOVE", price: 5.5, cost: 2.2, image_url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=400&fit=crop", tags: ["salty", "protein", "special"], allergens: ["gluten"], available: true, order: 3 },
  { id: pid(), category_id: c(5), name: "Tortilla española", description: "Pincho de tortilla de patata casera", price: 3, cost: 0.8, image_url: "https://images.unsplash.com/photo-1623246123320-0d6636755796?w=400&h=400&fit=crop", tags: ["salty", "hot", "protein"], allergens: ["huevos"], available: true, order: 4 },
  { id: pid(), category_id: c(5), name: "Bikini mixto", description: "Sándwich de jamón y queso fundido en pan brioche", price: 3.5, cost: 0.9, image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop", tags: ["salty", "hot", "protein"], allergens: ["gluten", "lacteos"], available: true, order: 5 },
  { id: pid(), category_id: c(5), name: "Wrap de pollo Caesar", description: "Pollo a la plancha, lechuga, parmesano y salsa Caesar", price: 5, cost: 1.6, image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop", tags: ["salty", "protein", "fresh"], allergens: ["gluten", "lacteos", "huevos", "pescado"], available: true, order: 6 },
  { id: pid(), category_id: c(5), name: "Nachos con guacamole", description: "Nachos caseros con guacamole, pico de gallo y jalapeños", price: 5.5, cost: 1.4, image_url: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=400&fit=crop", tags: ["salty", "spicy", "sharing"], allergens: ["gluten"], available: true, order: 7 },
  { id: pid(), category_id: c(5), name: "Hummus con crudités", description: "Hummus casero con bastones de zanahoria, pepino y pan pita", price: 4.5, cost: 1.1, image_url: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=400&fit=crop", tags: ["salty", "healthy", "sharing", "fresh"], allergens: ["gluten", "sesamo"], available: true, order: 8 },
  // ── Bebidas frías ──
  { id: pid(), category_id: c(6), name: "Agua mineral", description: "50cl - Bezoya", price: 1, cost: 0.25, image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop", tags: ["cold", "fresh"], allergens: [], available: true, order: 1 },
  { id: pid(), category_id: c(6), name: "Refresco", description: "Coca-Cola, Fanta, Nestea, Aquarius", price: 2, cost: 0.5, image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop", tags: ["cold", "sweet", "fresh"], allergens: [], available: true, order: 2 },
  { id: pid(), category_id: c(6), name: "Zumo de naranja natural", description: "Recién exprimido, mínimo 4 naranjas", price: 3, cost: 0.9, image_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop", tags: ["cold", "fresh", "healthy", "fruity"], allergens: [], available: true, order: 3 },
  { id: pid(), category_id: c(6), name: "Limonada casera", description: "Limón, hierbabuena, azúcar de caña y hielo", price: 3, cost: 0.7, image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "fruity"], allergens: [], available: true, order: 4 },
  { id: pid(), category_id: c(6), name: "Cerveza artesanal", description: "IPA local de barril — 33cl", price: 3.5, cost: 1, image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop", tags: ["cold", "fresh", "alcohol"], allergens: ["gluten", "sulfitos"], available: true, order: 5 },
  { id: pid(), category_id: c(6), name: "Tinto de verano", description: "Vino tinto con gaseosa de limón y hielo", price: 2.5, cost: 0.6, image_url: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=400&fit=crop", tags: ["cold", "fresh", "alcohol", "fruity"], allergens: ["sulfitos"], available: true, order: 6 },
  { id: pid(), category_id: c(6), name: "Mojito sin alcohol", description: "Lima, hierbabuena, azúcar moreno y soda", price: 3.5, cost: 0.8, image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "fruity"], allergens: [], available: true, order: 7 },
  { id: pid(), category_id: c(6), name: "Granizado de limón", description: "Hielo picado con zumo de limón natural", price: 2.5, cost: 0.5, image_url: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop", tags: ["cold", "fresh", "sweet", "fruity"], allergens: [], available: true, order: 8 },
  // ── Cachimbas ──
  { id: pid(), category_id: c(7), name: "Cachimba Doble Manzana", description: "El clásico sabor de doble manzana con menta fresca", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop", tags: ["hookah", "fresh", "fruity", "popular"], allergens: [], available: true, order: 1 },
  { id: pid(), category_id: c(7), name: "Cachimba Sandía Ice", description: "Sandía refrescante con toque mentolado", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop", tags: ["hookah", "fresh", "fruity", "cold"], allergens: [], available: true, order: 2 },
  { id: pid(), category_id: c(7), name: "Cachimba Uva Menta", description: "Uva dulce combinada con menta refrescante", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop", tags: ["hookah", "fresh", "sweet", "fruity"], allergens: [], available: true, order: 3 },
  { id: pid(), category_id: c(7), name: "Cachimba Melocotón", description: "Sabor suave y dulce de melocotón maduro", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop", tags: ["hookah", "sweet", "fruity"], allergens: [], available: true, order: 4 },
  { id: pid(), category_id: c(7), name: "Cachimba Mango Tango", description: "Mango tropical con un toque exótico", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop", tags: ["hookah", "sweet", "tropical", "fruity"], allergens: [], available: true, order: 5 },
  { id: pid(), category_id: c(7), name: "Cachimba Fresa Helada", description: "Fresa dulce con efecto ice intenso", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop", tags: ["hookah", "cold", "sweet", "fruity"], allergens: [], available: true, order: 6 },
  { id: pid(), category_id: c(7), name: "Cachimba Blueberry Mint", description: "Arándanos azules con menta suave", price: 8, cost: 2.5, image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop", tags: ["hookah", "fresh", "fruity"], allergens: [], available: true, order: 7 },
  { id: pid(), category_id: c(7), name: "Cachimba Love 66", description: "Mezcla de frutas del bosque con toque mentolado", price: 9, cost: 3, image_url: "https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop", tags: ["hookah", "fresh", "fruity", "popular", "special"], allergens: [], available: true, order: 8 },
  { id: pid(), category_id: c(7), name: "Cachimba Premium Mix", description: "Combinación exclusiva de la casa — sabor sorpresa", price: 10, cost: 3.5, image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop", tags: ["hookah", "special", "popular"], allergens: [], available: true, order: 9 },
  // ── Especiales ──
  { id: pid(), category_id: c(8), name: "Brunch ORDERLY", description: "Café/té + zumo + tosta + fruta + bollería", price: 9.9, cost: 3.5, image_url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=400&fit=crop", tags: ["special", "sweet", "salty", "sharing"], allergens: ["gluten", "lacteos", "huevos"], available: true, order: 1 },
  { id: pid(), category_id: c(8), name: "Merienda especial", description: "Chai latte o chocolate + croissant + tarta", price: 6.9, cost: 2.2, image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", tags: ["special", "sweet", "hot"], allergens: ["gluten", "lacteos", "huevos"], available: true, order: 2 },
  { id: pid(), category_id: c(8), name: "Chocolate a la taza", description: "Chocolate negro 70% fundido con churros (6 uds)", price: 4.5, cost: 1.3, image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop", tags: ["hot", "sweet", "chocolate", "special"], allergens: ["gluten", "lacteos"], available: true, order: 3 },
  { id: pid(), category_id: c(8), name: "Combo Cachimba + Bebida", description: "Cualquier cachimba + bebida a elegir", price: 10.5, cost: 3.5, image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop", tags: ["hookah", "special", "popular"], allergens: [], available: true, order: 4 },
  { id: pid(), category_id: c(8), name: "Combo Cachimba + 2 Bebidas", description: "Cualquier cachimba + 2 bebidas a elegir", price: 13, cost: 4.2, image_url: "https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop", tags: ["hookah", "special", "sharing", "popular"], allergens: [], available: true, order: 5 },
  { id: pid(), category_id: c(8), name: "Tarde de chicas", description: "Cachimba + 2 batidos + tarta para compartir", price: 18, cost: 6, image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop", tags: ["hookah", "sweet", "sharing", "special", "popular"], allergens: ["lacteos"], available: true, order: 6 }
];
const SEED_TABLES = Array.from({ length: 15 }, (_, i) => ({
  id: `t1000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`,
  number: i + 1,
  name: null,
  active: true
}));
const SEED_SETTINGS = {
  business_name: "ORDERLY",
  admin_password: "orderly2026",
  bizum_phone: "612345678",
  stripe_enabled: "false",
  cash_enabled: "true",
  bizum_enabled: "true",
  base_url: "",
  logo_url: "/logo.png",
  header_url: "/header.png"
};
function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!load("categories")) save("categories", SEED_CATEGORIES);
  if (!load("products")) save("products", SEED_PRODUCTS);
  if (!load("tables")) save("tables", SEED_TABLES);
  if (!load("orders")) save("orders", []);
  if (!load("order_items")) save("order_items", []);
  if (!load("tickets")) save("tickets", []);
  if (!load("settings")) save("settings", SEED_SETTINGS);
  if (!load("users")) save("users", []);
  if (!load("_migrated_allergens")) {
    const prods = load("products") || [];
    const seedMap = new Map(SEED_PRODUCTS.map((p) => [p.name, p]));
    let changed = false;
    for (const p of prods) {
      const seed = seedMap.get(p.name);
      if (seed && (!p.allergens || p.allergens.length === 0) && seed.allergens && seed.allergens.length > 0) {
        p.allergens = seed.allergens;
        changed = true;
      }
      if (seed && (!p.tags || p.tags.length === 0) && seed.tags && seed.tags.length > 0) {
        p.tags = seed.tags;
        changed = true;
      }
    }
    if (changed) save("products", prods);
    save("_migrated_allergens", true);
  }
}
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h = (h << 5) - h + ch;
    h |= 0;
  }
  return "h_" + Math.abs(h).toString(36);
}
async function registerUser$1(name, email, password) {
  ensureSeeded();
  const users = load("users") || [];
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error("Ya existe una cuenta con ese email");
  const user = {
    id: uuid(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash: simpleHash(password),
    created_at: now()
  };
  users.push(user);
  save("users", users);
  const walletKey = `wallet_user_${user.id}`;
  save(walletKey, {
    balance: 10,
    transactions: [{
      id: uuid(),
      type: "recharge",
      amount: 10,
      description: "🎉 Bienvenido a ORDERLY — saldo de regalo",
      created_at: now()
    }]
  });
  localStorage.setItem("ema_user_id", user.id);
  localStorage.setItem("ema_user_token", `demo_${user.id}`);
  sendWelcomeEmail(user.name, user.email).catch(
    (_err) => console.warn("No se pudo enviar el email de bienvenida:", _err)
  );
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}
async function loginUser$1(email, password) {
  ensureSeeded();
  const users = load("users") || [];
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) throw new Error("No se encontró una cuenta con ese email");
  if (user.password_hash !== simpleHash(password)) throw new Error("Contraseña incorrecta");
  localStorage.setItem("ema_user_id", user.id);
  localStorage.setItem("ema_user_token", `demo_${user.id}`);
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}
async function getCurrentUser$1() {
  ensureSeeded();
  const userId = typeof window !== "undefined" ? localStorage.getItem("ema_user_id") : null;
  if (!userId) return null;
  const users = load("users") || [];
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}
function getCurrentUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ema_user_id");
}
async function getCategories$1() {
  ensureSeeded();
  const cats = load("categories") || [];
  return cats.filter((c2) => c2.active).sort((a, b) => a.order - b.order);
}
async function getProducts$1() {
  ensureSeeded();
  return (load("products") || []).sort((a, b) => a.order - b.order);
}
async function upsertProduct$1(product) {
  ensureSeeded();
  const prods = load("products") || [];
  const idx = product.id ? prods.findIndex((p) => p.id === product.id) : -1;
  const full = {
    id: product.id || uuid(),
    category_id: product.category_id,
    name: product.name,
    description: product.description,
    price: product.price,
    cost: product.cost,
    image_url: product.image_url,
    tags: product.tags,
    allergens: product.allergens,
    available: product.available ?? true,
    order: product.order ?? prods.length
  };
  if (idx >= 0) prods[idx] = full;
  else prods.push(full);
  save("products", prods);
  return full;
}
async function deleteProduct$1(productId) {
  ensureSeeded();
  save("products", (load("products") || []).filter((p) => p.id !== productId));
}
async function toggleProductAvailability$1(productId, available) {
  ensureSeeded();
  const prods = load("products") || [];
  const idx = prods.findIndex((p) => p.id === productId);
  if (idx >= 0) {
    prods[idx].available = available;
    save("products", prods);
  }
}
async function getTables$1() {
  ensureSeeded();
  return (load("tables") || []).sort((a, b) => a.number - b.number);
}
async function upsertTable$1(table) {
  ensureSeeded();
  const tables = load("tables") || [];
  const idx = table.id ? tables.findIndex((t) => t.id === table.id) : -1;
  const full = { id: table.id || uuid(), number: table.number, name: table.name || null, active: table.active ?? true };
  if (idx >= 0) tables[idx] = full;
  else tables.push(full);
  save("tables", tables);
  return full;
}
async function deleteTable$1(tableId) {
  ensureSeeded();
  save("tables", (load("tables") || []).filter((t) => t.id !== tableId));
}
function joinOrders(orders) {
  const allItems = load("order_items") || [];
  return orders.map((o) => ({
    ...o,
    items: allItems.filter((i) => i.order_id === o.id)
  }));
}
async function createOrder$1(tableNumber, items, paymentMethod) {
  ensureSeeded();
  const sessionId = getSessionId();
  const userId = getCurrentUserId();
  const user = userId ? await getCurrentUser$1() : null;
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalCost = items.reduce((sum, i) => sum + (i.product.cost || 0) * i.quantity, 0);
  const ts = now();
  const order = {
    id: uuid(),
    table_number: tableNumber,
    session_id: sessionId,
    user_id: userId,
    user_name: user?.name || null,
    status: "pending",
    total,
    total_cost: totalCost,
    payment_method: null,
    stripe_payment_id: null,
    notes: null,
    created_at: ts,
    updated_at: ts,
    paid_at: null
  };
  const orderItems = items.map((item) => ({
    id: uuid(),
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    unit_cost: item.product.cost || 0,
    notes: item.notes || null,
    created_at: ts
  }));
  const existingOrders = load("orders") || [];
  existingOrders.push(order);
  save("orders", existingOrders);
  const existingItems = load("order_items") || [];
  existingItems.push(...orderItems);
  save("order_items", existingItems);
  _notifyOrderChange();
  broadcast("order_new", { orderId: order.id, tableNumber });
  return { ...order, items: orderItems };
}
async function getUnpaidOrdersByTable$1(tableNumber) {
  ensureSeeded();
  const sessionId = getSessionId();
  const orders = load("orders") || [];
  const filtered = orders.filter(
    (o) => o.table_number === tableNumber && o.session_id === sessionId && o.status !== "paid"
  );
  filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return joinOrders(filtered);
}
async function payOrders$1(orderIds, paymentMethod, tableNumber) {
  ensureSeeded();
  const ts = now();
  const orders = load("orders") || [];
  for (const orderId of orderIds) {
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = "paid";
      orders[idx].payment_method = paymentMethod;
      orders[idx].paid_at = ts;
      orders[idx].updated_at = ts;
    }
  }
  save("orders", orders);
  const allItems = load("order_items") || [];
  const ticketItems = [];
  let totalAmount = 0;
  for (const orderId of orderIds) {
    const order = orders.find((o) => o.id === orderId);
    if (order) totalAmount += order.total;
    allItems.filter((i) => i.order_id === orderId).forEach((item) => {
      ticketItems.push({ name: item.product_name, qty: item.quantity, price: item.unit_price });
    });
  }
  await createTicket(orderIds[0], tableNumber, ticketItems, totalAmount, paymentMethod);
  _notifyOrderChange();
  broadcast("order_paid", { orderIds, tableNumber });
}
async function payPartial$1(tableNumber, amount, paymentMethod, payerName) {
  ensureSeeded();
  const sessionId = getSessionId();
  const orders = load("orders") || [];
  const ts = now();
  const unpaidIds = orders.filter((o) => o.table_number === tableNumber && o.session_id === sessionId && o.status !== "paid").sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((o) => o.id);
  const partialPayments = load("partial_payments") || [];
  partialPayments.push({
    id: uuid(),
    table_number: tableNumber,
    session_id: sessionId,
    amount,
    payment_method: paymentMethod,
    payer_name: payerName,
    order_ids: unpaidIds,
    created_at: ts
  });
  save("partial_payments", partialPayments);
  const totalUnpaid = orders.filter((o) => unpaidIds.includes(o.id)).reduce((s, o) => s + o.total, 0);
  const totalPaid = partialPayments.filter((p) => p.session_id === sessionId && p.table_number === tableNumber).reduce((s, p) => s + p.amount, 0);
  if (totalPaid >= totalUnpaid) {
    for (const orderId of unpaidIds) {
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        orders[idx].status = "paid";
        orders[idx].payment_method = "split";
        orders[idx].paid_at = ts;
        orders[idx].updated_at = ts;
      }
    }
    save("orders", orders);
    const allItems = load("order_items") || [];
    const ticketItems = [];
    for (const orderId of unpaidIds) {
      allItems.filter((i) => i.order_id === orderId).forEach((item) => {
        ticketItems.push({ name: item.product_name, qty: item.quantity, price: item.unit_price });
      });
    }
    await createTicket(unpaidIds[0], tableNumber, ticketItems, totalUnpaid, "split");
  }
  _notifyOrderChange();
  broadcast("order_partial_pay", { tableNumber, amount, payerName });
}
async function getPartialPayments$1(tableNumber) {
  ensureSeeded();
  const sessionId = getSessionId();
  const payments = load("partial_payments") || [];
  return payments.filter((p) => p.table_number === tableNumber && p.session_id === sessionId);
}
async function getOrders$1(status) {
  ensureSeeded();
  const orders = load("orders") || [];
  let filtered;
  {
    filtered = orders.filter((o) => o.status !== "paid");
  }
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return joinOrders(filtered);
}
async function getPaidOrders$1(since) {
  ensureSeeded();
  const orders = load("orders") || [];
  let filtered = orders.filter((o) => o.status === "paid");
  filtered.sort((a, b) => {
    const ta = a.paid_at ? new Date(a.paid_at).getTime() : 0;
    const tb = b.paid_at ? new Date(b.paid_at).getTime() : 0;
    return tb - ta;
  });
  return joinOrders(filtered);
}
async function updateOrderStatus$1(orderId, status, paymentMethod) {
  ensureSeeded();
  const orders = load("orders") || [];
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    orders[idx].updated_at = now();
    if (status === "paid") {
      orders[idx].paid_at = now();
      if (paymentMethod) orders[idx].payment_method = paymentMethod;
    }
    save("orders", orders);
  }
  _notifyOrderChange();
  broadcast("order_status", { orderId, status });
}
let _ticketCounter = 0;
async function createTicket(orderId, tableNumber, items, total, paymentMethod) {
  ensureSeeded();
  const sessionId = getSessionId();
  const tickets = load("tickets") || [];
  _ticketCounter = tickets.length;
  const ticket = {
    id: uuid(),
    order_id: orderId,
    ticket_number: ++_ticketCounter,
    table_number: tableNumber,
    session_id: sessionId,
    total,
    payment_method: paymentMethod,
    items,
    created_at: now()
  };
  tickets.push(ticket);
  save("tickets", tickets);
  return ticket;
}
async function getMyTickets$1() {
  ensureSeeded();
  const sessionId = getSessionId();
  return (load("tickets") || []).filter((t) => t.session_id === sessionId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
async function getAdminSettings$1() {
  ensureSeeded();
  return load("settings") || {};
}
async function updateAdminSetting$1(key, value) {
  ensureSeeded();
  const settings = load("settings") || {};
  settings[key] = value;
  save("settings", settings);
}
const _orderListeners = [];
function _notifyOrderChange() {
  _orderListeners.forEach((cb) => {
    try {
      cb({ eventType: "UPDATE", table: "orders" });
    } catch {
    }
  });
}
function subscribeToOrders$1(callback) {
  _orderListeners.push(callback);
  const ch = getBroadcast();
  const bcHandler = (e) => {
    if (e.data?.event?.startsWith("order_")) {
      try {
        callback({ eventType: "BROADCAST", ...e.data });
      } catch {
      }
    }
  };
  ch?.addEventListener("message", bcHandler);
  const storageHandler = (e) => {
    if (e.key === "ema_orders" || e.key === "ema_order_items") {
      try {
        callback({ eventType: "STORAGE", key: e.key });
      } catch {
      }
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", storageHandler);
  }
  const interval = setInterval(() => {
    try {
      callback({ eventType: "POLL", table: "orders" });
    } catch {
    }
  }, 2e3);
  return {
    unsubscribe: () => {
      clearInterval(interval);
      ch?.removeEventListener("message", bcHandler);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", storageHandler);
      }
      const idx = _orderListeners.indexOf(callback);
      if (idx >= 0) _orderListeners.splice(idx, 1);
    }
  };
}
async function getMyOrders$1() {
  ensureSeeded();
  const sessionId = getSessionId();
  const orders = load("orders") || [];
  const myOrders = orders.filter((o) => o.session_id === sessionId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return joinOrders(myOrders);
}
function getWalletKey() {
  const userId = getCurrentUserId();
  if (userId) return `wallet_user_${userId}`;
  return `wallet_${getSessionId()}`;
}
function getWallet() {
  return load(getWalletKey()) || { balance: 0, transactions: [] };
}
async function getWalletBalance$1() {
  return getWallet().balance;
}
async function getWalletTransactions$1() {
  return getWallet().transactions;
}
async function rechargeWallet$1(amount) {
  const w = getWallet();
  w.balance = Math.round((w.balance + amount) * 100) / 100;
  w.transactions.unshift({
    id: uuid(),
    type: "recharge",
    amount,
    description: `Recarga de ${amount.toFixed(2)} €`,
    created_at: now()
  });
  save(getWalletKey(), w);
  return w.balance;
}
async function payWithWallet$1(amount, description) {
  const w = getWallet();
  if (w.balance < amount) throw new Error("Saldo insuficiente");
  w.balance = Math.round((w.balance - amount) * 100) / 100;
  w.transactions.unshift({
    id: uuid(),
    type: "payment",
    amount,
    description,
    created_at: now()
  });
  save(getWalletKey(), w);
  return w.balance;
}
async function createServiceRequest$1(type, tableNumber, options) {
  ensureSeeded();
  const userId = getCurrentUserId();
  const user = userId ? await getCurrentUser$1() : null;
  const ts = now();
  const request = {
    id: uuid(),
    type,
    method: options?.method,
    table_number: tableNumber,
    user_id: userId,
    user_name: user?.name || null,
    status: "pending",
    total: options?.total,
    order_ids: options?.orderIds,
    message: options?.message,
    created_at: ts,
    updated_at: ts
  };
  const requests = load("service_requests") || [];
  requests.unshift(request);
  save("service_requests", requests);
  _notifyOrderChange();
  broadcast("service_request_new", {
    requestId: request.id,
    type: request.type,
    method: request.method,
    tableNumber,
    userName: request.user_name,
    total: request.total
  });
  return request;
}
async function getServiceRequests$1(status) {
  ensureSeeded();
  const requests = load("service_requests") || [];
  let filtered = requests;
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
async function updateServiceRequestStatus$1(requestId, status) {
  ensureSeeded();
  const requests = load("service_requests") || [];
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx >= 0) {
    requests[idx].status = status;
    requests[idx].updated_at = now();
    save("service_requests", requests);
  }
  _notifyOrderChange();
  broadcast("service_request_update", { requestId, status });
}
async function createGroupSession$1(tableNumber, orderIds) {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Debes iniciar sesión para crear un grupo");
  const user = await getCurrentUser$1();
  if (!user) throw new Error("Usuario no encontrado");
  const allItems = load("order_items") || [];
  const groupItems = [];
  for (const orderId of orderIds) {
    const items = allItems.filter((i) => i.order_id === orderId);
    for (const item of items) {
      for (let u = 0; u < item.quantity; u++) {
        groupItems.push({
          id: uuid(),
          product_name: item.product_name,
          quantity: 1,
          unit_price: item.unit_price,
          claimed_by: null
        });
      }
    }
  }
  const session = {
    id: uuid(),
    host_user_id: userId,
    host_name: user.name,
    table_number: tableNumber,
    order_ids: orderIds,
    items: groupItems,
    members: [{
      user_id: userId,
      name: user.name,
      amount: 0,
      paid: false
    }],
    status: "active",
    created_at: now()
  };
  const sessions = load("group_sessions") || [];
  sessions.push(session);
  save("group_sessions", sessions);
  broadcast("group_session_new", { sessionId: session.id });
  return session;
}
async function getGroupSession$1(sessionId) {
  ensureSeeded();
  const sessions = load("group_sessions") || [];
  return sessions.find((s) => s.id === sessionId) || null;
}
async function joinGroupSession$1(sessionId) {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Debes iniciar sesión para unirte al grupo");
  const user = await getCurrentUser$1();
  if (!user) throw new Error("Usuario no encontrado");
  const sessions = load("group_sessions") || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error("Sesión de grupo no encontrada");
  if (sessions[idx].status !== "active") throw new Error("Esta sesión ya está cerrada");
  const existing = sessions[idx].members.find((m) => m.user_id === userId);
  if (!existing) {
    sessions[idx].members.push({
      user_id: userId,
      name: user.name,
      amount: 0,
      paid: false
    });
  }
  save("group_sessions", sessions);
  broadcast("group_session_update", { sessionId });
  return sessions[idx];
}
async function claimGroupItem$1(sessionId, itemId) {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Debes iniciar sesión");
  const sessions = load("group_sessions") || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error("Sesión de grupo no encontrada");
  const itemIdx = sessions[idx].items.findIndex((i) => i.id === itemId);
  if (itemIdx < 0) throw new Error("Item no encontrado");
  sessions[idx].items[itemIdx].claimed_by = userId;
  _recalcMemberAmounts(sessions[idx]);
  save("group_sessions", sessions);
  broadcast("group_session_update", { sessionId });
  return sessions[idx];
}
async function unclaimGroupItem$1(sessionId, itemId) {
  ensureSeeded();
  const sessions = load("group_sessions") || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error("Sesión de grupo no encontrada");
  const itemIdx = sessions[idx].items.findIndex((i) => i.id === itemId);
  if (itemIdx < 0) throw new Error("Item no encontrado");
  sessions[idx].items[itemIdx].claimed_by = null;
  _recalcMemberAmounts(sessions[idx]);
  save("group_sessions", sessions);
  broadcast("group_session_update", { sessionId });
  return sessions[idx];
}
async function payGroupShare$1(sessionId) {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Debes iniciar sesión");
  const sessions = load("group_sessions") || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error("Sesión de grupo no encontrada");
  const session = sessions[idx];
  const member = session.members.find((m) => m.user_id === userId);
  if (!member) throw new Error("No eres miembro de este grupo");
  if (member.paid) throw new Error("Ya has pagado tu parte");
  if (member.amount <= 0) throw new Error("No tienes items que pagar");
  if (userId === session.host_user_id) {
    member.paid = true;
    member.paid_at = now();
    save("group_sessions", sessions);
    broadcast("group_session_update", { sessionId });
    return sessions[idx];
  }
  await payWithWallet$1(member.amount, `Pago grupo — Mesa ${session.table_number}`);
  const hostWalletKey = `wallet_user_${session.host_user_id}`;
  const hostWallet = load(hostWalletKey) || { balance: 0, transactions: [] };
  hostWallet.balance = Math.round((hostWallet.balance + member.amount) * 100) / 100;
  hostWallet.transactions.unshift({
    id: uuid(),
    type: "recharge",
    amount: member.amount,
    description: `💸 Pago de ${member.name} — grupo Mesa ${session.table_number}`,
    created_at: now()
  });
  save(hostWalletKey, hostWallet);
  member.paid = true;
  member.paid_at = now();
  save("group_sessions", sessions);
  broadcast("group_session_update", { sessionId });
  return sessions[idx];
}
async function hostPayVenue$1(sessionId) {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Debes iniciar sesión");
  const sessions = load("group_sessions") || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error("Sesión de grupo no encontrada");
  const session = sessions[idx];
  if (session.host_user_id !== userId) throw new Error("Solo el anfitrión puede pagar al local");
  const total = session.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  await payWithWallet$1(total, `Pago grupo al local — Mesa ${session.table_number}`);
  const orders = load("orders") || [];
  const ts = now();
  for (const orderId of session.order_ids) {
    const orderIdx = orders.findIndex((o) => o.id === orderId);
    if (orderIdx >= 0) {
      orders[orderIdx].status = "paid";
      orders[orderIdx].payment_method = "grupo";
      orders[orderIdx].paid_at = ts;
      orders[orderIdx].updated_at = ts;
    }
  }
  save("orders", orders);
  const ticketItems = session.items.map((i) => ({
    name: i.product_name,
    qty: i.quantity,
    price: i.unit_price
  }));
  await createTicket(session.order_ids[0], session.table_number, ticketItems, total, "grupo");
  sessions[idx].status = "completed";
  save("group_sessions", sessions);
  _notifyOrderChange();
  broadcast("group_session_complete", { sessionId });
}
function _recalcMemberAmounts(session) {
  for (const member of session.members) {
    const myItems = session.items.filter((i) => i.claimed_by === member.user_id);
    member.amount = Math.round(myItems.reduce((s, i) => s + i.unit_price * i.quantity, 0) * 100) / 100;
  }
}
async function requestPasswordReset$1(email) {
  ensureSeeded();
  const users = load("users") || [];
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) throw new Error("No se encontró una cuenta con ese email");
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
  const resets = load("password_resets") || [];
  const filtered = resets.filter((r) => r.email.toLowerCase() !== email.toLowerCase().trim());
  filtered.push({ email: email.toLowerCase().trim(), code, expires_at: expiresAt });
  save("password_resets", filtered);
  await sendPasswordResetEmail(user.name, user.email, code);
  return code;
}
async function resetPassword$1(email, code, newPassword) {
  ensureSeeded();
  const resets = load("password_resets") || [];
  const request = resets.find(
    (r) => r.email.toLowerCase() === email.toLowerCase().trim() && r.code === code
  );
  if (!request) throw new Error("Código incorrecto");
  if (new Date(request.expires_at) < /* @__PURE__ */ new Date()) throw new Error("El código ha expirado. Solicita uno nuevo.");
  const users = load("users") || [];
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (idx < 0) throw new Error("Usuario no encontrado");
  users[idx].password_hash = simpleHash(newPassword);
  save("users", users);
  save("password_resets", resets.filter((r) => r.email.toLowerCase() !== email.toLowerCase().trim()));
}

async function registerUser(name, email, password) {
  return registerUser$1(name, email, password);
}
async function loginUser(email, password) {
  return loginUser$1(email, password);
}
async function getCurrentUser() {
  return getCurrentUser$1();
}
async function requestPasswordReset(email) {
  return requestPasswordReset$1(email);
}
async function resetPassword(email, code, newPassword) {
  return resetPassword$1(email, code, newPassword);
}
async function getCategories() {
  return getCategories$1();
}
async function getProducts() {
  return getProducts$1();
}
async function upsertProduct(product) {
  return upsertProduct$1(product);
}
async function deleteProduct(productId) {
  return deleteProduct$1(productId);
}
async function toggleProductAvailability(productId, available) {
  return toggleProductAvailability$1(productId, available);
}
async function getTables() {
  return getTables$1();
}
async function upsertTable(table) {
  return upsertTable$1(table);
}
async function deleteTable(tableId) {
  return deleteTable$1(tableId);
}
async function createOrder(tableNumber, items, paymentMethod) {
  return createOrder$1(tableNumber, items);
}
async function getUnpaidOrdersByTable(tableNumber) {
  return getUnpaidOrdersByTable$1(tableNumber);
}
async function payOrders(orderIds, paymentMethod, tableNumber) {
  return payOrders$1(orderIds, paymentMethod, tableNumber);
}
async function payPartial(tableNumber, amount, paymentMethod, payerName) {
  return payPartial$1(tableNumber, amount, paymentMethod, payerName);
}
async function getPartialPayments(tableNumber) {
  return getPartialPayments$1(tableNumber);
}
async function getOrders(status) {
  return getOrders$1();
}
async function getPaidOrders(since) {
  return getPaidOrders$1();
}
async function updateOrderStatus(orderId, status, paymentMethod) {
  return updateOrderStatus$1(orderId, status, paymentMethod);
}
async function getMyTickets() {
  return getMyTickets$1();
}
async function getAdminSettings() {
  return getAdminSettings$1();
}
async function updateAdminSetting(key, value) {
  return updateAdminSetting$1(key, value);
}
function subscribeToOrders(callback) {
  return subscribeToOrders$1(callback);
}
async function getMyOrders() {
  return getMyOrders$1();
}
async function getWalletBalance() {
  return getWalletBalance$1();
}
async function getWalletTransactions() {
  return getWalletTransactions$1();
}
async function rechargeWallet(amount) {
  return rechargeWallet$1(amount);
}
async function payWithWallet(amount, description) {
  return payWithWallet$1(amount, description);
}
async function createServiceRequest(type, tableNumber, options) {
  return createServiceRequest$1(type, tableNumber, options);
}
async function getServiceRequests(status) {
  return getServiceRequests$1();
}
async function updateServiceRequestStatus(requestId, status) {
  return updateServiceRequestStatus$1(requestId, status);
}
async function createGroupSession(tableNumber, orderIds) {
  return createGroupSession$1(tableNumber, orderIds);
}
async function getGroupSession(sessionId) {
  return getGroupSession$1(sessionId);
}
async function joinGroupSession(sessionId) {
  return joinGroupSession$1(sessionId);
}
async function claimGroupItem(sessionId, itemId) {
  return claimGroupItem$1(sessionId, itemId);
}
async function unclaimGroupItem(sessionId, itemId) {
  return unclaimGroupItem$1(sessionId, itemId);
}
async function payGroupShare(sessionId) {
  return payGroupShare$1(sessionId);
}
async function hostPayVenue(sessionId) {
  return hostPayVenue$1(sessionId);
}

export { getMyTickets as A, sendTicketEmail as B, sendAllTicketsEmail as C, getMyOrders as D, getWalletTransactions as E, rechargeWallet as F, getPartialPayments as G, payPartial as H, createGroupSession as I, hostPayVenue as J, getUnpaidOrdersByTable as K, createOrder as L, registerUser as M, loginUser as N, requestPasswordReset as O, resetPassword as P, getOrders as a, getServiceRequests as b, updateServiceRequestStatus as c, getCategories as d, getProducts as e, upsertProduct as f, getAdminSettings as g, deleteProduct as h, getTables as i, upsertTable as j, deleteTable as k, getPaidOrders as l, updateAdminSetting as m, getGroupSession as n, getCurrentUser as o, payOrders as p, joinGroupSession as q, unclaimGroupItem as r, subscribeToOrders as s, toggleProductAvailability as t, updateOrderStatus as u, claimGroupItem as v, payGroupShare as w, getWalletBalance as x, payWithWallet as y, createServiceRequest as z };
