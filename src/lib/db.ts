// ============================================
// Capa de Datos — Router demo / Supabase
// ============================================
import { IS_DEMO, supabase, getSessionId } from './supabase';
import * as mock from './mockDb';
import type { Category, Product, Order, UserPublic, ServiceRequest, GroupSession } from './types';

function toUserPublic(user: { id: string; email?: string | null; user_metadata?: Record<string, any>; created_at?: string }): UserPublic {
  return {
    id: user.id,
    name: (user.user_metadata?.name as string) || user.email || 'Usuario',
    email: user.email || '',
    created_at: user.created_at || new Date().toISOString(),
  };
}

// =========================
// USUARIOS
// =========================
export async function registerUser(name: string, email: string, password: string): Promise<UserPublic> {
  if (IS_DEMO || !supabase) return mock.registerUser(name, email, password);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { name: name.trim() },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('No se pudo crear el usuario');

  if (!data.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      throw new Error('La cuenta se creó, pero Supabase requiere confirmar el email antes de iniciar sesión. Desactiva la confirmación de correo en Auth o confirma el email y vuelve a entrar.');
    }

    if (signInData.user) return toUserPublic(signInData.user);
  }

  return toUserPublic(data.user);
}

export async function loginUser(email: string, password: string): Promise<UserPublic> {
  if (IS_DEMO || !supabase) return mock.loginUser(email, password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('No se pudo iniciar sesión');

  return toUserPublic(data.user);
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  if (IS_DEMO || !supabase) return mock.getCurrentUser();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
    return null;
  }

  if (!data.user) return null;
  return toUserPublic(data.user);
}

export async function logoutUser(): Promise<void> {
  if (IS_DEMO || !supabase) return mock.logoutUser();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// =========================
// RECUPERACIÓN DE CONTRASEÑA
// =========================
export async function requestPasswordReset(email: string): Promise<string> {
  if (IS_DEMO || !supabase) return mock.requestPasswordReset(email);

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
  });

  if (error) throw error;
  return 'Revisa tu email para continuar con el reseteo';
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  if (IS_DEMO || !supabase) return mock.resetPassword(email, code, newPassword);

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// =========================
// CATEGORÍAS
// =========================
export async function getCategories(): Promise<Category[]> {
  if (IS_DEMO || !supabase) return mock.getCategories();
  const { data, error } = await supabase.from('categories').select('*').order('order', { ascending: true });
  if (error) console.error(error);
  return (data as Category[]) || [];
}

// =========================
// PRODUCTOS
// =========================
export async function getProducts(): Promise<Product[]> {
  if (IS_DEMO || !supabase) return mock.getProducts();
  const { data, error } = await supabase.from('products').select('*').order('order', { ascending: true });
  if (error) console.error(error);
  return (data as Product[]) || [];
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  if (IS_DEMO || !supabase) return mock.getProductsByCategory(categoryId);
  throw new Error('Supabase not configured');
}

export async function upsertProduct(
  product: Partial<Product> & { category_id: string; name: string; price: number }
): Promise<Product> {
  if (IS_DEMO || !supabase) return mock.upsertProduct(product);
  throw new Error('Supabase not configured');
}

export async function deleteProduct(productId: string): Promise<void> {
  if (IS_DEMO || !supabase) return mock.deleteProduct(productId);
  throw new Error('Supabase not configured');
}

export async function toggleProductAvailability(productId: string, available: boolean): Promise<void> {
  if (IS_DEMO || !supabase) return mock.toggleProductAvailability(productId, available);
  throw new Error('Supabase not configured');
}

// =========================
// MESAS
// =========================
export async function getTables() {
  if (IS_DEMO || !supabase) return mock.getTables();
  const { data, error } = await supabase.from('tables').select('*').order('number', { ascending: true });
  if (error) console.error(error);
  return data || [];
}

export async function upsertTable(table: { id?: string; number: number; name?: string; active?: boolean }) {
  if (IS_DEMO || !supabase) return mock.upsertTable(table);
  throw new Error('Supabase not configured');
}

export async function deleteTable(tableId: string) {
  if (IS_DEMO || !supabase) return mock.deleteTable(tableId);
  throw new Error('Supabase not configured');
}

