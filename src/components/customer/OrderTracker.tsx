import { useState, useEffect } from 'react';
import {
  IoCloseOutline,
  IoTimeOutline,
  IoFlameOutline,
  IoCheckmarkDoneOutline,
  IoWalletOutline,
  IoQrCodeOutline,
} from 'react-icons/io5';
import { QRCodeSVG } from 'qrcode.react';
import { getMyOrders, subscribeToOrders } from '../../lib/db';
import styles from './OrderTracker.module.css';

interface OrderData {
  id: string;
  table_number: number;
  status: string;
  total: number;
  payment_method: string | null;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: number;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pendiente', icon: <IoTimeOutline />, color: '#f59e0b' },
  preparing: { label: 'Preparando', icon: <IoFlameOutline />, color: '#C9A84C' },
  served: { label: 'Servido', icon: <IoCheckmarkDoneOutline />, color: '#3b82f6' },
  paid: { label: 'Pagado', icon: <IoWalletOutline />, color: '#10b981' },
};

export default function OrderTracker({ isOpen, onClose, tableNumber }: Props) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getMyOrders()
      .then((data) => setOrders(data as OrderData[]))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Suscripción en tiempo real — recibe cambios de estado del admin instantáneamente
    const channel = subscribeToOrders(() => {
      getMyOrders()
        .then((data) => setOrders(data as OrderData[]))
        .catch(console.error);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const activeOrders = orders.filter((o) => o.status !== 'paid');
  const pastOrders = orders.filter((o) => o.status === 'paid').slice(0, 5);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Mis Pedidos</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Cargando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>
              <IoTimeOutline size={40} />
              <p>No tienes pedidos aún</p>
              <span>Cuando hagas un pedido, podrás seguir su estado aquí</span>
            </div>
          ) : (
            <>
              {activeOrders.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Pedidos activos</h3>
                  {activeOrders.map((order) => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={order.id} className={styles.order}>
                        <div className={styles.orderHeader}>
                          <span className={styles.orderTime}>{formatTime(order.created_at)}</span>
                          <span
                            className={styles.status}
                            style={{ background: `${config.color}15`, color: config.color }}
                          >
                            {config.icon} {config.label}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className={styles.progress}>
                          {['pending', 'preparing', 'served'].map((step, i) => {
                            const stepIndex = ['pending', 'preparing', 'served'].indexOf(order.status);
                            const isActive = i <= stepIndex;
                            return (
                              <div
                                key={step}
                                className={`${styles.progressStep} ${isActive ? styles.progressActive : ''}`}
                                style={{ '--step-color': STATUS_CONFIG[step].color } as React.CSSProperties}
                              >
                                <div className={styles.progressDot} />
                                <span>{STATUS_CONFIG[step].label}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className={styles.orderItems}>
                          {order.items.map((item, i) => (
                            <div key={i} className={styles.orderItem}>
                              <span>{item.quantity}x {item.product_name}</span>
                              <span>{(item.unit_price * item.quantity).toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                        <div className={styles.orderTotal}>
                          <span>Total</span>
                          <span>{order.total.toFixed(2)} €</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pastOrders.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Pedidos anteriores</h3>
                  {pastOrders.map((order) => (
                    <div key={order.id} className={`${styles.order} ${styles.pastOrder}`}>
                      <div className={styles.orderHeader}>
                        <span className={styles.orderTime}>{formatTime(order.created_at)}</span>
                        <span
                          className={styles.status}
                          style={{ background: '#10b98115', color: '#10b981' }}
                        >
                          <IoWalletOutline /> Pagado
                        </span>
                      </div>
                      <div className={styles.orderTotal}>
                        <span>{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</span>
                        <span>{order.total.toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* QR para compartir mesa */}
              {tableNumber && (
                <div className={styles.section}>
                  <button
                    className={styles.shareBtn}
                    onClick={() => setShowQR(!showQR)}
                  >
                    <IoQrCodeOutline size={18} />
                    {showQR ? 'Ocultar QR' : 'Compartir mesa con QR'}
                  </button>
                  {showQR && (
                    <div className={styles.qrCard}>
                      <QRCodeSVG
                        value={`${window.location.origin}/mesa/${tableNumber}`}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#0A0A0A"
                        level="M"
                        includeMargin
                      />
                      <p className={styles.qrLabel}>
                        Escanea para unirte a la Mesa {tableNumber}
                      </p>
                      <span className={styles.qrHint}>
                        Tus amigos podrán pedir y pagar desde su móvil
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
