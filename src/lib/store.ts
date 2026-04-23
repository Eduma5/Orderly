import { create } from 'zustand';
import type { CartItem, Product, UserPublic } from './types';

interface CartStore {
  items: CartItem[];
  tableNumber: number | null;
  sessionId: string | null;
  favoriteProductIds: string[];
  lastOrder: Array<{ productId: string; quantity: number; notes?: string }>;
  setTable: (tableNumber: number, sessionId: string) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  saveLastOrder: (items: CartItem[]) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableNumber: null,
  sessionId: null,
  favoriteProductIds: loadJson<string[]>('ema_favorite_product_ids', []),
  lastOrder: loadJson<Array<{ productId: string; quantity: number; notes?: string }>>('ema_last_order', []),

  setTable: (tableNumber, sessionId) => set({ tableNumber, sessionId }),

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.product.id !== productId)
          : state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i
            ),
    })),

  updateNotes: (productId, notes) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, notes } : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  toggleFavorite: (productId) =>
    set((state) => {
      const exists = state.favoriteProductIds.includes(productId);
      const next = exists
        ? state.favoriteProductIds.filter((id) => id !== productId)
        : [...state.favoriteProductIds, productId];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ema_favorite_product_ids', JSON.stringify(next));
      }
      return { favoriteProductIds: next };
    }),

  isFavorite: (productId) => get().favoriteProductIds.includes(productId),

  saveLastOrder: (items) => {
    const snapshot = items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      notes: i.notes,
    }));
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ema_last_order', JSON.stringify(snapshot));
    }
    set({ lastOrder: snapshot });
  },

  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

// ---- User auth store (cliente) ----
interface UserStore {
  user: UserPublic | null;
  loading: boolean;
  setUser: (user: UserPublic | null) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (value) => set({ loading: value }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ema_user_id');
      localStorage.removeItem('ema_user_token');
    }
    set({ user: null });
  },
}));

// ---- Admin auth store ----
interface AdminStore {
  isAuthenticated: boolean;
  loading: boolean;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isAuthenticated: false,
  loading: true,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ loading: value }),
}));