// =========================
// PEDIDOS
// =========================
export async function createOrder(
  tableNumber: number,
  items: { product: Product; quantity: number; notes?: string }[],
  paymentMethod?: string
): Promise<Order> {
  if (IS_DEMO || !supabase) return mock.createOrder(tableNumber, items, paymentMethod);
  const user = await getCurrentUser();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + (item.product.cost || 0) * item.quantity, 0);

  const insertPayload = {
    table_number: tableNumber,
    session_id: getSessionId(),
    user_id: user?.id || null,
    user_name: user?.name || null,
    status: 'pending',
    total,
    total_cost: totalCost,
    payment_method: paymentMethod || null,
  };

  let order: any = null;
  let error: any = null;

  ({ data: order, error } = await supabase
    .from('orders')
    .insert(insertPayload as any)
    .select('*')
    .single());

  if (error && (String(error?.message || '').includes('user_name') || String(error?.message || '').includes('user_id'))) {
    ({ data: order, error } = await supabase
      .from('orders')
      .insert({
        table_number: tableNumber,
        session_id: getSessionId(),
        status: 'pending',
        total,
        total_cost: totalCost,
        payment_method: paymentMethod || null,
      })
      .select('*')
      .single());
  }
  
  if (error) throw error;
  
  const orderItemsInfo = items.map(i => ({
    order_id: order.id,
    product_id: i.product.id,
    product_name: i.product.name,
    quantity: i.quantity,
    unit_price: i.product.price,
    unit_cost: i.product.cost || 0,
    notes: i.notes || null
  }));
  
  await supabase.from('order_items').insert(orderItemsInfo);
  return { ...order, items: orderItemsInfo } as any;
}

export async function getUnpaidOrdersByTable(tableNumber: number) {
  if (IS_DEMO || !supabase) return mock.getUnpaidOrdersByTable(tableNumber);
  throw new Error('Supabase not configured');
}

export async function payOrders(orderIds: string[], paymentMethod: string, tableNumber: number): Promise<void> {
  if (IS_DEMO || !supabase) return mock.payOrders(orderIds, paymentMethod, tableNumber);
  throw new Error('Supabase not configured');
}

export async function payPartial(tableNumber: number, amount: number, paymentMethod: string, payerName: string): Promise<void> {
  if (IS_DEMO || !supabase) return mock.payPartial(tableNumber, amount, paymentMethod, payerName);
  throw new Error('Supabase not configured');
}

export async function getPartialPayments(tableNumber: number) {
  if (IS_DEMO || !supabase) return mock.getPartialPayments(tableNumber);
  throw new Error('Supabase not configured');
}

export async function getOrders(status?: string): Promise<Order[]> {
  if (IS_DEMO || !supabase) return mock.getOrders(status);
  let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) console.error(error);
  
  return ((data || []) as any[]).map((order) => ({ ...order, items: order.order_items })) as Order[];
}

export async function getPaidOrders(since?: string) {
  if (IS_DEMO || !supabase) return mock.getPaidOrders(since);
  throw new Error('Supabase not configured');
}

export async function updateOrderStatus(orderId: string, status: string, paymentMethod?: string): Promise<void> {
  if (IS_DEMO || !supabase) return mock.updateOrderStatus(orderId, status, paymentMethod);
  const updates: any = { status };
  if (paymentMethod) updates.payment_method = paymentMethod;
  if (status === 'paid') updates.paid_at = new Date().toISOString();
  
  await supabase.from('orders').update(updates).eq('id', orderId);
}

export async function setOrderStripePaymentId(orderId: string, stripePaymentId: string): Promise<void> {
  if (IS_DEMO || !supabase) return mock.setOrderStripePaymentId(orderId, stripePaymentId);
  throw new Error('Supabase not configured');
}

// =========================
// TICKETS
// =========================
export async function createTicket(
  orderId: string,
  tableNumber: number,
  items: { name: string; qty: number; price: number }[],
  total: number,
  paymentMethod: string
) {
  if (IS_DEMO || !supabase) return mock.createTicket(orderId, tableNumber, items, total, paymentMethod);
  throw new Error('Supabase not configured');
}

export async function getMyTickets() {
  if (IS_DEMO || !supabase) return mock.getMyTickets();
  throw new Error('Supabase not configured');
}

