import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import type { Category, Product, Order, UserPublic } from '../../lib/types';
import { useCartStore, useUserStore } from '../../lib/store';
import {
  getCategories,
  getProducts,
  createOrder,
  getAdminSettings,
  getUnpaidOrdersByTable,
  getCurrentUser,
  subscribeToOrders,
  createServiceRequest,
} from '../../lib/db';
import CustomerHeader from './CustomerHeader';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import Cart from './Cart';
import PaymentModal from './PaymentModal';
import MyTickets from './MyTickets';
import OrderTracker from './OrderTracker';
import Wallet from './Wallet';
import Chatbot from './Chatbot';
import AuthModal from './AuthModal';
import SplitPayment from './SplitPayment';
import GroupPayment from './GroupPayment';
import styles from './MenuApp.module.css';

interface Props {
  tableNumber: number;
}

export default function MenuApp({ tableNumber }: Props) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const userLoading = useUserStore((s) => s.loading);
  const setUserLoading = useUserStore((s) => s.setLoading);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const items = useCartStore((s) => s.items);

  // Comprobar sesión existente al cargar
  useEffect(() => {
    async function checkAuth() {
      try {
        const existing = await getCurrentUser();
        if (existing) {
          setUser(existing);
        }
      } catch { /* ignore */ }
      finally {
        setUserLoading(false);
      }
    }
    checkAuth();
  }, [setUser, setUserLoading]);

  useEffect(() => {
    if (!user && !userLoading) return; // No cargar menú sin auth
    async function loadData() {
      try {
        const [cats, prods, setts] = await Promise.all([
          getCategories(),
          getProducts(),
          getAdminSettings(),
        ]);
        setCategories(cats);
        setProducts(prods);
        setSettings(setts);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (err) {
        console.error('Error loading data:', err);
        toast.error('Error al cargar el menú. Recarga la página.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userLoading]);

  // Cargar pedidos sin pagar
  const refreshUnpaid = useCallback(async () => {
    try {
      const orders = await getUnpaidOrdersByTable(tableNumber);
      setUnpaidOrders(orders as Order[]);
    } catch (err) {
      console.error('Error loading unpaid orders:', err);
    }
  }, [tableNumber]);

  useEffect(() => {
    refreshUnpaid();
    // Real-time: recibir cambios de estado del admin (BroadcastChannel + StorageEvent + polling)
    const channel = subscribeToOrders(() => {
      refreshUnpaid();
    });
    return () => channel.unsubscribe();
  }, [refreshUnpaid]);

  const filteredProducts = products.filter(
    (p) => p.category_id === activeCategory && p.available
  );

  // NUEVO: Enviar pedido directamente (sin pago)
  const handleSendOrder = async () => {
    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) return;

    setSending(true);
    try {
      await createOrder(tableNumber, cartItems);
      useCartStore.getState().clearCart();
      setCartOpen(false);
      toast.success('¡Pedido enviado! Lo prepararemos enseguida 🍵', { duration: 4000 });
      await refreshUnpaid();
    } catch (err: any) {
      console.error('Order error:', err);
      toast.error('Error al enviar el pedido. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  // Cálculo del total de pedidos sin pagar
  const unpaidTotal = unpaidOrders.reduce((s, o) => s + o.total, 0);

  // Cuando se completa el pago
  const handlePaymentComplete = () => {
    setPaymentOpen(false);
    refreshUnpaid();
  };

  // Auth gate: mostrar acceso si no hay usuario autenticado
  if (!user) {
    return (
      <div className={styles.app}>
        <AuthModal
          tableNumber={tableNumber}
          onAuthenticated={(u) => {
            setUser(u);
            toast.success(`¡Hola ${u.name}! Bienvenido a ORDERLY`, { duration: 3000 });
          }}
        />
      </div>
    );
  }

  // Llamar al camarero
  const handleCallWaiter = async () => {
    try {
      await createServiceRequest('solicitud_camarero', tableNumber);
      toast.success('🙋 Camarero notificado. Vendrá a tu mesa.', { duration: 4000 });
    } catch (err) {
      console.error('Error calling waiter:', err);
      toast.error('Error al solicitar el camarero');
    }
  };

  if (userLoading || loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner} />
          <p>Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#0A0A0A',
            color: '#fff',
            fontSize: '0.875rem',
          },
        }}
      />
      <CustomerHeader
        tableNumber={tableNumber}
        userName={user?.name}
        onCartClick={() => setCartOpen(true)}
        onTicketsClick={() => setTicketsOpen(true)}
        onOrdersClick={() => setTrackerOpen(true)}
        onWalletClick={() => setWalletOpen(true)}
        onCallWaiter={handleCallWaiter}
        onLogout={() => {
          useUserStore.getState().logout();
          toast('Sesión cerrada', { icon: '👋' });
        }}
      />
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <img src="/header.png" alt="ORDERLY banner" className={styles.heroBanner} />
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {categories.find((c) => c.id === activeCategory)?.name || 'Menú'}
          </h2>
          <span className={styles.sectionCount}>{filteredProducts.length} productos</span>
        </div>
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🍃</span>
            <p>No hay productos disponibles en esta categoría</p>
          </div>
        )}
      </main>

      {/* Floating bar: carrito */}
      {items.length > 0 && !cartOpen && (
        <div className={styles.floatingBar}>
          <button className={styles.floatingBtn} onClick={() => setCartOpen(true)}>
            <span>Ver pedido ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className={styles.floatingTotal}>
              {items.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2)} €
            </span>
          </button>
        </div>
      )}

      {/* Botón solicitar pago — solo si hay pedidos sin pagar Y el carrito está vacío */}
      {unpaidOrders.length > 0 && items.length === 0 && !cartOpen && (
        <div className={styles.floatingBar}>
          <button
            className={`${styles.floatingBtn} ${styles.payBtn}`}
            onClick={() => setPaymentOpen(true)}
          >
            <span>Pagar ({unpaidOrders.length} pedido{unpaidOrders.length > 1 ? 's' : ''})</span>
            <span className={styles.floatingTotal}>{unpaidTotal.toFixed(2)} €</span>
          </button>
          {unpaidOrders.length > 0 && (
            <button
              className={`${styles.floatingBtn} ${styles.splitBtn}`}
              onClick={() => setGroupOpen(true)}
            >
              Dividir cuenta
            </button>
          )}
        </div>
      )}

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleSendOrder}
        sending={sending}
      />
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onComplete={handlePaymentComplete}
        tableNumber={tableNumber}
        settings={settings}
        unpaidOrders={unpaidOrders}
      />
      <MyTickets isOpen={ticketsOpen} onClose={() => setTicketsOpen(false)} />
      <OrderTracker isOpen={trackerOpen} onClose={() => setTrackerOpen(false)} tableNumber={tableNumber} />
      <Wallet isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <SplitPayment
        isOpen={splitOpen}
        onClose={() => setSplitOpen(false)}
        onComplete={() => { setSplitOpen(false); refreshUnpaid(); }}
        tableNumber={tableNumber}
        unpaidOrders={unpaidOrders}
        settings={settings}
      />
      <GroupPayment
        isOpen={groupOpen}
        onClose={() => setGroupOpen(false)}
        onComplete={() => { setGroupOpen(false); refreshUnpaid(); }}
        tableNumber={tableNumber}
        unpaidOrders={unpaidOrders}
      />
      <Chatbot products={products} categories={categories} activeCategory={activeCategory} />

      <footer className={styles.footer}>
        Powered by <strong>ORDERLY</strong>
      </footer>
    </div>
  );
}
