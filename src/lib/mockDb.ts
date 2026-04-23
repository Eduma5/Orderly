// ============================================
// Mock Database - Modo demo sin Supabase
// Usa localStorage para persistir datos localmente
// BroadcastChannel para comunicación entre pestañas
// ============================================
import type { Category, Product, Order, OrderItem, User, UserPublic, WalletTransaction, ServiceRequest, AllergenId, GroupSession, GroupItem, GroupMember } from './types';
import { getSessionId } from './supabase';
import { sendWelcomeEmail, sendPasswordResetEmail } from './email';

// ---- Helpers de storage ----
function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`ema_${key}`);
  return raw ? JSON.parse(raw) : null;
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ema_${key}`, JSON.stringify(data));
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---- BroadcastChannel para real-time entre pestañas ----
let _channel: BroadcastChannel | null = null;
function getBroadcast(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!_channel) {
    try { _channel = new BroadcastChannel('ema_realtime'); } catch { /* fallback */ }
  }
  return _channel;
}

function broadcast(event: string, data?: any) {
  getBroadcast()?.postMessage({ event, data, ts: Date.now() });
}

// ---- Seed Data ----
const c = (n: number) => `c1000000-0000-0000-0000-00000000000${n}`;

const SEED_CATEGORIES: Category[] = [
  { id: c(1), name: 'Cafés', description: 'Espressos, lattes y combinaciones de café', order: 1, active: true },
  { id: c(2), name: 'Tés e infusiones', description: 'Tés del mundo, infusiones y matcha', order: 2, active: true },
  { id: c(3), name: 'Batidos y smoothies', description: 'Batidos de fruta, smoothies y bowls', order: 3, active: true },
  { id: c(4), name: 'Bollería y dulces', description: 'Croissants, tartas y dulces artesanos', order: 4, active: true },
  { id: c(5), name: 'Tostas y salados', description: 'Tostas gourmet, bocadillos y salados', order: 5, active: true },
  { id: c(6), name: 'Bebidas frías', description: 'Refrescos, zumos y cervezas', order: 6, active: true },
  { id: c(7), name: 'Cachimbas', description: 'Hookah con sabores premium', order: 7, active: true },
  { id: c(8), name: 'Especiales', description: 'Combos, brunch y ofertas', order: 8, active: true },
];

let _pid = 0;
const pid = () => { _pid++; return `p1000000-0000-0000-0000-${String(_pid).padStart(12, '0')}`; };

const SEED_PRODUCTS: Product[] = [
  // ── Cafés ──
  { id: pid(), category_id: c(1), name: 'Café solo', description: 'Espresso intenso 100% arábica', price: 1.20, cost: 0.25, image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop', tags: ['hot','energizing','bitter'], allergens: ['sulfitos'], available: true, order: 1 },
  { id: pid(), category_id: c(1), name: 'Café con leche', description: 'Espresso con leche cremosa de origen', price: 1.50, cost: 0.35, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', tags: ['hot','energizing','creamy'], allergens: ['lacteos'], available: true, order: 2 },
  { id: pid(), category_id: c(1), name: 'Cortado', description: 'Espresso cortado con un toque de leche', price: 1.30, cost: 0.28, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop', tags: ['hot','energizing'], allergens: ['lacteos'], available: true, order: 3 },
  { id: pid(), category_id: c(1), name: 'Cappuccino', description: 'Espresso con leche espumosa y cacao', price: 2.00, cost: 0.45, image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', tags: ['hot','energizing','creamy','sweet'], allergens: ['lacteos','soja'], available: true, order: 4 },
  { id: pid(), category_id: c(1), name: 'Café bombón', description: 'Espresso con leche condensada artesana', price: 1.80, cost: 0.40, image_url: 'https://images.unsplash.com/photo-1595981234058-a9302fb97229?w=400&h=400&fit=crop', tags: ['hot','energizing','sweet'], allergens: ['lacteos'], available: true, order: 5 },
  { id: pid(), category_id: c(1), name: 'Latte macchiato', description: 'Capas de leche y espresso con espuma densa', price: 2.20, cost: 0.50, image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=400&fit=crop', tags: ['hot','energizing','creamy','sweet'], allergens: ['lacteos','soja'], available: true, order: 6 },
  { id: pid(), category_id: c(1), name: 'Café con hielo', description: 'Espresso doble servido con vaso de hielo', price: 1.60, cost: 0.30, image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop', tags: ['cold','fresh','energizing'], allergens: ['sulfitos'], available: true, order: 7 },
  { id: pid(), category_id: c(1), name: 'Affogato', description: 'Espresso caliente sobre helado de vainilla', price: 3.00, cost: 0.80, image_url: 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400&h=400&fit=crop', tags: ['sweet','cold','energizing','creamy'], allergens: ['lacteos','huevos','soja'], available: true, order: 8 },
  { id: pid(), category_id: c(1), name: 'Café irlandés', description: 'Café, whisky, nata montada y canela', price: 4.50, cost: 1.50, image_url: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400&h=400&fit=crop', tags: ['hot','sweet','alcohol','special'], allergens: ['lacteos','sulfitos'], available: true, order: 9 },
  // ── Tés e infusiones ──
  { id: pid(), category_id: c(2), name: 'Té verde Sencha', description: 'Té verde japonés con notas herbales suaves', price: 1.80, cost: 0.30, image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop', tags: ['hot','relaxing','healthy'], allergens: ['sulfitos'], available: true, order: 1 },
  { id: pid(), category_id: c(2), name: 'Té negro English Breakfast', description: 'Clásico, intenso, ideal con leche', price: 1.80, cost: 0.28, image_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop', tags: ['hot','energizing'], allergens: ['sulfitos'], available: true, order: 2 },
  { id: pid(), category_id: c(2), name: 'Chai latte', description: 'Té negro con especias, leche espumada y canela', price: 2.80, cost: 0.55, image_url: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=400&fit=crop', tags: ['hot','sweet','creamy','spicy'], allergens: ['lacteos','gluten'], available: true, order: 3 },
  { id: pid(), category_id: c(2), name: 'Manzanilla con miel', description: 'Infusión relajante con miel natural', price: 1.60, cost: 0.25, image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop', tags: ['hot','relaxing','sweet','healthy'], allergens: ['sulfitos'], available: true, order: 4 },
  { id: pid(), category_id: c(2), name: 'Matcha latte', description: 'Matcha ceremonial batido con leche de avena', price: 3.20, cost: 0.80, image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=400&fit=crop', tags: ['hot','energizing','healthy','creamy'], allergens: ['gluten','soja'], available: true, order: 5 },
  { id: pid(), category_id: c(2), name: 'Rooibos vainilla', description: 'Infusión sudafricana sin teína con vainilla', price: 2.00, cost: 0.35, image_url: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop', tags: ['hot','relaxing','sweet'], allergens: ['sulfitos'], available: true, order: 6 },
  { id: pid(), category_id: c(2), name: 'Té helado de melocotón', description: 'Té negro frío con melocotón natural y hielo', price: 2.50, cost: 0.45, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','fruity'], allergens: ['sulfitos'], available: true, order: 7 },
  { id: pid(), category_id: c(2), name: 'Golden milk', description: 'Leche de coco con cúrcuma, jengibre y canela', price: 3.00, cost: 0.60, image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop', tags: ['hot','healthy','spicy','relaxing'], allergens: ['soja'], available: true, order: 8 },
  // ── Batidos y smoothies ──
  { id: pid(), category_id: c(3), name: 'Batido de fresa', description: 'Fresas frescas de temporada con leche', price: 3.50, cost: 1.00, image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','fruity'], allergens: ['lacteos'], available: true, order: 1 },
  { id: pid(), category_id: c(3), name: 'Batido de mango', description: 'Mango tropical con yogur griego', price: 3.50, cost: 1.10, image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','fruity','tropical'], allergens: ['lacteos'], available: true, order: 2 },
  { id: pid(), category_id: c(3), name: 'Smoothie verde', description: 'Espinacas, plátano, manzana y jengibre', price: 4.00, cost: 1.20, image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop', tags: ['cold','fresh','healthy','energizing'], allergens: ['apio'], available: true, order: 3 },
  { id: pid(), category_id: c(3), name: 'Açaí bowl', description: 'Açaí con granola, plátano y frutos rojos', price: 5.50, cost: 1.80, image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','healthy','fruity'], allergens: ['gluten','frutos_cascara','soja'], available: true, order: 4 },
  { id: pid(), category_id: c(3), name: 'Batido de plátano y chocolate', description: 'Plátano maduro con cacao puro y leche', price: 3.80, cost: 1.05, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop', tags: ['cold','sweet','creamy','chocolate'], allergens: ['lacteos','soja'], available: true, order: 5 },
  { id: pid(), category_id: c(3), name: 'Smoothie tropical', description: 'Piña, coco, mango y lima', price: 4.20, cost: 1.30, image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','tropical','fruity'], allergens: ['sulfitos'], available: true, order: 6 },
  // ── Bollería y dulces ──
  { id: pid(), category_id: c(4), name: 'Croissant de mantequilla', description: 'Croissant artesano, crujiente y hojaldrado', price: 1.80, cost: 0.50, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=400&fit=crop', tags: ['sweet','pastry'], allergens: ['gluten','lacteos','huevos','soja'], available: true, order: 1 },
  { id: pid(), category_id: c(4), name: 'Tostada con tomate', description: 'Pan cristal con tomate rallado y AOVE', price: 2.50, cost: 0.60, image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop', tags: ['salty','healthy'], allergens: ['gluten','sesamo'], available: true, order: 2 },
  { id: pid(), category_id: c(4), name: 'Napolitana de chocolate', description: 'Hojaldre crujiente relleno de chocolate belga', price: 2.00, cost: 0.55, image_url: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=400&fit=crop', tags: ['sweet','pastry','chocolate'], allergens: ['gluten','lacteos','huevos','soja'], available: true, order: 3 },
  { id: pid(), category_id: c(4), name: 'Carrot cake', description: 'Bizcocho de zanahoria con frosting de queso crema', price: 3.80, cost: 1.00, image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop', tags: ['sweet','pastry','creamy'], allergens: ['gluten','lacteos','huevos','frutos_cascara','soja'], available: true, order: 4 },
  { id: pid(), category_id: c(4), name: 'Cookie de chocolate', description: 'Cookie XXL con pepitas de chocolate negro', price: 2.50, cost: 0.65, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop', tags: ['sweet','chocolate'], allergens: ['gluten','lacteos','huevos','soja','frutos_cascara'], available: true, order: 5 },
  { id: pid(), category_id: c(4), name: 'Cheesecake', description: 'Tarta de queso cremosa con coulis de frutos rojos', price: 4.20, cost: 1.10, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop', tags: ['sweet','creamy','fruity'], allergens: ['gluten','lacteos','huevos','soja'], available: true, order: 6 },
  { id: pid(), category_id: c(4), name: 'Brownie con nueces', description: 'Brownie casero de chocolate negro con nueces', price: 3.50, cost: 0.90, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop', tags: ['sweet','chocolate'], allergens: ['gluten','lacteos','huevos','frutos_cascara','soja'], available: true, order: 7 },
  { id: pid(), category_id: c(4), name: 'Muffin de arándanos', description: 'Muffin esponjoso con arándanos frescos', price: 2.80, cost: 0.60, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop', tags: ['sweet','fruity','pastry'], allergens: ['gluten','lacteos','huevos','soja'], available: true, order: 8 },
  // ── Tostas y salados ──
  { id: pid(), category_id: c(5), name: 'Tosta de aguacate', description: 'Aguacate, tomate cherry, semillas y lima', price: 4.50, cost: 1.50, image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop', tags: ['salty','healthy','fresh'], allergens: ['gluten','sesamo','sulfitos'], available: true, order: 1 },
  { id: pid(), category_id: c(5), name: 'Tosta de salmón', description: 'Salmón ahumado, queso crema, eneldo y alcaparras', price: 5.00, cost: 1.80, image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop', tags: ['salty','protein'], allergens: ['gluten','pescado','lacteos','mostaza'], available: true, order: 2 },
  { id: pid(), category_id: c(5), name: 'Tosta de jamón ibérico', description: 'Jamón ibérico de bellota con tomate y AOVE', price: 5.50, cost: 2.20, image_url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=400&fit=crop', tags: ['salty','protein','special'], allergens: ['gluten','sulfitos'], available: true, order: 3 },
  { id: pid(), category_id: c(5), name: 'Tortilla española', description: 'Pincho de tortilla de patata casera', price: 3.00, cost: 0.80, image_url: 'https://images.unsplash.com/photo-1623246123320-0d6636755796?w=400&h=400&fit=crop', tags: ['salty','hot','protein'], allergens: ['huevos','sulfitos'], available: true, order: 4 },
  { id: pid(), category_id: c(5), name: 'Bikini mixto', description: 'Sándwich de jamón y queso fundido en pan brioche', price: 3.50, cost: 0.90, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop', tags: ['salty','hot','protein'], allergens: ['gluten','lacteos','mostaza'], available: true, order: 5 },
  { id: pid(), category_id: c(5), name: 'Wrap de pollo Caesar', description: 'Pollo a la plancha, lechuga, parmesano y salsa Caesar', price: 5.00, cost: 1.60, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop', tags: ['salty','protein','fresh'], allergens: ['gluten','lacteos','huevos','pescado','mostaza'], available: true, order: 6 },
  { id: pid(), category_id: c(5), name: 'Nachos con guacamole', description: 'Nachos caseros con guacamole, pico de gallo y jalapeños', price: 5.50, cost: 1.40, image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=400&fit=crop', tags: ['salty','spicy','sharing'], allergens: ['gluten','lacteos','sulfitos'], available: true, order: 7 },
  { id: pid(), category_id: c(5), name: 'Hummus con crudités', description: 'Hummus casero con bastones de zanahoria, pepino y pan pita', price: 4.50, cost: 1.10, image_url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=400&fit=crop', tags: ['salty','healthy','sharing','fresh'], allergens: ['gluten','sesamo','apio'], available: true, order: 8 },
  // ── Bebidas frías ──
  { id: pid(), category_id: c(6), name: 'Agua mineral', description: '50cl - Bezoya', price: 1.00, cost: 0.25, image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop', tags: ['cold','fresh'], allergens: [], available: true, order: 1 },
  { id: pid(), category_id: c(6), name: 'Refresco', description: 'Coca-Cola, Fanta, Nestea, Aquarius', price: 2.00, cost: 0.50, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop', tags: ['cold','sweet','fresh'], allergens: ['sulfitos'], available: true, order: 2 },
  { id: pid(), category_id: c(6), name: 'Zumo de naranja natural', description: 'Recién exprimido, mínimo 4 naranjas', price: 3.00, cost: 0.90, image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop', tags: ['cold','fresh','healthy','fruity'], allergens: ['sulfitos'], available: true, order: 3 },
  { id: pid(), category_id: c(6), name: 'Limonada casera', description: 'Limón, hierbabuena, azúcar de caña y hielo', price: 3.00, cost: 0.70, image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','fruity'], allergens: ['sulfitos'], available: true, order: 4 },
  { id: pid(), category_id: c(6), name: 'Cerveza artesanal', description: 'IPA local de barril — 33cl', price: 3.50, cost: 1.00, image_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop', tags: ['cold','fresh','alcohol'], allergens: ['gluten','sulfitos'], available: true, order: 5 },
  { id: pid(), category_id: c(6), name: 'Tinto de verano', description: 'Vino tinto con gaseosa de limón y hielo', price: 2.50, cost: 0.60, image_url: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=400&fit=crop', tags: ['cold','fresh','alcohol','fruity'], allergens: ['sulfitos'], available: true, order: 6 },
  { id: pid(), category_id: c(6), name: 'Mojito sin alcohol', description: 'Lima, hierbabuena, azúcar moreno y soda', price: 3.50, cost: 0.80, image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','fruity'], allergens: ['sulfitos'], available: true, order: 7 },
  { id: pid(), category_id: c(6), name: 'Granizado de limón', description: 'Hielo picado con zumo de limón natural', price: 2.50, cost: 0.50, image_url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop', tags: ['cold','fresh','sweet','fruity'], allergens: ['sulfitos'], available: true, order: 8 },
  // ── Cachimbas ──
  { id: pid(), category_id: c(7), name: 'Cachimba Doble Manzana', description: 'El clásico sabor de doble manzana con menta fresca', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop', tags: ['hookah','fresh','fruity','popular'], allergens: [], available: true, order: 1 },
  { id: pid(), category_id: c(7), name: 'Cachimba Sandía Ice', description: 'Sandía refrescante con toque mentolado', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop', tags: ['hookah','fresh','fruity','cold'], allergens: [], available: true, order: 2 },
  { id: pid(), category_id: c(7), name: 'Cachimba Uva Menta', description: 'Uva dulce combinada con menta refrescante', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop', tags: ['hookah','fresh','sweet','fruity'], allergens: [], available: true, order: 3 },
  { id: pid(), category_id: c(7), name: 'Cachimba Melocotón', description: 'Sabor suave y dulce de melocotón maduro', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop', tags: ['hookah','sweet','fruity'], allergens: [], available: true, order: 4 },
  { id: pid(), category_id: c(7), name: 'Cachimba Mango Tango', description: 'Mango tropical con un toque exótico', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop', tags: ['hookah','sweet','tropical','fruity'], allergens: [], available: true, order: 5 },
  { id: pid(), category_id: c(7), name: 'Cachimba Fresa Helada', description: 'Fresa dulce con efecto ice intenso', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop', tags: ['hookah','cold','sweet','fruity'], allergens: [], available: true, order: 6 },
  { id: pid(), category_id: c(7), name: 'Cachimba Blueberry Mint', description: 'Arándanos azules con menta suave', price: 8.00, cost: 2.50, image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop', tags: ['hookah','fresh','fruity'], allergens: [], available: true, order: 7 },
  { id: pid(), category_id: c(7), name: 'Cachimba Love 66', description: 'Mezcla de frutas del bosque con toque mentolado', price: 9.00, cost: 3.00, image_url: 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop', tags: ['hookah','fresh','fruity','popular','special'], allergens: [], available: true, order: 8 },
  { id: pid(), category_id: c(7), name: 'Cachimba Premium Mix', description: 'Combinación exclusiva de la casa — sabor sorpresa', price: 10.00, cost: 3.50, image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop', tags: ['hookah','special','popular'], allergens: [], available: true, order: 9 },
  // ── Especiales ──
  { id: pid(), category_id: c(8), name: 'Brunch ORDERLY', description: 'Café/té + zumo + tosta + fruta + bollería', price: 9.90, cost: 3.50, image_url: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=400&fit=crop', tags: ['special','sweet','salty','sharing'], allergens: ['gluten','lacteos','huevos','sesamo','frutos_cascara','soja'], available: true, order: 1 },
  { id: pid(), category_id: c(8), name: 'Merienda especial', description: 'Chai latte o chocolate + croissant + tarta', price: 6.90, cost: 2.20, image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', tags: ['special','sweet','hot'], allergens: ['gluten','lacteos','huevos','soja','frutos_cascara'], available: true, order: 2 },
  { id: pid(), category_id: c(8), name: 'Chocolate a la taza', description: 'Chocolate negro 70% fundido con churros (6 uds)', price: 4.50, cost: 1.30, image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop', tags: ['hot','sweet','chocolate','special'], allergens: ['gluten','lacteos','soja','huevos'], available: true, order: 3 },
  { id: pid(), category_id: c(8), name: 'Combo Cachimba + Bebida', description: 'Cualquier cachimba + bebida a elegir', price: 10.50, cost: 3.50, image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop', tags: ['hookah','special','popular'], allergens: ['sulfitos'], available: true, order: 4 },
  { id: pid(), category_id: c(8), name: 'Combo Cachimba + 2 Bebidas', description: 'Cualquier cachimba + 2 bebidas a elegir', price: 13.00, cost: 4.20, image_url: 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=400&h=400&fit=crop', tags: ['hookah','special','sharing','popular'], allergens: ['sulfitos'], available: true, order: 5 },
  { id: pid(), category_id: c(8), name: 'Tarde de chicas', description: 'Cachimba + 2 batidos + tarta para compartir', price: 18.00, cost: 6.00, image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop', tags: ['hookah','sweet','sharing','special','popular'], allergens: ['lacteos','gluten','huevos','soja','frutos_cascara'], available: true, order: 6 },
];

interface MockTable {
  id: string;
  number: number;
  name: string | null;
  active: boolean;
}

const SEED_TABLES: MockTable[] = Array.from({ length: 15 }, (_, i) => ({
  id: `t1000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
  number: i + 1,
  name: null,
  active: true,
}));

