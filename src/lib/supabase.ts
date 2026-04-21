import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const IS_DEMO = !supabaseUrl;

// Solo crear el cliente cuando hay credenciales reales
export const supabase = IS_DEMO
  ? (null as any)
  : createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Helper para generar/obtener session ID del cliente
// ============================================
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('ema_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('ema_session_id', sid);
  }
  return sid;
}