// =========================
// ADMIN SETTINGS
// =========================
export async function getAdminSettings() {
  if (IS_DEMO || !supabase) return mock.getAdminSettings();

  const { data, error } = await supabase
    .from('admin_settings')
    .select('key, value');

  if (error) {
    console.error(error);
    return {};
  }

  const rows = (data || []) as Array<{ key: string; value: string }>;
  return rows.reduce((acc: Record<string, string>, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function updateAdminSetting(key: string, value: string) {
  if (IS_DEMO || !supabase) return mock.updateAdminSetting(key, value);

  const { error } = await supabase
    .from('admin_settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
}

// =========================
// REALTIME
// =========================
export function subscribeToOrders(callback: (payload: any) => void) {
  if (IS_DEMO || !supabase) return mock.subscribeToOrders(callback);
  return supabase.channel('orders_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, callback)
    .subscribe();
}

// =========================
// MIS PEDIDOS
// =========================
export async function getMyOrders() {
  if (IS_DEMO || !supabase) return mock.getMyOrders();
  throw new Error('Supabase not configured');
}

// =========================
// MONEDERO (USER-LINKED)
// =========================
export async function getWalletBalance(): Promise<number> {
  if (IS_DEMO) return mock.getWalletBalance();
  return 0;
}

export async function getWalletTransactions() {
  if (IS_DEMO) return mock.getWalletTransactions();
  return [];
}

export async function rechargeWallet(amount: number): Promise<number> {
  if (IS_DEMO || !supabase) return mock.rechargeWallet(amount);
  throw new Error('Supabase not configured');
}

export async function payWithWallet(amount: number, description: string): Promise<number> {
  if (IS_DEMO || !supabase) return mock.payWithWallet(amount, description);
  throw new Error('Supabase not configured');
}

// =========================
// EMAIL SERVICE (re-export)
// =========================
export { sendWelcomeEmail, sendTicketEmail, sendAllTicketsEmail, sendPasswordResetEmail, getSentEmails } from './email';
export type { EmailMessage } from './email';

// =========================
// SOLICITUDES DE SERVICIO
// =========================
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
  if (IS_DEMO || !supabase) return mock.createServiceRequest(type, tableNumber, options);
  const user = await getCurrentUser();
  const nowIso = new Date().toISOString();

  const payload = {
    type,
    method: options?.method || null,
    table_number: tableNumber,
    user_id: user?.id || null,
    user_name: user?.name || null,
    status: 'pending',
    total: options?.total ?? null,
    order_ids: options?.orderIds ?? null,
    message: options?.message ?? null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from('service_requests')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) throw error;
  return data as ServiceRequest;
}

export async function getServiceRequests(status?: string): Promise<ServiceRequest[]> {
  if (IS_DEMO || !supabase) return mock.getServiceRequests(status);
  let query = supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ServiceRequest[];
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: ServiceRequest['status']
): Promise<void> {
  if (IS_DEMO || !supabase) return mock.updateServiceRequestStatus(requestId, status);

  const { error } = await supabase
    .from('service_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) throw error;
}

// =========================
// PAGO DIVIDIDO POR GRUPOS
// =========================
export async function createGroupSession(tableNumber: number, orderIds: string[]): Promise<GroupSession> {
  if (IS_DEMO || !supabase) return mock.createGroupSession(tableNumber, orderIds);
  throw new Error('Supabase not configured');
}

export async function getGroupSession(sessionId: string): Promise<GroupSession | null> {
  if (IS_DEMO || !supabase) return mock.getGroupSession(sessionId);
  throw new Error('Supabase not configured');
}

export async function joinGroupSession(sessionId: string): Promise<GroupSession> {
  if (IS_DEMO || !supabase) return mock.joinGroupSession(sessionId);
  throw new Error('Supabase not configured');
}

export async function claimGroupItem(sessionId: string, itemId: string): Promise<GroupSession> {
  if (IS_DEMO || !supabase) return mock.claimGroupItem(sessionId, itemId);
  throw new Error('Supabase not configured');
}

export async function unclaimGroupItem(sessionId: string, itemId: string): Promise<GroupSession> {
  if (IS_DEMO || !supabase) return mock.unclaimGroupItem(sessionId, itemId);
  throw new Error('Supabase not configured');
}

export async function payGroupShare(sessionId: string): Promise<GroupSession> {
  if (IS_DEMO || !supabase) return mock.payGroupShare(sessionId);
  throw new Error('Supabase not configured');
}

export async function hostPayVenue(sessionId: string): Promise<void> {
  if (IS_DEMO || !supabase) return mock.hostPayVenue(sessionId);
  throw new Error('Supabase not configured');
}

export async function getActiveGroupSessions(tableNumber: number): Promise<GroupSession[]> {
  if (IS_DEMO || !supabase) return mock.getActiveGroupSessions(tableNumber);
  throw new Error('Supabase not configured');
}