const SEED_SETTINGS: Record<string, string> = {
  business_name: 'ORDERLY',
  admin_password: 'orderly2026',
  bizum_phone: '612345678',
  stripe_enabled: 'false',
  cash_enabled: 'true',
  bizum_enabled: 'true',
  base_url: '',
  logo_url: '/logo.png',
  header_url: '/header.png',
};

// ---- Inicialización ----
function ensureSeeded(): void {
  if (typeof window === 'undefined') return;
  if (!load('categories')) save('categories', SEED_CATEGORIES);
  if (!load('products')) save('products', SEED_PRODUCTS);
  if (!load('tables')) save('tables', SEED_TABLES);
  if (!load('orders')) save('orders', []);
  if (!load('order_items')) save('order_items', []);
  if (!load('tickets')) save('tickets', []);
  if (!load('settings')) save('settings', SEED_SETTINGS);
  if (!load('users')) save('users', []);

  // Migration: restore allergens/tags lost by previous versions
  // v2: force-update all allergens to latest seed data
  if (!load('_migrated_allergens_v2')) {
    const prods = load<Product[]>('products') || [];
    const seedMap = new Map(SEED_PRODUCTS.map((p) => [p.name, p]));
    let changed = false;
    for (const p of prods) {
      const seed = seedMap.get(p.name);
      if (seed) {
        if (JSON.stringify(p.allergens || []) !== JSON.stringify(seed.allergens || [])) {
          p.allergens = seed.allergens;
          changed = true;
        }
        if ((!p.tags || p.tags.length === 0) && seed.tags && seed.tags.length > 0) {
          p.tags = seed.tags;
          changed = true;
        }
      }
    }
    if (changed) save('products', prods);
    save('_migrated_allergens_v2', true);
  }
}

