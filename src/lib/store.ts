import { create } from 'zustand';
import type { CartItem, Product, UserPublic } from './types';

interface CartStore {
  items: CartItem[];
  tableNumber: number | null;
  sessionId: string | null;
  setTable: (tableNumber: number, sessionId: string) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  tableNumber: null,
  sessionId: null,

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
