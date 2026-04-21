import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  IoRestaurantOutline,
  IoReceiptOutline,
  IoGridOutline,
  IoQrCodeOutline,
  IoLogOutOutline,
  IoStatsChartOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import AdminLogin from './AdminLogin';
import OrdersPanel from './OrdersPanel';
import MenuManager from './MenuManager';
import TablesPanel from './TablesPanel';
import QRGenerator from './QRGenerator';
import EarningsPanel from './EarningsPanel';
import AdminSettings from './AdminSettings';
import styles from './AdminApp.module.css';

type Tab = 'orders' | 'menu' | 'tables' | 'qr' | 'earnings' | 'settings';

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem('ema_admin');
    if (isAdmin === 'true') {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ema_admin');
    setAuthenticated(false);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <span>Cargando...</span>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: 'Pedidos', icon: <IoReceiptOutline size={20} /> },
    { id: 'earnings', label: 'Ganancias', icon: <IoStatsChartOutline size={20} /> },
    { id: 'menu', label: 'Menú', icon: <IoRestaurantOutline size={20} /> },
    { id: 'tables', label: 'Mesas', icon: <IoGridOutline size={20} /> },
    { id: 'qr', label: 'QR', icon: <IoQrCodeOutline size={20} /> },
    { id: 'settings', label: 'Ajustes', icon: <IoSettingsOutline size={20} /> },
  ];

  return (
    <div className={styles.app}>
      <Toaster position="top-right" />
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="ORDERLY" className={styles.logoImg} />
          <span className={styles.badge}>Admin</span>
        </div>
        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navBtn} ${
                activeTab === tab.id ? styles.navActive : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <IoLogOutOutline size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
        </header>
        <div className={styles.content}>
          {activeTab === 'orders' && <OrdersPanel />}
          {activeTab === 'earnings' && <EarningsPanel />}
          {activeTab === 'menu' && <MenuManager />}
          {activeTab === 'tables' && <TablesPanel />}
          {activeTab === 'qr' && <QRGenerator />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.mobileNavBtn} ${
              activeTab === tab.id ? styles.mobileNavActive : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