// ===========================================
// USUARIOS - Registro / Login / Sesión
// ===========================================
function simpleHash(str: string): string {
  // Hash simple para demo — NOT criptográficamente seguro
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h = ((h << 5) - h) + ch;
    h |= 0;
  }
  return 'h_' + Math.abs(h).toString(36);
}

export async function registerUser(name: string, email: string, password: string): Promise<UserPublic> {
  ensureSeeded();
  const users = load<User[]>('users') || [];
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) throw new Error('Ya existe una cuenta con ese email');

  const user: User = {
    id: uuid(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash: simpleHash(password),
    created_at: now(),
  };
  users.push(user);
  save('users', users);

  // Crear monedero inicial con 10€ de regalo
  const walletKey = `wallet_user_${user.id}`;
  save(walletKey, {
    balance: 10,
    transactions: [{
      id: uuid(),
      type: 'recharge',
      amount: 10,
      description: '🎉 Bienvenido a ORDERLY — saldo de regalo',
      created_at: now(),
    }],
  });

  // Auto-login
  localStorage.setItem('ema_user_id', user.id);
  localStorage.setItem('ema_user_token', `demo_${user.id}`);

  // Enviar email de bienvenida (async, sin bloquear)
  sendWelcomeEmail(user.name, user.email).catch((_err: unknown) =>
    console.warn('No se pudo enviar el email de bienvenida:', _err)
  );

  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}

