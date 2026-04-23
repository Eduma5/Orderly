-- ============================================
-- EMA - Esquema de base de datos Supabase
-- ============================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================
-- CATEGORÍAS
-- ============================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text,
  "order" int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- PRODUCTOS
-- ============================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  cost numeric(10,2),
  image_url text,
  tags text[] default '{}', -- etiquetas para el chatbot: fresh, sweet, salty, hot, cold, hookah, energizing, relaxing
  available boolean not null default true,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- MESAS
-- ============================================
create table if not exists tables (
  id uuid primary key default uuid_generate_v4(),
  number int not null unique,
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- PEDIDOS
-- ============================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  table_number int not null,
  session_id text not null, -- UUID del navegador del cliente
  user_id uuid,
  user_name text,
  status text not null default 'pending' check (status in ('pending','preparing','served','paid')),
  total numeric(10,2) not null default 0,
  total_cost numeric(10,2) not null default 0,
  payment_method text check (payment_method in ('card','cash','bizum')),
  stripe_payment_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table orders add column if not exists user_id uuid;
alter table orders add column if not exists user_name text;

-- ============================================
-- SOLICITUDES DE SERVICIO
-- ============================================
create table if not exists service_requests (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('solicitud_pago','solicitud_camarero')),
  method text check (method in ('datafono','efectivo','otro')),
  table_number int not null,
  user_id uuid,
  user_name text,
  status text not null default 'pending' check (status in ('pending','attending','completed')),
  total numeric(10,2),
  order_ids uuid[],
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ITEMS DEL PEDIDO
-- ============================================
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  unit_cost numeric(10,2) default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================
-- PAGOS PARCIALES (DIVIDIR CUENTA)
-- ============================================
create table if not exists partial_payments (
  id uuid primary key default uuid_generate_v4(),
  table_number int not null,
  session_id text not null,
  amount numeric(10,2) not null,
  payment_method text not null,
  payer_name text not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- TICKETS / RECIBOS
-- ============================================
create table if not exists tickets (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_number serial,
  table_number int not null,
  session_id text not null,
  total numeric(10,2) not null,
  payment_method text not null,
  items jsonb not null, -- [{name, qty, price}]
  created_at timestamptz not null default now()
);

-- ============================================
-- CONFIGURACIÓN DEL ADMIN
-- ============================================
create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ============================================
-- ÍNDICES
-- ============================================
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_table on orders(table_number);
create index if not exists idx_orders_session on orders(session_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_partial_payments_table_session on partial_payments(table_number, session_id);
create index if not exists idx_tickets_session on tickets(session_id);
create index if not exists idx_tickets_order on tickets(order_id);
create index if not exists idx_service_requests_status on service_requests(status);
create index if not exists idx_service_requests_table on service_requests(table_number);

-- ============================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create trigger service_requests_updated_at
  before update on service_requests
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Categorías: lectura pública
alter table categories enable row level security;
create policy "categories_read" on categories for select using (true);
create policy "categories_admin" on categories for all using (
  auth.role() = 'authenticated'
);

-- Productos: lectura pública
alter table products enable row level security;
create policy "products_read" on products for select using (true);
create policy "products_admin" on products for all using (
  auth.role() = 'authenticated'
);

-- Mesas: lectura pública
alter table tables enable row level security;
create policy "tables_read" on tables for select using (true);
create policy "tables_admin" on tables for all using (
  auth.role() = 'authenticated'
);

-- Pedidos: el cliente crea, el admin gestiona todo
alter table orders enable row level security;
create policy "orders_insert" on orders for insert with check (true);
create policy "orders_select" on orders for select using (true);
create policy "orders_update" on orders for update using (true);
create policy "orders_delete" on orders for delete using (
  auth.role() = 'authenticated'
);

-- Items de pedido: igual que pedidos
alter table order_items enable row level security;
create policy "order_items_insert" on order_items for insert with check (true);
create policy "order_items_select" on order_items for select using (true);

-- Pagos parciales: lectura/inserción pública para clientes de mesa
alter table partial_payments enable row level security;
create policy "partial_payments_insert" on partial_payments for insert with check (true);
create policy "partial_payments_select" on partial_payments for select using (true);

-- Tickets: el cliente lee los suyos por session_id
alter table tickets enable row level security;
create policy "tickets_insert" on tickets for insert with check (true);
create policy "tickets_select" on tickets for select using (true);

-- Admin settings: lectura pública (no contiene secretos del servidor)
alter table admin_settings enable row level security;
create policy "settings_read" on admin_settings for select using (true);
create policy "settings_admin" on admin_settings for all using (
  auth.role() = 'authenticated'
);

-- Solicitudes de servicio: lectura e inserción pública; actualización para gestión
alter table service_requests enable row level security;
create policy "service_requests_insert" on service_requests for insert with check (true);
create policy "service_requests_select" on service_requests for select using (true);
create policy "service_requests_update" on service_requests for update using (true);

-- ============================================
-- Suscripción en tiempo real para pedidos
-- ============================================
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table service_requests;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías
insert into categories (id, name, description, "order", active) values
  ('c1000000-0000-0000-0000-000000000001', 'Cafés', 'Espressos, lattes y combinaciones de café', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Tés e infusiones', 'Tés del mundo, infusiones y matcha', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Batidos y smoothies', 'Batidos de fruta, smoothies y bowls', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Bollería y dulces', 'Croissants, tartas y dulces artesanos', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Tostas y salados', 'Tostas gourmet, bocadillos y salados', 5, true),
  ('c1000000-0000-0000-0000-000000000006', 'Bebidas frías', 'Refrescos, zumos y cervezas', 6, true),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimbas', 'Hookah con sabores premium', 7, true),
  ('c1000000-0000-0000-0000-000000000008', 'Especiales', 'Combos, brunch y ofertas', 8, true);

-- Productos
insert into products (category_id, name, description, price, cost, image_url, tags, available, "order") values
  -- Cafés
  ('c1000000-0000-0000-0000-000000000001', 'Café solo', 'Espresso intenso 100% arábica', 1.20, 0.25, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=200&h=200&fit=crop', '{hot,energizing,bitter}', true, 1),
  ('c1000000-0000-0000-0000-000000000001', 'Café con leche', 'Espresso con leche cremosa de origen', 1.50, 0.35, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop', '{hot,energizing,creamy}', true, 2),
  ('c1000000-0000-0000-0000-000000000001', 'Cortado', 'Espresso cortado con un toque de leche', 1.30, 0.28, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=200&h=200&fit=crop', '{hot,energizing}', true, 3),
  ('c1000000-0000-0000-0000-000000000001', 'Cappuccino', 'Espresso con leche espumosa y cacao', 2.00, 0.45, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop', '{hot,energizing,creamy,sweet}', true, 4),
  ('c1000000-0000-0000-0000-000000000001', 'Café bombón', 'Espresso con leche condensada artesana', 1.80, 0.40, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200&h=200&fit=crop', '{hot,energizing,sweet}', true, 5),
  ('c1000000-0000-0000-0000-000000000001', 'Latte macchiato', 'Capas de leche y espresso con espuma densa', 2.20, 0.50, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=200&h=200&fit=crop', '{hot,energizing,creamy,sweet}', true, 6),
  ('c1000000-0000-0000-0000-000000000001', 'Café con hielo', 'Espresso doble servido con vaso de hielo', 1.60, 0.30, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&h=200&fit=crop', '{cold,fresh,energizing}', true, 7),
  ('c1000000-0000-0000-0000-000000000001', 'Affogato', 'Espresso caliente sobre helado de vainilla', 3.00, 0.80, 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=200&h=200&fit=crop', '{sweet,cold,energizing,creamy}', true, 8),
  ('c1000000-0000-0000-0000-000000000001', 'Café irlandés', 'Café, whisky, nata montada y canela', 4.50, 1.50, 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=200&h=200&fit=crop', '{hot,sweet,alcohol,special}', true, 9),
  -- Tés
  ('c1000000-0000-0000-0000-000000000002', 'Té verde Sencha', 'Té verde japonés con notas herbales suaves', 1.80, 0.30, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop', '{hot,relaxing,healthy}', true, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Té negro English Breakfast', 'Clásico, intenso, ideal con leche', 1.80, 0.28, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop', '{hot,energizing}', true, 2),
  ('c1000000-0000-0000-0000-000000000002', 'Chai latte', 'Té negro con especias, leche espumada y canela', 2.80, 0.55, 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=200&h=200&fit=crop', '{hot,sweet,creamy,spicy}', true, 3),
  ('c1000000-0000-0000-0000-000000000002', 'Manzanilla con miel', 'Infusión relajante con miel natural', 1.60, 0.25, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop', '{hot,relaxing,sweet,healthy}', true, 4),
  ('c1000000-0000-0000-0000-000000000002', 'Matcha latte', 'Matcha ceremonial batido con leche de avena', 3.20, 0.80, 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=200&h=200&fit=crop', '{hot,energizing,healthy,creamy}', true, 5),
  ('c1000000-0000-0000-0000-000000000002', 'Rooibos vainilla', 'Infusión sudafricana sin teína con vainilla', 2.00, 0.35, 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=200&h=200&fit=crop', '{hot,relaxing,sweet}', true, 6),
  ('c1000000-0000-0000-0000-000000000002', 'Té helado de melocotón', 'Té negro frío con melocotón natural y hielo', 2.50, 0.45, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop', '{cold,fresh,sweet,fruity}', true, 7),
  ('c1000000-0000-0000-0000-000000000002', 'Golden milk', 'Leche de coco con cúrcuma, jengibre y canela', 3.00, 0.60, 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200&h=200&fit=crop', '{hot,healthy,spicy,relaxing}', true, 8),
  -- Batidos
  ('c1000000-0000-0000-0000-000000000003', 'Batido de fresa', 'Fresas frescas de temporada con leche', 3.50, 1.00, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&h=200&fit=crop', '{cold,fresh,sweet,fruity}', true, 1),
  ('c1000000-0000-0000-0000-000000000003', 'Batido de mango', 'Mango tropical con yogur griego', 3.50, 1.10, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&h=200&fit=crop', '{cold,fresh,sweet,fruity,tropical}', true, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Smoothie verde', 'Espinacas, plátano, manzana y jengibre', 4.00, 1.20, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=200&h=200&fit=crop', '{cold,fresh,healthy,energizing}', true, 3),
  ('c1000000-0000-0000-0000-000000000003', 'Açaí bowl', 'Açaí con granola, plátano y frutos rojos', 5.50, 1.80, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop', '{cold,fresh,sweet,healthy,fruity}', true, 4),
  ('c1000000-0000-0000-0000-000000000003', 'Batido de plátano y chocolate', 'Plátano maduro con cacao puro y leche', 3.80, 1.05, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop', '{cold,sweet,creamy,chocolate}', true, 5),
  ('c1000000-0000-0000-0000-000000000003', 'Smoothie tropical', 'Piña, coco, mango y lima', 4.20, 1.30, 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=200&h=200&fit=crop', '{cold,fresh,sweet,tropical,fruity}', true, 6),
  -- Bollería
  ('c1000000-0000-0000-0000-000000000004', 'Croissant de mantequilla', 'Croissant artesano, crujiente y hojaldrado', 1.80, 0.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=200&h=200&fit=crop', '{sweet,pastry}', true, 1),
  ('c1000000-0000-0000-0000-000000000004', 'Tostada con tomate', 'Pan cristal con tomate rallado y AOVE', 2.50, 0.60, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop', '{salty,healthy}', true, 2),
  ('c1000000-0000-0000-0000-000000000004', 'Napolitana de chocolate', 'Hojaldre crujiente relleno de chocolate belga', 2.00, 0.55, 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=200&h=200&fit=crop', '{sweet,pastry,chocolate}', true, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Carrot cake', 'Bizcocho de zanahoria con frosting de queso crema', 3.80, 1.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&h=200&fit=crop', '{sweet,pastry,creamy}', true, 4),
  ('c1000000-0000-0000-0000-000000000004', 'Cookie de chocolate', 'Cookie XXL con pepitas de chocolate negro', 2.50, 0.65, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop', '{sweet,chocolate}', true, 5),
  ('c1000000-0000-0000-0000-000000000004', 'Cheesecake', 'Tarta de queso cremosa con coulis de frutos rojos', 4.20, 1.10, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=200&h=200&fit=crop', '{sweet,creamy,fruity}', true, 6),
  ('c1000000-0000-0000-0000-000000000004', 'Brownie con nueces', 'Brownie casero de chocolate negro con nueces', 3.50, 0.90, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop', '{sweet,chocolate}', true, 7),
  ('c1000000-0000-0000-0000-000000000004', 'Muffin de arándanos', 'Muffin esponjoso con arándanos frescos', 2.80, 0.60, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200&h=200&fit=crop', '{sweet,fruity,pastry}', true, 8),
  -- Tostas y salados
  ('c1000000-0000-0000-0000-000000000005', 'Tosta de aguacate', 'Aguacate, tomate cherry, semillas y lima', 4.50, 1.50, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=200&h=200&fit=crop', '{salty,healthy,fresh}', true, 1),
  ('c1000000-0000-0000-0000-000000000005', 'Tosta de salmón', 'Salmón ahumado, queso crema, eneldo y alcaparras', 5.00, 1.80, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop', '{salty,protein}', true, 2),
  ('c1000000-0000-0000-0000-000000000005', 'Tosta de jamón ibérico', 'Jamón ibérico de bellota con tomate y AOVE', 5.50, 2.20, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop', '{salty,protein,special}', true, 3),
  ('c1000000-0000-0000-0000-000000000005', 'Tortilla española', 'Pincho de tortilla de patata casera', 3.00, 0.80, 'https://images.unsplash.com/photo-1623246123320-0d6636755796?w=200&h=200&fit=crop', '{salty,hot,protein}', true, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Bikini mixto', 'Sándwich de jamón y queso fundido en pan brioche', 3.50, 0.90, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop', '{salty,hot,protein}', true, 5),
  ('c1000000-0000-0000-0000-000000000005', 'Wrap de pollo Caesar', 'Pollo a la plancha, lechuga, parmesano y salsa Caesar', 5.00, 1.60, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&fit=crop', '{salty,protein,fresh}', true, 6),
  ('c1000000-0000-0000-0000-000000000005', 'Nachos con guacamole', 'Nachos caseros con guacamole, pico de gallo y jalapeños', 5.50, 1.40, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200&h=200&fit=crop', '{salty,spicy,sharing}', true, 7),
  ('c1000000-0000-0000-0000-000000000005', 'Hummus con crudités', 'Hummus casero con bastones de zanahoria, pepino y pan pita', 4.50, 1.10, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=200&h=200&fit=crop', '{salty,healthy,sharing,fresh}', true, 8),
  -- Bebidas frías
  ('c1000000-0000-0000-0000-000000000006', 'Agua mineral', '50cl - Bezoya', 1.00, 0.25, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop', '{cold,fresh}', true, 1),
  ('c1000000-0000-0000-0000-000000000006', 'Refresco', 'Coca-Cola, Fanta, Nestea, Aquarius', 2.00, 0.50, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200&h=200&fit=crop', '{cold,sweet,fresh}', true, 2),
  ('c1000000-0000-0000-0000-000000000006', 'Zumo de naranja natural', 'Recién exprimido, mínimo 4 naranjas', 3.00, 0.90, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop', '{cold,fresh,healthy,fruity}', true, 3),
  ('c1000000-0000-0000-0000-000000000006', 'Limonada casera', 'Limón, hierbabuena, azúcar de caña y hielo', 3.00, 0.70, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&h=200&fit=crop', '{cold,fresh,sweet,fruity}', true, 4),
  ('c1000000-0000-0000-0000-000000000006', 'Cerveza artesanal', 'IPA local de barril — 33cl', 3.50, 1.00, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&h=200&fit=crop', '{cold,fresh,alcohol}', true, 5),
  ('c1000000-0000-0000-0000-000000000006', 'Tinto de verano', 'Vino tinto con gaseosa de limón y hielo', 2.50, 0.60, 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop', '{cold,fresh,alcohol,fruity}', true, 6),
  ('c1000000-0000-0000-0000-000000000006', 'Mojito sin alcohol', 'Lima, hierbabuena, azúcar moreno y soda', 3.50, 0.80, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=200&fit=crop', '{cold,fresh,sweet,fruity}', true, 7),
  ('c1000000-0000-0000-0000-000000000006', 'Granizado de limón', 'Hielo picado con zumo de limón natural', 2.50, 0.50, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=200&h=200&fit=crop', '{cold,fresh,sweet,fruity}', true, 8),
  -- Cachimbas / Hookah
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Doble Manzana', 'El clásico sabor de doble manzana con menta fresca', 8.00, 2.50, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&h=200&fit=crop', '{hookah,fresh,fruity,popular}', true, 1),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Sandía Ice', 'Sandía refrescante con toque mentolado', 8.00, 2.50, 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=200&h=200&fit=crop', '{hookah,fresh,fruity,cold}', true, 2),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Uva Menta', 'Uva dulce combinada con menta refrescante', 8.00, 2.50, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&h=200&fit=crop', '{hookah,fresh,sweet,fruity}', true, 3),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Melocotón', 'Sabor suave y dulce de melocotón maduro', 8.00, 2.50, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&h=200&fit=crop', '{hookah,sweet,fruity}', true, 4),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Mango Tango', 'Mango tropical con un toque exótico', 8.00, 2.50, 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=200&h=200&fit=crop', '{hookah,sweet,tropical,fruity}', true, 5),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Fresa Helada', 'Fresa dulce con efecto ice intenso', 8.00, 2.50, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&h=200&fit=crop', '{hookah,cold,sweet,fruity}', true, 6),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Blueberry Mint', 'Arándanos azules con menta suave', 8.00, 2.50, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&h=200&fit=crop', '{hookah,fresh,fruity}', true, 7),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Love 66', 'Mezcla de frutas del bosque con toque mentolado', 9.00, 3.00, 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=200&h=200&fit=crop', '{hookah,fresh,fruity,popular,special}', true, 8),
  ('c1000000-0000-0000-0000-000000000007', 'Cachimba Premium Mix', 'Combinación exclusiva de la casa — sabor sorpresa', 10.00, 3.50, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&h=200&fit=crop', '{hookah,special,popular}', true, 9),
  -- Especiales / Combos
  ('c1000000-0000-0000-0000-000000000008', 'Brunch EMA', 'Café/té + zumo + tosta + fruta + bollería', 9.90, 3.50, 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&h=200&fit=crop', '{special,sweet,salty,sharing}', true, 1),
  ('c1000000-0000-0000-0000-000000000008', 'Merienda especial', 'Chai latte o chocolate + croissant + tarta', 6.90, 2.20, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop', '{special,sweet,hot}', true, 2),
  ('c1000000-0000-0000-0000-000000000008', 'Chocolate a la taza', 'Chocolate negro 70% fundido con churros (6 uds)', 4.50, 1.30, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=200&h=200&fit=crop', '{hot,sweet,chocolate,special}', true, 3),
  ('c1000000-0000-0000-0000-000000000008', 'Combo Cachimba + Bebida', 'Cualquier cachimba + bebida a elegir', 10.50, 3.50, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=200&h=200&fit=crop', '{hookah,special,popular}', true, 4),
  ('c1000000-0000-0000-0000-000000000008', 'Combo Cachimba + 2 Bebidas', 'Cualquier cachimba + 2 bebidas a elegir', 13.00, 4.20, 'https://images.unsplash.com/photo-1560024802-a7e987926891?w=200&h=200&fit=crop', '{hookah,special,sharing,popular}', true, 5),
  ('c1000000-0000-0000-0000-000000000008', 'Tarde de chicas', 'Cachimba + 2 batidos + tarta para compartir', 18.00, 6.00, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&h=200&fit=crop', '{hookah,sweet,sharing,special,popular}', true, 6);

-- Mesas iniciales (1-15)
insert into tables (number, active) values
  (1, true), (2, true), (3, true), (4, true), (5, true),
  (6, true), (7, true), (8, true), (9, true), (10, true),
  (11, true), (12, true), (13, true), (14, true), (15, true);

-- Configuración por defecto del admin
insert into admin_settings (key, value) values
  ('business_name', 'EMA Cafetería & Tetería'),
  ('admin_password', 'ema2026'),
  ('bizum_phone', ''),
  ('stripe_enabled', 'false'),
  ('cash_enabled', 'true'),
  ('bizum_enabled', 'false'),
  ('base_url', '');
- -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
 - -   M O N E D E R O   ( W A L L E T ) 
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   w a l l e t s   ( 
     s e s s i o n _ i d   t e x t   p r i m a r y   k e y , 
     b a l a n c e   n u m e r i c ( 1 0 , 2 )   n o t   n u l l   d e f a u l t   0 , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     u p d a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   w a l l e t _ t r a n s a c t i o n s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   u u i d _ g e n e r a t e _ v 4 ( ) , 
     s e s s i o n _ i d   t e x t   n o t   n u l l   r e f e r e n c e s   w a l l e t s ( s e s s i o n _ i d )   o n   d e l e t e   c a s c a d e , 
     t y p e   t e x t   n o t   n u l l   c h e c k   ( t y p e   i n   ( ' r e c h a r g e ' ,   ' p a y m e n t ' ) ) , 
     a m o u n t   n u m e r i c ( 1 0 , 2 )   n o t   n u l l , 
     d e s c r i p t i o n   t e x t , 
     s t r i p e _ p a y m e n t _ i d   t e x t , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 
 a l t e r   t a b l e   w a l l e t s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 c r e a t e   p o l i c y   " w a l l e t s _ a l l "   o n   w a l l e t s   f o r   a l l   u s i n g   ( t r u e ) ; 
 
 a l t e r   t a b l e   w a l l e t _ t r a n s a c t i o n s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 c r e a t e   p o l i c y   " w a l l e t _ t x _ a l l "   o n   w a l l e t _ t r a n s a c t i o n s   f o r   a l l   u s i n g   ( t r u e ) ; 
 
 c r e a t e   t r i g g e r   w a l l e t s _ u p d a t e d _ a t 
     b e f o r e   u p d a t e   o n   w a l l e t s 
     f o r   e a c h   r o w   e x e c u t e   f u n c t i o n   u p d a t e _ u p d a t e d _ a t ( ) ; 
 
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
 - -   G R U P O S   /   P A G O   D I V I D I D O 
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   g r o u p _ s e s s i o n s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   u u i d _ g e n e r a t e _ v 4 ( ) , 
     h o s t _ u s e r _ i d   u u i d , 
     h o s t _ n a m e   t e x t , 
     t a b l e _ n u m b e r   i n t   n o t   n u l l , 
     o r d e r _ i d s   t e x t [ ]   n o t   n u l l , 
     s t a t u s   t e x t   n o t   n u l l   d e f a u l t   ' a c t i v e '   c h e c k   ( s t a t u s   i n   ( ' a c t i v e ' , ' c o m p l e t e d ' ) ) , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     u p d a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   g r o u p _ s e s s i o n _ i t e m s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   u u i d _ g e n e r a t e _ v 4 ( ) , 
     s e s s i o n _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   g r o u p _ s e s s i o n s ( i d )   o n   d e l e t e   c a s c a d e , 
     p r o d u c t _ n a m e   t e x t   n o t   n u l l , 
     q u a n t i t y   i n t   n o t   n u l l   d e f a u l t   1 , 
     u n i t _ p r i c e   n u m e r i c ( 1 0 , 2 )   n o t   n u l l , 
     c l a i m e d _ b y   t e x t   - -   u s e r _ i d   o f   w h o   c l a i m e d   i t 
 ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   g r o u p _ m e m b e r s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   u u i d _ g e n e r a t e _ v 4 ( ) , 
     s e s s i o n _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   g r o u p _ s e s s i o n s ( i d )   o n   d e l e t e   c a s c a d e , 
     u s e r _ i d   t e x t   n o t   n u l l , 
     n a m e   t e x t   n o t   n u l l , 
     a m o u n t   n u m e r i c ( 1 0 , 2 )   n o t   n u l l   d e f a u l t   0 , 
     p a i d   b o o l e a n   n o t   n u l l   d e f a u l t   f a l s e , 
     u n i q u e ( s e s s i o n _ i d ,   u s e r _ i d ) 
 ) ; 
 
 a l t e r   t a b l e   g r o u p _ s e s s i o n s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 c r e a t e   p o l i c y   " g r o u p _ s e s s i o n s _ a l l "   o n   g r o u p _ s e s s i o n s   f o r   a l l   u s i n g   ( t r u e ) ; 
 
 a l t e r   t a b l e   g r o u p _ s e s s i o n _ i t e m s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 c r e a t e   p o l i c y   " g r o u p _ s e s s i o n _ i t e m s _ a l l "   o n   g r o u p _ s e s s i o n _ i t e m s   f o r   a l l   u s i n g   ( t r u e ) ; 
 
 a l t e r   t a b l e   g r o u p _ m e m b e r s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 c r e a t e   p o l i c y   " g r o u p _ m e m b e r s _ a l l "   o n   g r o u p _ m e m b e r s   f o r   a l l   u s i n g   ( t r u e ) ; 
 
 c r e a t e   t r i g g e r   g r o u p _ s e s s i o n s _ u p d a t e d _ a t 
     b e f o r e   u p d a t e   o n   g r o u p _ s e s s i o n s 
     f o r   e a c h   r o w   e x e c u t e   f u n c t i o n   u p d a t e _ u p d a t e d _ a t ( ) ; 
 
 
-- Group member payment metadata
alter table if exists group_members add column if not exists payment_method text;
alter table if exists group_members add column if not exists paid_at timestamptz;
