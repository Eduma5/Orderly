import { useState } from 'react';
import {
  IoArrowBack,
  IoCardOutline,
  IoCashOutline,
  IoPhonePortraitOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import { payOrders, getWalletBalance, payWithWallet, createServiceRequest } from '../../lib/db';
import { toast } from 'react-hot-toast';
import type { Order } from '../../lib/types';
import styles from './PaymentModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tableNumber: number;
  settings?: Record<string, string>;
  unpaidOrders: Order[];
}

export default function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  tableNumber,
  settings = {},
  unpaidOrders,
}: Props) {
  const [method, setMethod] = useState<'card' | 'cash' | 'bizum' | 'wallet' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  if (!isOpen || unpaidOrders.length === 0) return null;

  const total = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const allItems = unpaidOrders.flatMap((o) =>
    o.items.map((item) => ({
      name: item.product_name,
      qty: item.quantity,
      price: item.unit_price,
    }))
  );
  const orderIds = unpaidOrders.map((o) => o.id);

  const handleBack = () => setMethod(null);

  const handleSelectWallet = async () => {
    try {
      const bal = await getWalletBalance();
      setWalletBalance(bal);
      setMethod('wallet');
    } catch {
      toast.error('Error al consultar el monedero');
    }
  };

  const handleConfirm = async (m: string) => {
    setProcessing(true);
    try {
      if (m === 'wallet') {
        if (walletBalance !== null && walletBalance < total) {
          toast.error('Saldo insuficiente. Recarga tu monedero.');
          setProcessing(false);
          return;
        }
        await payWithWallet(total, `Pago mesa ${tableNumber}`);
        await payOrders(orderIds, 'wallet', tableNumber);
        toast.success('¡Pagado con monedero! 💰', { duration: 4000 });
        setMethod(null);
        onComplete();
      } else if (m === 'bizum') {
        await payOrders(orderIds, 'bizum', tableNumber);
        toast.success(
          `¡Pago solicitado! Envía ${total.toFixed(2)} € por Bizum al ${settings.bizum_phone || 'número del local'}`,
          { duration: 5000 }
        );
        setMethod(null);
        onComplete();
      } else if (m === 'card' || m === 'cash') {
        // NO procesar pago — crear solicitud para el admin
        await createServiceRequest('solicitud_pago', tableNumber, {
          method: m === 'card' ? 'datafono' : 'efectivo',
          total,
          orderIds,
        });
        const messages: Record<string, string> = {
          card: '📱 Solicitud enviada. El camarero traerá el datáfono a tu mesa.',
          cash: '💵 Solicitud enviada. El camarero vendrá a cobrarte.',
        };
        toast.success(messages[m] || 'Solicitud enviada al camarero.', { duration: 5000 });
        setMethod(null);
        onComplete();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err?.message || 'Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const bizumPhone = settings.bizum_phone || '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {method && (
            <button className={styles.backBtn} onClick={handleBack}>
              <IoArrowBack size={20} />
            </button>
          )}
          <h2 className={styles.title}>
            {!method
              ? 'Método de pago'
              : method === 'bizum'
              ? 'Pago con Bizum'
              : method === 'card'
              ? 'Pago con tarjeta'
              : method === 'wallet'
              ? 'Pago con monedero'
              : 'Pago en efectivo'}
          </h2>
        </div>

        {/* Order summary */}
        {method && (
          <div className={styles.orderSummary}>
            <div className={styles.summaryHeader}>
              <span>Tu consumición</span>
              <span className={styles.summaryTable}>Mesa {tableNumber}</span>
            </div>
            {allItems.map((item, i) => (
              <div key={i} className={styles.summaryItem}>
                <span>{item.qty}x {item.name}</span>
                <span>{(item.price * item.qty).toFixed(2)} €</span>
              </div>
            ))}
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
        )}

        {!method ? (
          <div className={styles.methods}>
            {/* Wallet */}
            <button className={styles.methodBtn} onClick={handleSelectWallet}>
              <div className={styles.methodIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                <IoWalletOutline size={24} />
              </div>
              <div>
                <span className={styles.methodName}>Monedero ORDERLY</span>
                <span className={styles.methodDesc}>Paga con tu saldo</span>
              </div>
            </button>

            {bizumPhone && (
              <button className={styles.methodBtn} onClick={() => setMethod('bizum')}>
                <div className={styles.methodIcon} style={{ background: '#dbeafe', color: '#2563eb' }}>
                  <IoPhonePortraitOutline size={24} />
                </div>
                <div>
                  <span className={styles.methodName}>Bizum</span>
                  <span className={styles.methodDesc}>Pago rápido al {bizumPhone}</span>
                </div>
                <span className={styles.methodBadge}>Recomendado</span>
              </button>
            )}
            <button className={styles.methodBtn} onClick={() => setMethod('card')}>
              <div className={styles.methodIcon} style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <IoCardOutline size={24} />
              </div>
              <div>
                <span className={styles.methodName}>Tarjeta</span>
                <span className={styles.methodDesc}>El camarero trae el datáfono</span>
              </div>
            </button>
            <button className={styles.methodBtn} onClick={() => setMethod('cash')}>
              <div className={styles.methodIcon} style={{ background: '#d1fae5', color: '#059669' }}>
                <IoCashOutline size={24} />
              </div>
              <div>
                <span className={styles.methodName}>Efectivo</span>
                <span className={styles.methodDesc}>Paga en caja o al camarero</span>
              </div>
            </button>
          </div>
        ) : method === 'wallet' ? (
          <div className={styles.confirmView}>
            <div className={styles.totalDisplay}>
              <span>Total a pagar</span>
              <span className={styles.totalAmount}>{total.toFixed(2)} €</span>
            </div>
            <div className={styles.bizumInfo}>
              <div className={styles.bizumAmount}>
                <span>Saldo actual:</span>
                <span className={styles.bizumTotal}>
                  {walletBalance !== null ? walletBalance.toFixed(2) + ' €' : '...'}
                </span>
              </div>
              {walletBalance !== null && walletBalance < total && (
                <p style={{ color: '#dc2626', fontWeight: 600, textAlign: 'center', marginTop: '0.5rem' }}>
                  Saldo insuficiente. Recarga tu monedero.
                </p>
              )}
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => handleConfirm('wallet')}
              disabled={processing || (walletBalance !== null && walletBalance < total)}
            >
              {processing ? 'Procesando...' : 'Pagar con monedero'}
            </button>
          </div>
        ) : method === 'bizum' ? (
          <div className={styles.confirmView}>
            <div className={styles.bizumInfo}>
              <div className={styles.bizumPhone}>
                <IoPhonePortraitOutline size={28} />
                <div>
                  <span className={styles.bizumLabel}>Envía por Bizum a:</span>
                  <span className={styles.bizumNumber}>{bizumPhone}</span>
                </div>
              </div>
              <div className={styles.bizumAmount}>
                <span>Importe exacto:</span>
                <span className={styles.bizumTotal}>{total.toFixed(2)} €</span>
              </div>
              <div className={styles.bizumSteps}>
                <p><strong>1.</strong> Abre tu app de banco</p>
                <p><strong>2.</strong> Envía {total.toFixed(2)} € por Bizum al {bizumPhone}</p>
                <p><strong>3.</strong> Pulsa "Confirmar pago"</p>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => handleConfirm('bizum')}
              disabled={processing}
            >
              {processing ? 'Procesando...' : 'Confirmar pago'}
            </button>
          </div>
        ) : (
          <div className={styles.confirmView}>
            <div className={styles.totalDisplay}>
              <span>Total a pagar</span>
              <span className={styles.totalAmount}>{total.toFixed(2)} €</span>
            </div>
            {method === 'cash' ? (
              <p className={styles.cashNote}>
                Acércate a caja o espera a que el camarero venga a la mesa.
              </p>
            ) : (
              <p className={styles.cashNote}>
                El camarero traerá el datáfono a tu mesa.
              </p>
            )}
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => handleConfirm(method)}
              disabled={processing}
            >
              {processing
                ? 'Procesando...'
                : method === 'card'
                ? 'Solicitar datáfono'
                : 'Solicitar cobro en efectivo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
