// ============================================
// Capa de Datos — Router demo / Supabase
// ============================================
import { IS_DEMO } from './supabase';
import * as mock from './mockDb';
import type { Category, Product, Order, UserPublic, ServiceRequest, GroupSession } from './types';

// =========================
// USUARIOS
// =========================
export async function registerUser(name: string, email: string, password: string): Promise<UserPublic> {
  if (IS_DEMO) return mock.registerUser(name, email, password);
  throw new Error('Supabase auth not configured');
}

export async function loginUser(email: string, password: string): Promise<UserPublic> {
  if (IS_DEMO) return mock.loginUser(email, password);
  throw new Error('Supabase auth not configured');
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  if (IS_DEMO) return mock.getCurrentUser();
  return null;
}

export async function logoutUser(): Promise<void> {
  if (IS_DEMO) return mock.logoutUser();
}

// =========================
// RECUPERACIÓN DE CONTRASEÑA
// =========================
export async function requestPasswordReset(email: string): Promise<string> {
  if (IS_DEMO) return mock.requestPasswordReset(email);
  throw new Error('Supabase not configured');
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  if (IS_DEMO) return mock.resetPassword(email, code, newPassword);
  throw new Error('Supabase not configured');
}

// =========================
// CATEGORÍAS
// =========================
export async function getCategories(): Promise<Category[]> {
  if (IS_DEMO) return mock.getCategories();
  throw new Error('Supabase not configured');
}

// =========================
// PRODUCTOS
// =========================
export async function getProducts(): Promise<Product[]> {
  if (IS_DEMO) return mock.getProducts();
  throw new Error('Supabase not configured');
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  if (IS_DEMO) return mock.getProductsByCategory(categoryId);
  throw new Error('Supabase not configured');
}

export async function upsertProduct(
  product: Partial<Product> & { category_id: string; name: string; price: number }
): Promise<Product> {
  if (IS_DEMO) return mock.upsertProduct(product);
  throw new Error('Supabase not configured');
}

export async function deleteProduct(productId: string): Promise<void> {
  if (IS_DEMO) return mock.deleteProduct(productId);
  throw new Error('Supabase not configured');
}

export async function toggleProductAvailability(productId: string, available: boolean): Promise<void> {
  if (IS_DEMO) return mock.toggleProductAvailability(productId, available);
  throw new Error('Supabase not configured');
}

// =========================
// MESAS
// =========================
export async function getTables() {
  if (IS_DEMO) return mock.getTables();
  throw new Error('Supabase not configured');
}

export async function upsertTable(table: { id?: string; number: number; name?: string; active?: boolean }) {
  if (IS_DEMO) return mock.upsertTable(table);
  throw new Error('Supabase not configured');
}

export async function deleteTable(tableId: string) {
  if (IS_DEMO) return mock.deleteTable(tableId);
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
  if (IS_DEMO) return mock.createOrder(tableNumber, items, paymentMethod);
  throw new Error('Supabase not configured');
}

export async function getUnpaidOrdersByTable(tableNumber: number) {
  if (IS_DEMO) return mock.getUnpaidOrdersByTable(tableNumber);
  throw new Error('Supabase not configured');
}

export async function payOrders(orderIds: string[], paymentMethod: string, tableNumber: number): Promise<void> {
  if (IS_DEMO) return mock.payOrders(orderIds, paymentMethod, tableNumber);
  throw new Error('Supabase not configured');
}

export async function payPartial(tableNumber: number, amount: number, paymentMethod: string, payerName: string): Promise<void> {
  if (IS_DEMO) return mock.payPartial(tableNumber, amount, paymentMethod, payerName);
  throw new Error('Supabase not configured');
}

export async function getPartialPayments(tableNumber: number) {
  if (IS_DEMO) return mock.getPartialPayments(tableNumber);
  throw new Error('Supabase not configured');
}

export async function getOrders(status?: string): Promise<Order[]> {
  if (IS_DEMO) return mock.getOrders(status);
  throw new Error('Supabase not configured');
}

