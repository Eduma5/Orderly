import { useCartStore } from '../../lib/store';
import { IoCartOutline, IoReceiptOutline, IoTimeOutline, IoWalletOutline, IoLogOutOutline, IoCallOutline } from 'react-icons/io5';
import styles from './CustomerHeader.module.css';

interface Props {
  tableNumber: number;
  userName?: string;
  onCartClick: () => void;
  onTicketsClick?: () => void;
  onOrdersClick?: () => void;
  onWalletClick?: () => void;
  onLogout?: () => void;
  onCallWaiter?: () => void;
}

export default function CustomerHeader({ tableNumber, userName, onCartClick, onTicketsClick, onOrdersClick, onWalletClick, onLogout, onCallWaiter }: Props) {
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <>
      {/* ===== TOP HEADER ===== */}
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <img src="/logo.png" alt="ORDERLY" className={styles.logoImg} />
            <div className={styles.brandText}>
              <span className={styles.greeting}>
                {userName ? `Hola, ${userName}` : 'ORDERLY'}
              </span>
              <span className={styles.tableBadge}>Mesa {tableNumber}</span>
            </div>
          </div>
          <div className={styles.right}>
            <button className={styles.cartBtn} onClick={onCartClick} aria-label="Carrito">
              <IoCartOutline size={22} />
              {itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== BOTTOM NAVIGATION BAR ===== */}
      <nav className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          <button className={styles.navItem} onClick={onCartClick}>
            <span className={styles.navIcon}>
              <IoCartOutline size={20} />
            </span>
            <span className={styles.navLabel}>Carrito</span>
            {itemCount > 0 && <span className={styles.navBadge}>{itemCount}</span>}
          </button>

          {onOrdersClick && (
            <button className={styles.navItem} onClick={onOrdersClick}>
              <span className={styles.navIcon}>
                <IoTimeOutline size={20} />
              </span>
              <span className={styles.navLabel}>Pedidos</span>
            </button>
          )}

          {onTicketsClick && (
            <button className={styles.navItem} onClick={onTicketsClick}>
              <span className={styles.navIcon}>
                <IoReceiptOutline size={20} />
              </span>
              <span className={styles.navLabel}>Tickets</span>
            </button>
          )}

          {onWalletClick && (
            <button className={styles.navItem} onClick={onWalletClick}>
              <span className={styles.navIcon}>
                <IoWalletOutline size={20} />
              </span>
              <span className={styles.navLabel}>Monedero</span>
            </button>
          )}

          {onCallWaiter && (
            <button className={`${styles.navItem} ${styles.waiterItem}`} onClick={onCallWaiter}>
              <span className={styles.navIcon}>
                <IoCallOutline size={20} />
              </span>
              <span className={styles.navLabel}>Camarero</span>
            </button>
          )}

          {onLogout && (
            <button className={`${styles.navItem} ${styles.logoutItem}`} onClick={onLogout}>
              <span className={styles.navIcon}>
                <IoLogOutOutline size={20} />
              </span>
              <span className={styles.navLabel}>Salir</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
