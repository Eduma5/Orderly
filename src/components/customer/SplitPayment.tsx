import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IoCloseOutline } from 'react-icons/io5';
import { payPartial, getPartialPayments, payWithWallet, payOrders } from '../../lib/db';
import { useUserStore } from '../../lib/store';
import type { Order } from '../../lib/types';
import styles from './SplitPayment.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tableNumber: number;
  unpaidOrders: Order[];
  settings: Record<string, string>;
}

export default function SplitPayment({ isOpen, onClose, onComplete, tableNumber, unpaidOrders, settings }: Props) {
  const user = useUserStore((s) => s.user);
  const [splitCount, setSplitCount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [payerName, setPayerName] = useState(user?.name || '');
  const [method, setMethod] = useState('');
  const [paying, setPaying] = useState(false);
  const [partials, setPartials] = useState<any[]>([]);

  const total = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const paidSoFar = partials.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, Math.round((total - paidSoFar) * 100) / 100);

  useEffect(() => {
    if (isOpen) {
      loadPartials();
      setPayerName(user?.name || '');
    }
  }, [isOpen, user]);

  const loadPartials = async () => {
    const data = await getPartialPayments(tableNumber);
    setPartials(data);
  };

  const myAmount = splitCount
    ? Math.round((total / splitCount) * 100) / 100
    : parseFloat(customAmount) || 0;

  const handlePay = async () => {
    if (!method) { toast.error('Selecciona un método de pago'); return; }
    if (myAmount <= 0) { toast.error('Introduce una cantidad válida'); return; }
    if (myAmount > remaining) { toast.error('La cantidad excede lo pendiente'); return; }

    setPaying(true);
    try {
      // Si es wallet, descontar primero
      if (method === 'wallet') {
        await payWithWallet(myAmount, `Pago parcial Mesa ${tableNumber}`);
      }

      // Si el pago parcial cubre el total restante, pagar todos los pedidos
      if (myAmount >= remaining - 0.01) {
        const orderIds = unpaidOrders.map((o) => o.id);
        await payOrders(orderIds, 'split', tableNumber);
        toast.success('¡Cuenta completada! Todos los pedidos pagados 🎉');
        onComplete();
      } else {
        await payPartial(tableNumber, myAmount, method, payerName || 'Anónimo');
        toast.success(`Pago parcial de ${myAmount.toFixed(2)} € registrado`);
        await loadPartials();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago');
    } finally {
      setPaying(false);
    }
  };

  if (!isOpen) return null;

  const allPaid = remaining <= 0.01 && partials.length > 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Dividir cuenta</h2>
          <button className={styles.closeBtn} onClick={onClose}><IoCloseOutline size={20} /></button>
        </div>

        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total de la mesa</div>
          <div className={styles.totalAmount}>{total.toFixed(2)} €</div>
          {paidSoFar > 0 && (
            <div className={styles.remaining}>
              Pagado: {paidSoFar.toFixed(2)} € — Queda: {remaining.toFixed(2)} €
            </div>
          )}
        </div>

        {/* Pagos parciales ya hechos */}
        {partials.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Pagos realizados</div>
            <div className={styles.payments}>
              {partials.map((p: any) => (
                <div key={p.id} className={styles.paymentRow}>
                  <span className={styles.paymentName}>{p.payer_name}</span>
                  <span className={styles.paymentAmount}>{p.amount.toFixed(2)} €</span>
                  <span className={styles.paymentMethod}>{p.payment_method}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {allPaid ? (
          <div className={styles.completeBanner}>
            ✅ ¡Cuenta completamente pagada!
          </div>
        ) : (
          <>
            {/* Dividir en partes iguales */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Dividir entre personas</div>
              <div className={styles.splitOptions}>
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    className={`${styles.splitOption} ${splitCount === n ? styles.splitOptionActive : ''}`}
                    onClick={() => { setSplitCount(n); setCustomAmount(''); }}
                  >
                    <div className={styles.splitOptionPeople}>{n} pers.</div>
                    <div className={styles.splitOptionAmount}>
                      {(remaining / n).toFixed(2)} €
                    </div>
                  </button>
                ))}
                <button
                  className={`${styles.splitOption} ${splitCount === null && customAmount ? styles.splitOptionActive : ''}`}
                  onClick={() => setSplitCount(null)}
                >
                  <div className={styles.splitOptionPeople}>Otro</div>
                  <div className={styles.splitOptionAmount}>libre</div>
                </button>
              </div>
            </div>

            {/* Cantidad personalizada */}
            {splitCount === null && (
              <div className={styles.customAmount}>
                <input
                  className={styles.customInput}
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={remaining}
                  placeholder={`Cantidad (max ${remaining.toFixed(2)} €)`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            )}

            {/* Nombre del que paga */}
            <input
              className={styles.nameInput}
              type="text"
              placeholder="Tu nombre"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
            />

            {/* Método de pago */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Método de pago</div>
              <div className={styles.methodBtns}>
                <button
                  className={`${styles.methodBtn} ${method === 'wallet' ? styles.methodBtnActive : ''}`}
                  onClick={() => setMethod('wallet')}
                >
                  <span className={styles.methodIcon}>💳</span> Monedero ORDERLY
                </button>
                {settings.bizum_enabled !== 'false' && (
                  <button
                    className={`${styles.methodBtn} ${method === 'bizum' ? styles.methodBtnActive : ''}`}
                    onClick={() => setMethod('bizum')}
                  >
                    <span className={styles.methodIcon}>📱</span> Bizum
                  </button>
                )}
                {settings.cash_enabled !== 'false' && (
                  <button
                    className={`${styles.methodBtn} ${method === 'cash' ? styles.methodBtnActive : ''}`}
                    onClick={() => setMethod('cash')}
                  >
                    <span className={styles.methodIcon}>💶</span> Efectivo
                  </button>
                )}
                <button
                  className={`${styles.methodBtn} ${method === 'card' ? styles.methodBtnActive : ''}`}
                  onClick={() => setMethod('card')}
                >
                  <span className={styles.methodIcon}>💳</span> Tarjeta (test)
                </button>
              </div>
            </div>

            <button
              className={styles.payBtn}
              onClick={handlePay}
              disabled={paying || myAmount <= 0 || !method}
            >
              {paying ? 'Procesando...' : `Pagar ${myAmount.toFixed(2)} €`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