export async function loginUser(email: string, password: string): Promise<UserPublic> {
  ensureSeeded();
  const users = load<User[]>('users') || [];
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) throw new Error('No se encontró una cuenta con ese email');
  if (user.password_hash !== simpleHash(password)) throw new Error('Contraseña incorrecta');

  localStorage.setItem('ema_user_id', user.id);
  localStorage.setItem('ema_user_token', `demo_${user.id}`);

  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  ensureSeeded();
  const userId = typeof window !== 'undefined' ? localStorage.getItem('ema_user_id') : null;
  if (!userId) return null;

  const users = load<User[]>('users') || [];
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}

export async function logoutUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ema_user_id');
    localStorage.removeItem('ema_user_token');
  }
}

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ema_user_id');
}

// ---- CATEGORÍAS ----
export async function getCategories(): Promise<Category[]> {
  ensureSeeded();
  const cats = load<Category[]>('categories') || [];
  return cats.filter((c) => c.active).sort((a, b) => a.order - b.order);
}

// ---- PRODUCTOS ----
export async function getProducts(): Promise<Product[]> {
  ensureSeeded();
  return (load<Product[]>('products') || []).sort((a, b) => a.order - b.order);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  ensureSeeded();
  return (load<Product[]>('products') || [])
    .filter((p) => p.category_id === categoryId && p.available)
    .sort((a, b) => a.order - b.order);
}

