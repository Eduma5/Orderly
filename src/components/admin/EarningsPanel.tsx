import { useState, useEffect, useMemo } from 'react';
import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoWalletOutline,
  IoReceiptOutline,
  IoCalendarOutline,
  IoCafeOutline,
} from 'react-icons/io5';
import { getPaidOrders } from '../../lib/db';
import styles from './EarningsPanel.module.css';

interface PaidOrderData {
  id: string;
  table_number: number;
  total: number;
  total_cost: number;
  payment_method: string;
  paid_at: string;
  items: { product_name: string; quantity: number; unit_price: number; unit_cost: number }[];
}

type Period = 'today' | 'week' | 'month' | 'all';

export default function EarningsPanel() {
  const [period, setPeriod] = useState<Period>('today');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [orders, setOrders] = useState<PaidOrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaidOrders()
      .then((data) => setOrders(data as PaidOrderData[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter((o) => {
      const d = new Date(o.paid_at);
      const methodOk = methodFilter === 'all' || (o.payment_method || 'unknown') === methodFilter;
      if (!methodOk) return false;
      switch (period) {
        case 'today': return d >= startOfDay;
        case 'week': return d >= startOfWeek;
        case 'month': return d >= startOfMonth;
        default: return true;
      }
    });
  }, [orders, period, methodFilter]);

  const availableMethods = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => set.add(o.payment_method || 'unknown'));
    return ['all', ...Array.from(set.values())];
  }, [orders]);

  const exportCsv = () => {
    const rows = filtered.map((o) => ({
      id: o.id,
      mesa: o.table_number,
      metodo: o.payment_method || 'unknown',
      total: o.total.toFixed(2),
      coste: (o.total_cost || 0).toFixed(2),
      beneficio: (o.total - (o.total_cost || 0)).toFixed(2),
      fecha: o.paid_at,
    }));

    const header = ['id', 'mesa', 'metodo', 'total', 'coste', 'beneficio', 'fecha'];
    const csv = [
      header.join(','),
      ...rows.map((r) => [r.id, r.mesa, r.metodo, r.total, r.coste, r.beneficio, r.fecha].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_${period}_${methodFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalCost = filtered.reduce((s, o) => s + (o.total_cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const orderCount = filtered.length;
    const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

    const productMap = new Map<string, { qty: number; revenue: number; profit: number }>();
    filtered.forEach((o) => {
      o.items.forEach((item) => {
        const existing = productMap.get(item.product_name) || { qty: 0, revenue: 0, profit: 0 };
        existing.qty += item.quantity;
        existing.revenue += item.unit_price * item.quantity;
        existing.profit += (item.unit_price - (item.unit_cost || 0)) * item.quantity;
        productMap.set(item.product_name, existing);
      });
    });

    const bestSellers = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    const methods = new Map<string, { count: number; amount: number }>();
    filtered.forEach((o) => {
      const m = o.payment_method || 'Desconocido';
      const existing = methods.get(m) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += o.total;
      methods.set(m, existing);
    });

    const paymentBreakdown = Array.from(methods.entries())
      .map(([method, data]) => ({ method, ...data }));

    return { totalRevenue, totalCost, totalProfit, margin, orderCount, avgTicket, bestSellers, paymentBreakdown };
  }, [filtered]);

  const periodLabels: Record<Period, string> = {
    today: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
    all: 'Todo',
  };

  if (loading) {
    return <div className={styles.panel}><p style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos...</p></div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.periodBar}>
        {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            className={`${styles.periodBtn} ${period === p ? styles.periodActive : ''}`}
            onClick={() => setPeriod(p)}
          >
            {periodLabels[p]}
          </button>
        ))}
        <select
          className={styles.periodBtn}
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          aria-label="Filtrar por método de pago"
        >
          {availableMethods.map((method) => (
            <option key={method} value={method}>
              {method === 'all' ? 'Todos los métodos' : method}
            </option>
          ))}
        </select>
        <button className={styles.periodBtn} onClick={exportCsv} disabled={filtered.length === 0}>
          Exportar CSV
        </button>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#dbeafe', color: '#2563eb' }}>
            <IoReceiptOutline size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{stats.totalRevenue.toFixed(2)} €</span>
            <span className={styles.kpiLabel}>Ingresos totales</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <IoTrendingDownOutline size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{stats.totalCost.toFixed(2)} €</span>
            <span className={styles.kpiLabel}>Coste total</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#d1fae5', color: '#059669' }}>
            <IoTrendingUpOutline size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{stats.totalProfit.toFixed(2)} €</span>
            <span className={styles.kpiLabel}>Beneficio neto</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <IoWalletOutline size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiValue}>{stats.margin.toFixed(1)}%</span>
            <span className={styles.kpiLabel}>Margen</span>
          </div>
        </div>
      </div>

      <div className={styles.subStats}>
        <div className={styles.subStat}>
          <span className={styles.subValue}>{stats.orderCount}</span>
          <span className={styles.subLabel}>Pedidos</span>
        </div>
        <div className={styles.subDivider} />
        <div className={styles.subStat}>
          <span className={styles.subValue}>{stats.avgTicket.toFixed(2)} €</span>
          <span className={styles.subLabel}>Ticket medio</span>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <IoCafeOutline size={16} /> Productos más vendidos
          </h3>
          <div className={styles.rankList}>
            {stats.bestSellers.map((product, i) => (
              <div key={product.name} className={styles.rankItem}>
                <span className={styles.rankPos}>#{i + 1}</span>
                <div className={styles.rankInfo}>
                  <span className={styles.rankName}>{product.name}</span>
                  <span className={styles.rankDetail}>
                    {product.qty} uds · {product.revenue.toFixed(2)} € · Beneficio: {product.profit.toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
            {stats.bestSellers.length === 0 && (
              <span className={styles.noData}>Sin datos para este periodo</span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <IoWalletOutline size={16} /> Métodos de pago
          </h3>
          <div className={styles.paymentList}>
            {stats.paymentBreakdown.map((pm) => (
              <div key={pm.method} className={styles.paymentItem}>
                <div className={styles.paymentHeader}>
                  <span className={styles.paymentMethod}>{pm.method}</span>
                  <span className={styles.paymentAmount}>{pm.amount.toFixed(2)} €</span>
                </div>
                <div className={styles.paymentBar}>
                  <div
                    className={styles.paymentFill}
                    style={{
                      width: `${(pm.amount / stats.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
                <span className={styles.paymentCount}>
                  {pm.count} pedido{pm.count !== 1 ? 's' : ''} · {((pm.amount / stats.totalRevenue) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            {stats.paymentBreakdown.length === 0 && (
              <span className={styles.noData}>Sin datos para este periodo</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <IoCalendarOutline size={16} /> Últimos pedidos cobrados
        </h3>
        <div className={styles.recentList}>
          {filtered.slice(0, 10).map((order) => (
            <div key={order.id} className={styles.recentItem}>
              <div className={styles.recentMain}>
                <span className={styles.recentId}>{order.id.slice(0, 8)}</span>
                <span className={styles.recentTable}>Mesa {order.table_number}</span>
                <span className={styles.recentMethod}>{order.payment_method}</span>
              </div>
              <div className={styles.recentNumbers}>
                <span className={styles.recentTotal}>{order.total.toFixed(2)} €</span>
                <span className={styles.recentProfit}>+{(order.total - (order.total_cost || 0)).toFixed(2)} €</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <span className={styles.noData}>No hay pedidos cobrados en este periodo</span>
          )}
        </div>
      </div>
    </div>
  );
}