export async function getPaidOrders(since?: string) {
  if (IS_DEMO) return mock.getPaidOrders(since);
  throw new Error('Supabase not configured');
}

export async function updateOrderStatus(orderId: string, status: string, paymentMethod?: string): Promise<void> {
  if (IS_DEMO) return mock.updateOrderStatus(orderId, status, paymentMethod);
  throw new Error('Supabase not configured');
}

export async function setOrderStripePaymentId(orderId: string, stripePaymentId: string): Promise<void> {
  if (IS_DEMO) return mock.setOrderStripePaymentId(orderId, stripePaymentId);
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
  if (IS_DEMO) return mock.createTicket(orderId, tableNumber, items, total, paymentMethod);
  throw new Error('Supabase not configured');
}

export async function getMyTickets() {
  if (IS_DEMO) return mock.getMyTickets();
  throw new Error('Supabase not configured');
}

// =========================
// ADMIN SETTINGS
// =========================
export async function getAdminSettings() {
  if (IS_DEMO) return mock.getAdminSettings();
  throw new Error('Supabase not configured');
}

export async function updateAdminSetting(key: string, value: string) {
  if (IS_DEMO) return mock.updateAdminSetting(key, value);
  throw new Error('Supabase not configured');
}

// =========================
// REALTIME
// =========================
export function subscribeToOrders(callback: (payload: any) => void) {
  if (IS_DEMO) return mock.subscribeToOrders(callback);
  return { unsubscribe: () => {} };
}

// =========================
// MIS PEDIDOS
// =========================
export async function getMyOrders() {
  if (IS_DEMO) return mock.getMyOrders();
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
  if (IS_DEMO) return mock.rechargeWallet(amount);
  throw new Error('Supabase not configured');
}

export async function payWithWallet(amount: number, description: string): Promise<number> {
  if (IS_DEMO) return mock.payWithWallet(amount, description);
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
  if (IS_DEMO) return mock.createServiceRequest(type, tableNumber, options);
  throw new Error('Supabase not configured');
}

export async function getServiceRequests(status?: string): Promise<ServiceRequest[]> {
  if (IS_DEMO) return mock.getServiceRequests(status);
  throw new Error('Supabase not configured');
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: ServiceRequest['status']
): Promise<void> {
  if (IS_DEMO) return mock.updateServiceRequestStatus(requestId, status);
  throw new Error('Supabase not configured');
}

// =========================
// PAGO DIVIDIDO POR GRUPOS
// =========================
export async function createGroupSession(tableNumber: number, orderIds: string[]): Promise<GroupSession> {
  if (IS_DEMO) return mock.createGroupSession(tableNumber, orderIds);
  throw new Error('Supabase not configured');
}

export async function getGroupSession(sessionId: string): Promise<GroupSession | null> {
  if (IS_DEMO) return mock.getGroupSession(sessionId);
  throw new Error('Supabase not configured');
}

export async function joinGroupSession(sessionId: string): Promise<GroupSession> {
  if (IS_DEMO) return mock.joinGroupSession(sessionId);
  throw new Error('Supabase not configured');
}

export async function claimGroupItem(sessionId: string, itemId: string): Promise<GroupSession> {
  if (IS_DEMO) return mock.claimGroupItem(sessionId, itemId);
  throw new Error('Supabase not configured');
}

export async function unclaimGroupItem(sessionId: string, itemId: string): Promise<GroupSession> {
  if (IS_DEMO) return mock.unclaimGroupItem(sessionId, itemId);
  throw new Error('Supabase not configured');
}

export async function payGroupShare(sessionId: string): Promise<GroupSession> {
  if (IS_DEMO) return mock.payGroupShare(sessionId);
  throw new Error('Supabase not configured');
}

export async function hostPayVenue(sessionId: string): Promise<void> {
  if (IS_DEMO) return mock.hostPayVenue(sessionId);
  throw new Error('Supabase not configured');
}

export async function getActiveGroupSessions(tableNumber: number): Promise<GroupSession[]> {
  if (IS_DEMO) return mock.getActiveGroupSessions(tableNumber);
  throw new Error('Supabase not configured');
}