export async function upsertProduct(
  product: Partial<Product> & { category_id: string; name: string; price: number }
): Promise<Product> {
  ensureSeeded();
  const prods = load<Product[]>('products') || [];
  const idx = product.id ? prods.findIndex((p) => p.id === product.id) : -1;
  const full: Product = {
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
    order: product.order ?? prods.length,
  };
  if (idx >= 0) prods[idx] = full; else prods.push(full);
  save('products', prods);
  return full;
}

export async function deleteProduct(productId: string): Promise<void> {
  ensureSeeded();
  save('products', (load<Product[]>('products') || []).filter((p) => p.id !== productId));
}

export async function toggleProductAvailability(productId: string, available: boolean): Promise<void> {
  ensureSeeded();
  const prods = load<Product[]>('products') || [];
  const idx = prods.findIndex((p) => p.id === productId);
  if (idx >= 0) { prods[idx].available = available; save('products', prods); }
}

// ---- MESAS ----
export async function getTables() {
  ensureSeeded();
  return (load<MockTable[]>('tables') || []).sort((a, b) => a.number - b.number);
}

export async function upsertTable(table: { id?: string; number: number; name?: string; active?: boolean }) {
  ensureSeeded();
  const tables = load<MockTable[]>('tables') || [];
  const idx = table.id ? tables.findIndex((t) => t.id === table.id) : -1;
  const full: MockTable = { id: table.id || uuid(), number: table.number, name: table.name || null, active: table.active ?? true };
  if (idx >= 0) tables[idx] = full; else tables.push(full);
  save('tables', tables);
  return full;
}

export async function deleteTable(tableId: string) {
  ensureSeeded();
  save('tables', (load<MockTable[]>('tables') || []).filter((t) => t.id !== tableId));
}

// ---- PEDIDOS ----
interface MockOrder {
  id: string;
  table_number: number;
  session_id: string;
  user_id: string | null;
  user_name: string | null;
  status: string;
  total: number;
  total_cost: number;
  payment_method: string | null;
  stripe_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

interface MockOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  notes: string | null;
  created_at: string;
}

interface MockTicket {
  id: string;
  order_id: string;
  ticket_number: number;
  table_number: number;
  session_id: string;
  total: number;
  payment_method: string;
  items: any[];
  created_at: string;
}

function joinOrders(orders: MockOrder[]): any[] {
  const allItems = load<MockOrderItem[]>('order_items') || [];
  return orders.map((o) => ({
    ...o,
    items: allItems.filter((i) => i.order_id === o.id),
  }));
}

export async function createOrder(
  tableNumber: number,
  items: { product: Product; quantity: number; notes?: string }[],
  paymentMethod?: string
): Promise<Order> {
  ensureSeeded();
  const sessionId = getSessionId();
  const userId = getCurrentUserId();
  const user = userId ? (await getCurrentUser()) : null;
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalCost = items.reduce((sum, i) => sum + (i.product.cost || 0) * i.quantity, 0);
  const ts = now();

  const order: MockOrder = {
    id: uuid(),
    table_number: tableNumber,
    session_id: sessionId,
    user_id: userId,
    user_name: user?.name || null,
    status: 'pending',
    total,
    total_cost: totalCost,
    payment_method: paymentMethod || null,
    stripe_payment_id: null,
    notes: null,
    created_at: ts,
    updated_at: ts,
    paid_at: null,
  };

  const orderItems: MockOrderItem[] = items.map((item) => ({
    id: uuid(),
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    unit_cost: item.product.cost || 0,
    notes: item.notes || null,
    created_at: ts,
  }));

  const existingOrders = load<MockOrder[]>('orders') || [];
  existingOrders.push(order);
  save('orders', existingOrders);

  const existingItems = load<MockOrderItem[]>('order_items') || [];
  existingItems.push(...orderItems);
  save('order_items', existingItems);

  _notifyOrderChange();
  broadcast('order_new', { orderId: order.id, tableNumber });

  return { ...order, items: orderItems } as unknown as Order;
}

export async function getUnpaidOrdersByTable(tableNumber: number) {
  ensureSeeded();
  const sessionId = getSessionId();
  const orders = load<MockOrder[]>('orders') || [];
  const filtered = orders.filter(
    (o) => o.table_number === tableNumber && o.session_id === sessionId && o.status !== 'paid'
  );
  filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return joinOrders(filtered);
}

export async function payOrders(
  orderIds: string[],
  paymentMethod: string,
  tableNumber: number
): Promise<void> {
  ensureSeeded();
  const ts = now();
  const orders = load<MockOrder[]>('orders') || [];

  for (const orderId of orderIds) {
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = 'paid';
      orders[idx].payment_method = paymentMethod;
      orders[idx].paid_at = ts;
      orders[idx].updated_at = ts;
    }
  }
  save('orders', orders);

  // Crear ticket
  const allItems = load<MockOrderItem[]>('order_items') || [];
  const ticketItems: { name: string; qty: number; price: number }[] = [];
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
  broadcast('order_paid', { orderIds, tableNumber });
}

/** Pago parcial: paga una cantidad de los pedidos de la mesa */
export async function payPartial(
  tableNumber: number,
  amount: number,
  paymentMethod: string,
  payerName: string
): Promise<void> {
  ensureSeeded();
  const sessionId = getSessionId();
  const orders = load<MockOrder[]>('orders') || [];
  const ts = now();

  // Buscar pedidos sin pagar de esta mesa ordenados por fecha
  const unpaidIds = orders
    .filter((o) => o.table_number === tableNumber && o.session_id === sessionId && o.status !== 'paid')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((o) => o.id);

  // Registrar pago parcial
  const partialPayments = load<any[]>('partial_payments') || [];
  partialPayments.push({
    id: uuid(),
    table_number: tableNumber,
    session_id: sessionId,
    amount,
    payment_method: paymentMethod,
    payer_name: payerName,
    order_ids: unpaidIds,
    created_at: ts,
  });
  save('partial_payments', partialPayments);

  // Comprobar si el total parcial cubre todos los pedidos
  const totalUnpaid = orders
    .filter((o) => unpaidIds.includes(o.id))
    .reduce((s, o) => s + o.total, 0);

  const totalPaid = partialPayments
    .filter((p) => p.session_id === sessionId && p.table_number === tableNumber)
    .reduce((s, p) => s + p.amount, 0);

  if (totalPaid >= totalUnpaid) {
    // Todos los pedidos quedan pagados
    for (const orderId of unpaidIds) {
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        orders[idx].status = 'paid';
        orders[idx].payment_method = 'split';
        orders[idx].paid_at = ts;
        orders[idx].updated_at = ts;
      }
    }
    save('orders', orders);

    const allItems = load<MockOrderItem[]>('order_items') || [];
    const ticketItems: { name: string; qty: number; price: number }[] = [];
    for (const orderId of unpaidIds) {
      allItems.filter((i) => i.order_id === orderId).forEach((item) => {
        ticketItems.push({ name: item.product_name, qty: item.quantity, price: item.unit_price });
      });
    }
    await createTicket(unpaidIds[0], tableNumber, ticketItems, totalUnpaid, 'split');
  }

  _notifyOrderChange();
  broadcast('order_partial_pay', { tableNumber, amount, payerName });
}

