import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IoTimeOutline,
  IoFlameOutline,
  IoCheckmarkDoneOutline,
  IoWalletOutline,
  IoRefreshOutline,
  IoHandRightOutline,
  IoPersonOutline,
  IoCardOutline,
  IoCashOutline,
  IoCallOutline,
  IoCheckmarkOutline,
  IoHourglassOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import {
  getOrders,
  updateOrderStatus,
  subscribeToOrders,
  getServiceRequests,
  updateServiceRequestStatus,
  payOrders,
} from '../../lib/db';
import type { ServiceRequest } from '../../lib/types';
import styles from './OrdersPanel.module.css';

interface OrderData {
  id: string;
  table_number: number;
  user_id?: string | null;
  user_name?: string | null;
  status: 'pending' | 'preparing' | 'served' | 'ready_for_payment' | 'paid';
  total: number;
  total_cost: number;
  payment_method: string | null;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number; unit_cost: number; notes?: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pendiente', icon: <IoTimeOutline />, color: '#f59e0b' },
  preparing: { label: 'Preparando', icon: <IoFlameOutline />, color: '#C9A84C' },
  served: { label: 'Servido', icon: <IoCheckmarkDoneOutline />, color: '#3b82f6' },
  ready_for_payment: { label: 'Pago solicitado', icon: <IoHandRightOutline />, color: '#ef4444' },
  paid: { label: 'Pagado', icon: <IoWalletOutline />, color: '#10b981' },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing',
  preparing: 'served',
  served: 'ready_for_payment',
  ready_for_payment: 'paid',
};

const NEXT_LABEL: Record<string, string> = {
  pending: 'Preparando',
  preparing: 'Servido',
  served: 'Listo para cobrar',
  ready_for_payment: 'Cobrado',
};

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.12;
    osc.start();
    setTimeout(() => { osc.frequency.value = 1000; }, 150);
    setTimeout(() => { osc.stop(); ctx.close(); }, 300);
  } catch { /* audio not available */ }
}

function playUrgentSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = 600;
    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => { osc.frequency.value = 900; }, 100);
    setTimeout(() => { osc.frequency.value = 600; }, 200);
    setTimeout(() => { osc.frequency.value = 900; }, 300);
    setTimeout(() => { osc.stop(); ctx.close(); }, 400);
  } catch { /* audio not available */ }
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const lastRequestCountRef = useRef<number>(0);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data as OrderData[]);
      return data.length;
    } catch (err) {
      console.error('Error loading orders:', err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await getServiceRequests();
      // Solo pendientes y en proceso
      const active = data.filter((r) => r.status !== 'completed');
      setServiceRequests(active);
      return active.length;
    } catch (err) {
      console.error('Error loading service requests:', err);
      return 0;
    }
  }, []);

  useEffect(() => {
    loadOrders().then((count) => setLastOrderCount(count));
    loadRequests().then((count) => { lastRequestCountRef.current = count; });

    const channel = subscribeToOrders(async (payload) => {
      const newOrderCount = await loadOrders();
      const newReqCount = await loadRequests();

      if (payload.eventType === 'BROADCAST' || payload.eventType === 'STORAGE') {
        // Notificar nuevos pedidos
        if (payload.event === 'order_new' || (lastOrderCount !== null && newOrderCount > lastOrderCount)) {
          const tableNum = payload.data?.tableNumber;
          toast.success(
            `🔔 Nuevo pedido${tableNum ? ` — Mesa ${tableNum}` : ''}`,
            { duration: 5000, icon: '🆕' }
          );
          playNotificationSound();
        }

        // Notificar nuevas solicitudes de servicio
        if (payload.event === 'service_request_new' || newReqCount > lastRequestCountRef.current) {
          const data = payload.data || {};
          const typeLabel = data.type === 'solicitud_pago'
            ? `💳 Solicitud de pago${data.method === 'datafono' ? ' (datáfono)' : data.method === 'efectivo' ? ' (efectivo)' : ''}`
            : '🙋 Solicitud de camarero';
          toast(
            `${typeLabel}\nMesa ${data.tableNumber || '?'}${data.userName ? ` — ${data.userName}` : ''}${data.total ? ` — ${data.total.toFixed(2)} €` : ''}`,
            { duration: 8000, icon: '🚨', style: { background: '#fef3c7', border: '2px solid #f59e0b', fontWeight: 600 } }
          );
          playUrgentSound();
        }

        setLastOrderCount(newOrderCount);
        lastRequestCountRef.current = newReqCount;
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [loadOrders, loadRequests]);

  const filteredOrders =
    filter === 'all'
      ? orders.filter((o) => o.status !== 'paid')
      : orders.filter((o) => o.status === filter);

  const advanceStatus = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    try {
      await updateOrderStatus(orderId, nextStatus, order.payment_method || undefined);

      if (nextStatus === 'paid') {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success(`Pedido cobrado — Mesa ${order.table_number}`);
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: nextStatus as OrderData['status'] } : o
          )
        );
      }
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Error al actualizar el pedido');
    }
  };

  const handleRequestAction = async (requestId: string, action: 'attending' | 'completed') => {
    try {
      await updateServiceRequestStatus(requestId, action);

      // Si se completa una solicitud de pago, marcar pedidos como pagados
      if (action === 'completed') {
        const req = serviceRequests.find((r) => r.id === requestId);
        if (req && req.type === 'solicitud_pago' && req.order_ids && req.order_ids.length > 0) {
          const payMethod = req.method === 'datafono' ? 'card' : req.method === 'efectivo' ? 'cash' : 'card';
          await payOrders(req.order_ids, payMethod, req.table_number);
          await loadOrders();
        }
        toast.success(`✅ Solicitud completada — Mesa ${serviceRequests.find((r) => r.id === requestId)?.table_number}`);
      } else {
        toast('Atendiendo solicitud...', { icon: '👨‍🍳' });
      }

      setServiceRequests((prev) =>
        action === 'completed'
          ? prev.filter((r) => r.id !== requestId)
          : prev.map((r) => r.id === requestId ? { ...r, status: action } : r)
      );
    } catch (err) {
      console.error('Error updating service request:', err);
      toast.error('Error al actualizar la solicitud');
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `Hace ${diff} min`;
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const needsPayment = orders.filter((o) => o.status === 'ready_for_payment' || o.status === 'served');

  if (loading) {
    return <div className={styles.panel}><div className={styles.empty}>Cargando pedidos...</div></div>;
  }

  return (
    <div className={styles.panel}>
      {/* === SOLICITUDES DE SERVICIO === */}
      {serviceRequests.length > 0 && (
        <div className={styles.requestsSection}>
          <h3 className={styles.requestsTitle}>
            🚨 Solicitudes activas ({serviceRequests.length})
          </h3>
          <div className={styles.requestsList}>
            {serviceRequests.map((req) => (
              <div
                key={req.id}
                className={`${styles.requestCard} ${req.status === 'attending' ? styles.requestAttending : styles.requestPending}`}
              >
                <div className={styles.requestHeader}>
                  <div className={styles.requestType}>
                    {req.type === 'solicitud_pago' ? (
                      req.method === 'datafono' ? <IoCardOutline size={18} /> : <IoCashOutline size={18} />
                    ) : (
                      <IoCallOutline size={18} />
                    )}
                    <span>
                      {req.type === 'solicitud_pago'
                        ? `Pago ${req.method === 'datafono' ? '(datáfono)' : '(efectivo)'}`
                        : 'Camarero'}
                    </span>
                  </div>
                  <span className={styles.requestTime}>{formatTime(req.created_at)}</span>
                </div>
                <div className={styles.requestInfo}>
                  <span className={styles.requestTable}>Mesa {req.table_number}</span>
                  {req.user_name && (
                    <span className={styles.requestUser}>
                      <IoPersonOutline size={12} /> {req.user_name}
                    </span>
                  )}
                  {req.total && (
                    <span className={styles.requestTotal}>{req.total.toFixed(2)} €</span>
                  )}
                  {req.message && (
                    <span className={styles.requestMessage}>"{req.message}"</span>
                  )}
                </div>
                <div className={styles.requestStatus}>
                  {req.status === 'pending' && (
                    <span className={styles.statusBadgePending}>
                      <IoHourglassOutline size={12} /> Pendiente
                    </span>
                  )}
                  {req.status === 'attending' && (
                    <span className={styles.statusBadgeAttending}>
                      <IoPersonOutline size={12} /> Atendiendo
                    </span>
                  )}
                </div>
                <div className={styles.requestActions}>
                  {req.status === 'pending' && (
                    <button
                      className={`btn btn-secondary btn-sm`}
                      onClick={() => handleRequestAction(req.id, 'attending')}
                    >
                      👨‍🍳 Atender
                    </button>
                  )}
                  <button
                    className={`btn btn-primary btn-sm`}
                    onClick={() => handleRequestAction(req.id, 'completed')}
                  >
                    <IoCheckmarkOutline size={14} />
                    {req.type === 'solicitud_pago' ? ' Cobrado' : ' Completado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {needsPayment.length > 0 && (
        <div className={styles.paymentAlert}>
          <IoWalletOutline size={18} />
          <span>
            <strong>{needsPayment.length}</strong> mesa{needsPayment.length > 1 ? 's' : ''} pendiente{needsPayment.length > 1 ? 's' : ''} de cobro:{' '}
            {needsPayment.map((o) => `Mesa ${o.table_number}`).join(', ')}
          </span>
        </div>
      )}

      <div className={styles.filters}>
        <button className={styles.refreshBtn} onClick={() => { loadOrders(); loadRequests(); }} title="Refrescar">
          <IoRefreshOutline size={16} />
        </button>
        {[
          { key: 'all', label: 'Activos', count: orders.filter((o) => o.status !== 'paid').length },
          { key: 'pending', label: 'Pendientes', count: orders.filter((o) => o.status === 'pending').length },
          { key: 'preparing', label: 'Preparando', count: orders.filter((o) => o.status === 'preparing').length },
          { key: 'served', label: 'Servidos', count: orders.filter((o) => o.status === 'served').length },
          { key: 'ready_for_payment', label: 'Por cobrar', count: orders.filter((o) => o.status === 'ready_for_payment').length },
        ].map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.orders}>
        {filteredOrders.length === 0 ? (
          <div className={styles.empty}>No hay pedidos con este filtro</div>
        ) : (
          filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status];
            return (
              <div key={order.id} className={`${styles.order} ${order.status === 'ready_for_payment' ? styles.orderServed : ''}`}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>{order.id.slice(0, 8)}</span>
                    <span className={styles.orderTable}>Mesa {order.table_number}</span>
                    {order.user_name && (
                      <span className={styles.orderUser}><IoPersonOutline size={12} /> {order.user_name}</span>
                    )}
                  </div>
                  <div className={styles.orderMeta}>
                    <span
                      className={styles.status}
                      style={{ background: `${config.color}15`, color: config.color }}
                    >
                      {config.icon} {config.label}
                    </span>
                    <span className={styles.time}>{formatTime(order.created_at)}</span>
                  </div>
                </div>
                <div className={styles.orderItems}>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      <span className={styles.itemQty}>{item.quantity}x</span>
                      <span className={styles.itemName}>{item.product_name}</span>
                      {item.notes && (
                        <span className={styles.itemNotes}>({item.notes})</span>
                      )}
                      <span className={styles.itemPrice}>
                        {(item.unit_price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>
                    Total: {order.total.toFixed(2)} €
                  </span>
                  {NEXT_STATUS[order.status] && (
                    <button
                      className={`btn ${order.status === 'ready_for_payment' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => advanceStatus(order.id)}
                    >
                      {order.status === 'ready_for_payment' ? '💰 Cobrar' : `Marcar como ${NEXT_LABEL[order.status]}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
