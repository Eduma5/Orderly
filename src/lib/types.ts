// ============================================
// Tipos de la aplicación EMA
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string; // solo en almacenamiento, nunca se envía al cliente
  created_at: string;
}

/** Datos de usuario seguros (sin contraseña) */
export interface UserPublic {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  order: number;
  active: boolean;
}

// Alérgenos oficiales de la UE (14 principales)
export type AllergenId =
  | 'gluten'
  | 'crustaceos'
  | 'huevos'
  | 'pescado'
  | 'cacahuetes'
  | 'soja'
  | 'lacteos'
  | 'frutos_cascara'
  | 'apio'
  | 'mostaza'
  | 'sesamo'
  | 'sulfitos'
  | 'altramuces'
  | 'moluscos';

export const ALLERGEN_INFO: Record<AllergenId, { label: string; icon: string }> = {
  gluten:          { label: 'Gluten',             icon: '🌾' },
  crustaceos:      { label: 'Crustáceos',         icon: '🦐' },
  huevos:          { label: 'Huevos',             icon: '🥚' },
  pescado:         { label: 'Pescado',            icon: '🐟' },
  cacahuetes:      { label: 'Cacahuetes',         icon: '🥜' },
  soja:            { label: 'Soja',               icon: '🫘' },
  lacteos:         { label: 'Lácteos',            icon: '🥛' },
  frutos_cascara:  { label: 'Frutos de cáscara',  icon: '🌰' },
  apio:            { label: 'Apio',               icon: '🥬' },
  mostaza:         { label: 'Mostaza',            icon: '🟡' },
  sesamo:          { label: 'Sésamo',             icon: '🫓' },
  sulfitos:        { label: 'Sulfitos',           icon: '🍷' },
  altramuces:      { label: 'Altramuces',         icon: '🌼' },
  moluscos:        { label: 'Moluscos',           icon: '🦪' },
};

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  image_url?: string;
  tags?: string[];
  allergens?: AllergenId[];
  available: boolean;
  order: number;
}

// Grupo de pago compartido
export interface GroupSession {
  id: string;
  host_user_id: string;
  host_name: string;
  table_number: number;
  order_ids: string[];
  items: GroupItem[];
  members: GroupMember[];
  status: 'active' | 'completed';
  created_at: string;
}

export interface GroupItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  claimed_by: string | null; // user_id del que lo reclama
}

export interface GroupMember {
  user_id: string;
  name: string;
  amount: number; // cantidad que debe pagar
  paid: boolean;
  payment_method?: 'wallet' | 'cash_admin' | 'cash_bar' | 'host_confirm';
  paid_at?: string;
}

export interface PartialPayment {
  id: string;
  table_number: number;
  session_id: string;
  amount: number;
  payment_method: string;
  payer_name: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  table_number: number;
  session_id: string;
  user_id: string | null;
  user_name: string | null;
  status: 'pending' | 'preparing' | 'served' | 'ready_for_payment' | 'paid';
  total: number;
  total_cost: number;
  payment_method: string | null;
  stripe_payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
  notes?: string;
}

export interface Table {
  id: string;
  number: number;
  name?: string;
  active: boolean;
  current_session_id?: string;
}

export interface TableSession {
  id: string;
  table_id: string;
  started_at: string;
  ended_at?: string;
  active: boolean;
}

export interface Payment {
  id: string;
  order_id: string;
  session_id: string;
  amount: number;
  method: 'card' | 'cash' | 'bizum' | 'wallet';
  status: 'pending' | 'completed' | 'failed';
  payer_name?: string;
  created_at: string;
}

export interface PaidOrder {
  id: string;
  table: number;
  items: { name: string; qty: number; price: number; cost: number }[];
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: string;
  paidAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  products?: Product[];
  timestamp: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'recharge' | 'payment';
  amount: number;
  description: string;
  created_at: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

// ============================================
// Solicitudes de servicio (datáfono, camarero)
// ============================================
export interface ServiceRequest {
  id: string;
  type: 'solicitud_pago' | 'solicitud_camarero';
  method?: 'datafono' | 'efectivo' | 'otro';
  table_number: number;
  user_id: string | null;
  user_name: string | null;
  status: 'pending' | 'attending' | 'completed';
  total?: number;
  order_ids?: string[];
  message?: string;
  created_at: string;
  updated_at: string;
}