/** Obtener pagos parciales de la mesa actual */
export async function getPartialPayments(tableNumber: number) {
  ensureSeeded();
  const sessionId = getSessionId();
  const payments = load<any[]>('partial_payments') || [];
  return payments.filter((p) => p.table_number === tableNumber && p.session_id === sessionId);
}

export async function getRecentPartialPayments(limit = 30) {
  ensureSeeded();
  const payments = load<any[]>('partial_payments') || [];
  return payments
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getOrders(status?: string): Promise<Order[]> {
  ensureSeeded();
  const orders = load<MockOrder[]>('orders') || [];
  let filtered: MockOrder[];
  if (status) {
    filtered = orders.filter((o) => o.status === status);
  } else {
    filtered = orders.filter((o) => o.status !== 'paid');
  }
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return joinOrders(filtered) as unknown as Order[];
}

export async function getPaidOrders(since?: string) {
  ensureSeeded();
  const orders = load<MockOrder[]>('orders') || [];
  let filtered = orders.filter((o) => o.status === 'paid');
  if (since) filtered = filtered.filter((o) => o.paid_at && o.paid_at >= since);
  filtered.sort((a, b) => {
    const ta = a.paid_at ? new Date(a.paid_at).getTime() : 0;
    const tb = b.paid_at ? new Date(b.paid_at).getTime() : 0;
    return tb - ta;
  });
  return joinOrders(filtered);
}

export async function updateOrderStatus(orderId: string, status: string, paymentMethod?: string): Promise<void> {
  ensureSeeded();
  const orders = load<MockOrder[]>('orders') || [];
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    orders[idx].updated_at = now();
    if (status === 'paid') {
      orders[idx].paid_at = now();
      if (paymentMethod) orders[idx].payment_method = paymentMethod;
    }
    save('orders', orders);
  }
  _notifyOrderChange();
  broadcast('order_status', { orderId, status });
}

export async function setOrderStripePaymentId(orderId: string, stripePaymentId: string): Promise<void> {
  ensureSeeded();
  const orders = load<MockOrder[]>('orders') || [];
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) { orders[idx].stripe_payment_id = stripePaymentId; save('orders', orders); }
}

// ---- TICKETS ----
let _ticketCounter = 0;

export async function createTicket(
  orderId: string,
  tableNumber: number,
  items: { name: string; qty: number; price: number }[],
  total: number,
  paymentMethod: string
) {
  ensureSeeded();
  const sessionId = getSessionId();
  const tickets = load<MockTicket[]>('tickets') || [];
  _ticketCounter = tickets.length;
  const ticket: MockTicket = {
    id: uuid(),
    order_id: orderId,
    ticket_number: ++_ticketCounter,
    table_number: tableNumber,
    session_id: sessionId,
    total,
    payment_method: paymentMethod,
    items,
    created_at: now(),
  };
  tickets.push(ticket);
  save('tickets', tickets);
  return ticket;
}

export async function getMyTickets() {
  ensureSeeded();
  const sessionId = getSessionId();
  return (load<MockTicket[]>('tickets') || [])
    .filter((t) => t.session_id === sessionId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ---- ADMIN SETTINGS ----
export async function getAdminSettings(): Promise<Record<string, string>> {
  ensureSeeded();
  return load<Record<string, string>>('settings') || {};
}

export async function updateAdminSetting(key: string, value: string): Promise<void> {
  ensureSeeded();
  const settings = load<Record<string, string>>('settings') || {};
  settings[key] = value;
  save('settings', settings);
}

// ---- REALTIME (BroadcastChannel + StorageEvent + polling) ----
const _orderListeners: Array<(payload: any) => void> = [];

function _notifyOrderChange() {
  _orderListeners.forEach((cb) => {
    try { cb({ eventType: 'UPDATE', table: 'orders' }); } catch { /* ignore */ }
  });
}

export function subscribeToOrders(callback: (payload: any) => void) {
  _orderListeners.push(callback);

  // 1. BroadcastChannel — comunicación directa entre pestañas
  const ch = getBroadcast();
  const bcHandler = (e: MessageEvent) => {
    if (e.data?.event?.startsWith('order_')) {
      try { callback({ eventType: 'BROADCAST', ...e.data }); } catch { /* ignore */ }
    }
  };
  ch?.addEventListener('message', bcHandler);

  // 2. StorageEvent — fallback cuando BroadcastChannel no funciona (ej: iframes)
  //    Se dispara cuando OTRA pestaña modifica localStorage
  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'ema_orders' || e.key === 'ema_order_items') {
      try { callback({ eventType: 'STORAGE', key: e.key }); } catch { /* ignore */ }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  // 3. Polling cada 2s como fallback final (más reactivo que antes)
  const interval = setInterval(() => {
    try { callback({ eventType: 'POLL', table: 'orders' }); } catch { /* ignore */ }
  }, 2000);

  return {
    unsubscribe: () => {
      clearInterval(interval);
      ch?.removeEventListener('message', bcHandler);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', storageHandler);
      }
      const idx = _orderListeners.indexOf(callback);
      if (idx >= 0) _orderListeners.splice(idx, 1);
    },
  };
}

// ---- CLIENTE: Mis pedidos ----
export async function getMyOrders() {
  ensureSeeded();
  const sessionId = getSessionId();
  const orders = load<MockOrder[]>('orders') || [];
  const myOrders = orders
    .filter((o) => o.session_id === sessionId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return joinOrders(myOrders);
}

// ===========================================
// MONEDERO / WALLET — vinculado al USUARIO
// ===========================================
interface MockWallet {
  balance: number;
  transactions: WalletTransaction[];
}

function getWalletKey(): string {
  const userId = getCurrentUserId();
  if (userId) return `wallet_user_${userId}`;
  // Fallback a sesión si no hay usuario (no debería pasar)
  return `wallet_${getSessionId()}`;
}

function getWallet(): MockWallet {
  return load<MockWallet>(getWalletKey()) || { balance: 0, transactions: [] };
}

export async function getWalletBalance(): Promise<number> {
  return getWallet().balance;
}

export async function getWalletTransactions(): Promise<WalletTransaction[]> {
  return getWallet().transactions;
}

export async function rechargeWallet(amount: number): Promise<number> {
  const w = getWallet();
  w.balance = Math.round((w.balance + amount) * 100) / 100;
  w.transactions.unshift({
    id: uuid(),
    type: 'recharge',
    amount,
    description: `Recarga de ${amount.toFixed(2)} €`,
    created_at: now(),
  });
  save(getWalletKey(), w);
  return w.balance;
}

export async function payWithWallet(amount: number, description: string): Promise<number> {
  const w = getWallet();
  if (w.balance < amount) throw new Error('Saldo insuficiente');
  w.balance = Math.round((w.balance - amount) * 100) / 100;
  w.transactions.unshift({
    id: uuid(),
    type: 'payment',
    amount,
    description,
    created_at: now(),
  });
  save(getWalletKey(), w);
  return w.balance;
}

// ===========================================
// SOLICITUDES DE SERVICIO (datáfono, camarero)
// ===========================================
export async function createServiceRequest(
  type: ServiceRequest['type'],
  tableNumber: number,
  options?: {
    method?: ServiceRequest['method'];
    total?: number;
    orderIds?: string[];
    message?: string;
  }
): Promise<ServiceRequest> {
  ensureSeeded();
  const userId = getCurrentUserId();
  const user = userId ? (await getCurrentUser()) : null;
  const ts = now();

  const request: ServiceRequest = {
    id: uuid(),
    type,
    method: options?.method,
    table_number: tableNumber,
    user_id: userId,
    user_name: user?.name || null,
    status: 'pending',
    total: options?.total,
    order_ids: options?.orderIds,
    message: options?.message,
    created_at: ts,
    updated_at: ts,
  };

  const requests = load<ServiceRequest[]>('service_requests') || [];
  requests.unshift(request);
  save('service_requests', requests);

  _notifyOrderChange();
  broadcast('service_request_new', {
    requestId: request.id,
    type: request.type,
    method: request.method,
    tableNumber,
    userName: request.user_name,
    total: request.total,
  });

  return request;
}

export async function getServiceRequests(status?: string): Promise<ServiceRequest[]> {
  ensureSeeded();
  const requests = load<ServiceRequest[]>('service_requests') || [];
  let filtered = requests;
  if (status) {
    filtered = requests.filter((r) => r.status === status);
  }
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: ServiceRequest['status']
): Promise<void> {
  ensureSeeded();
  const requests = load<ServiceRequest[]>('service_requests') || [];
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx >= 0) {
    requests[idx].status = status;
    requests[idx].updated_at = now();
    save('service_requests', requests);
  }
  _notifyOrderChange();
  broadcast('service_request_update', { requestId, status });
}

// ===========================================
// PAGO DIVIDIDO POR GRUPOS
// ===========================================

/** Crea una sesión de grupo: el anfitrión finaliza un pedido y genera un QR */
export async function createGroupSession(
  tableNumber: number,
  orderIds: string[]
): Promise<GroupSession> {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Debes iniciar sesión para crear un grupo');
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no encontrado');

  // Recopilar todos los items de los pedidos
  const allItems = load<any[]>('order_items') || [];
  const groupItems: GroupItem[] = [];

  for (const orderId of orderIds) {
    const items = allItems.filter((i: any) => i.order_id === orderId);
    for (const item of items) {
      // Crear un GroupItem por cada unidad del producto
      for (let u = 0; u < item.quantity; u++) {
        groupItems.push({
          id: uuid(),
          product_name: item.product_name,
          quantity: 1,
          unit_price: item.unit_price,
          claimed_by: null,
        });
      }
    }
  }

  const session: GroupSession = {
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
      paid: false,
    }],
    status: 'active',
    created_at: now(),
  };

  const sessions = load<GroupSession[]>('group_sessions') || [];
  sessions.push(session);
  save('group_sessions', sessions);

  broadcast('group_session_new', { sessionId: session.id });

  return session;
}

/** Obtener una sesión de grupo por ID */
export async function getGroupSession(sessionId: string): Promise<GroupSession | null> {
  ensureSeeded();
  const sessions = load<GroupSession[]>('group_sessions') || [];
  return sessions.find((s) => s.id === sessionId) || null;
}

/** Unirse a un grupo como comensal */
export async function joinGroupSession(sessionId: string): Promise<GroupSession> {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Debes iniciar sesión para unirte al grupo');
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no encontrado');

  const sessions = load<GroupSession[]>('group_sessions') || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error('Sesión de grupo no encontrada');
  if (sessions[idx].status !== 'active') throw new Error('Esta sesión ya está cerrada');

  // Comprobar si ya está unido
  const existing = sessions[idx].members.find((m) => m.user_id === userId);
  if (!existing) {
    sessions[idx].members.push({
      user_id: userId,
      name: user.name,
      amount: 0,
      paid: false,
    });
  }

  save('group_sessions', sessions);
  broadcast('group_session_update', { sessionId });

  return sessions[idx];
}

/** Reclamar un item del grupo */
export async function claimGroupItem(sessionId: string, itemId: string): Promise<GroupSession> {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Debes iniciar sesión');

  const sessions = load<GroupSession[]>('group_sessions') || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error('Sesión de grupo no encontrada');

  const itemIdx = sessions[idx].items.findIndex((i) => i.id === itemId);
  if (itemIdx < 0) throw new Error('Item no encontrado');

  sessions[idx].items[itemIdx].claimed_by = userId;

  // Recalcular el monto de cada miembro
  _recalcMemberAmounts(sessions[idx]);

  save('group_sessions', sessions);
  broadcast('group_session_update', { sessionId });

  return sessions[idx];
}

/** Liberar un item reclamado */
export async function unclaimGroupItem(sessionId: string, itemId: string): Promise<GroupSession> {
  ensureSeeded();

  const sessions = load<GroupSession[]>('group_sessions') || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error('Sesión de grupo no encontrada');

  const itemIdx = sessions[idx].items.findIndex((i) => i.id === itemId);
  if (itemIdx < 0) throw new Error('Item no encontrado');

  sessions[idx].items[itemIdx].claimed_by = null;

  _recalcMemberAmounts(sessions[idx]);

  save('group_sessions', sessions);
  broadcast('group_session_update', { sessionId });

  return sessions[idx];
}

/** Cada comensal paga su parte al monedero del anfitrión */
export async function payGroupShare(sessionId: string, method: 'wallet' | 'cash_admin' | 'cash_bar' = 'wallet'): Promise<GroupSession> {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Debes iniciar sesión');

  const sessions = load<GroupSession[]>('group_sessions') || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error('Sesión de grupo no encontrada');

  const session = sessions[idx];
  const member = session.members.find((m) => m.user_id === userId);
  if (!member) throw new Error('No eres miembro de este grupo');
  if (member.paid) throw new Error('Ya has pagado tu parte');
  if (member.amount <= 0) throw new Error('No tienes items que pagar');

  // Es el anfitrión: no necesita pagar a sí mismo
  if (userId === session.host_user_id) {
    member.paid = true;
    member.payment_method = 'host_confirm';
    member.paid_at = now();
    save('group_sessions', sessions);
    broadcast('group_session_update', { sessionId });
    return sessions[idx];
  }

  if (method === 'wallet') {
    // Descontar del monedero del comensal
    await payWithWallet(member.amount, `Pago grupo — Mesa ${session.table_number}`);

    // Acreditar en el monedero del anfitrión
    const hostWalletKey = `wallet_user_${session.host_user_id}`;
    const hostWallet = load<{ balance: number; transactions: WalletTransaction[] }>(hostWalletKey) ||
      { balance: 0, transactions: [] };
    hostWallet.balance = Math.round((hostWallet.balance + member.amount) * 100) / 100;
    hostWallet.transactions.unshift({
      id: uuid(),
      type: 'recharge',
      amount: member.amount,
      description: `💸 Pago de ${member.name} — grupo Mesa ${session.table_number}`,
      created_at: now(),
    });
    save(hostWalletKey, hostWallet);
  }

  // Marcar como pagado
  member.paid = true;
  member.payment_method = method;
  member.paid_at = now();
  save('group_sessions', sessions);
  broadcast('group_session_update', { sessionId });

  return sessions[idx];
}

/** El anfitrión paga al local con su monedero (los fondos acumulados) */
export async function hostPayVenue(sessionId: string): Promise<void> {
  ensureSeeded();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Debes iniciar sesión');

  const sessions = load<GroupSession[]>('group_sessions') || [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) throw new Error('Sesión de grupo no encontrada');

  const session = sessions[idx];
  if (session.host_user_id !== userId) throw new Error('Solo el anfitrión puede pagar al local');

  const total = session.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  // Descontar del monedero del anfitrión
  await payWithWallet(total, `Pago grupo al local — Mesa ${session.table_number}`);

  // Marcar todos los pedidos como pagados
  const orders = load<any[]>('orders') || [];
  const ts = now();
  for (const orderId of session.order_ids) {
    const orderIdx = orders.findIndex((o: any) => o.id === orderId);
    if (orderIdx >= 0) {
      orders[orderIdx].status = 'paid';
      orders[orderIdx].payment_method = 'grupo';
      orders[orderIdx].paid_at = ts;
      orders[orderIdx].updated_at = ts;
    }
  }
  save('orders', orders);

  // Crear ticket
  const ticketItems = session.items.map((i) => ({
    name: i.product_name,
    qty: i.quantity,
    price: i.unit_price,
  }));
  await createTicket(session.order_ids[0], session.table_number, ticketItems, total, 'grupo');

  // Cerrar sesión de grupo
  sessions[idx].status = 'completed';
  save('group_sessions', sessions);

  _notifyOrderChange();
  broadcast('group_session_complete', { sessionId });
}

/** Recalcular montos de cada miembro basándose en items reclamados */
function _recalcMemberAmounts(session: GroupSession) {
  for (const member of session.members) {
    const myItems = session.items.filter((i) => i.claimed_by === member.user_id);
    member.amount = Math.round(myItems.reduce((s, i) => s + i.unit_price * i.quantity, 0) * 100) / 100;
  }
}

/** Obtener sesiones de grupo activas para una mesa */
export async function getActiveGroupSessions(tableNumber: number): Promise<GroupSession[]> {
  ensureSeeded();
  const sessions = load<GroupSession[]>('group_sessions') || [];
  return sessions.filter((s) => s.table_number === tableNumber && s.status === 'active');
}

// ===========================================
// RECUPERACIÓN DE CONTRASEÑA
// ===========================================
interface PasswordResetRequest {
  email: string;
  code: string;
  expires_at: string;
}

/** Solicitar reset de contraseña → genera código de 6 dígitos y envía email */
export async function requestPasswordReset(email: string): Promise<string> {
  ensureSeeded();
  const users = load<User[]>('users') || [];
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) throw new Error('No se encontró una cuenta con ese email');

  // Generar código de 6 dígitos
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  // Guardar solicitud
  const resets = load<PasswordResetRequest[]>('password_resets') || [];
  // Eliminar solicitudes anteriores para este email
  const filtered = resets.filter((r) => r.email.toLowerCase() !== email.toLowerCase().trim());
  filtered.push({ email: email.toLowerCase().trim(), code, expires_at: expiresAt });
  save('password_resets', filtered);

  // Enviar email con el código
  await sendPasswordResetEmail(user.name, user.email, code);

  return code;
}

/** Verificar código y cambiar contraseña */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  ensureSeeded();
  const resets = load<PasswordResetRequest[]>('password_resets') || [];
  const request = resets.find(
    (r) => r.email.toLowerCase() === email.toLowerCase().trim() && r.code === code
  );

  if (!request) throw new Error('Código incorrecto');
  if (new Date(request.expires_at) < new Date()) throw new Error('El código ha expirado. Solicita uno nuevo.');

  // Actualizar contraseña
  const users = load<User[]>('users') || [];
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (idx < 0) throw new Error('Usuario no encontrado');

  users[idx].password_hash = simpleHash(newPassword);
  save('users', users);

  // Limpiar solicitud usada
  save('password_resets', resets.filter((r) => r.email.toLowerCase() !== email.toLowerCase().trim()));
}
