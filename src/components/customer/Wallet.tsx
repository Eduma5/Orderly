import { useState, useEffect } from 'react';
import {
  IoCloseOutline,
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from 'react-icons/io5';
import {
  getWalletBalance,
  getWalletTransactions,
  rechargeWallet,
} from '../../lib/db';
import type { WalletTransaction } from '../../lib/types';
import { toast } from 'react-hot-toast';
import styles from './Wallet.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [5, 10, 20];

export default function Wallet({ isOpen, onClose }: Props) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [bal, txs] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(),
      ]);
      setBalance(bal);
      setTransactions(txs as WalletTransaction[]);
    } catch (err) {
      console.error('Wallet load error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  // Read URL params to show success message if coming back from Stripe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('recharge') === 'success') {
        toast.success('¡Recarga completada con éxito!');
        loadData();
        // remove query param
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else if (params.get('recharge') === 'cancel') {
        toast.error('Recarga cancelada');
        loadData();
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleRecharge = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Introduce una cantidad válida');
      return;
    }
    setLoading(true);
    try {
      // rechargeWallet ahora redirige a Stripe
      await rechargeWallet(amount);
    } catch (err: any) {
      toast.error(err?.message || 'Error al conectar con pago');
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  const rechargeAmount = selectedAmount || parseFloat(customAmount) || 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Monedero ORDERLY</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Balance */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>Saldo disponible</div>
            <div className={styles.balanceAmount}>
              {balance.toFixed(2)}
              <span className={styles.balanceSuffix}>€</span>
            </div>
          </div>

          {/* Recharge */}
          <div className={styles.sectionTitle}>Recargar saldo</div>
          <div className={styles.rechargeGrid}>
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                className={`${styles.rechargeBtn} ${
                  selectedAmount === amt ? styles.active : ''
                }`}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
              >
                {amt} €
              </button>
            ))}
          </div>
          <div className={styles.customRow}>
            <input
              className={styles.customInput}
              type="number"
              min="1"
              step="0.5"
              placeholder="Otra cantidad..."
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
            />
            <button
              className={styles.confirmRechargeBtn}
              disabled={loading || rechargeAmount <= 0}
              onClick={handleRecharge}
            >
              {loading ? '...' : `Recargar ${rechargeAmount > 0 ? rechargeAmount.toFixed(2) + ' €' : ''}`}
            </button>
          </div>

          {/* Transactions */}
          <div className={styles.transactions}>
            <div className={styles.sectionTitle}>Historial</div>
            {transactions.length === 0 ? (
              <div className={styles.emptyTx}>
                Aún no tienes movimientos
              </div>
            ) : (
              <div className={styles.txList}>
                {transactions.map((tx) => (
                  <div key={tx.id} className={styles.tx}>
                    <div
                      className={`${styles.txIcon} ${
                        tx.type === 'recharge' ? styles.txRecharge : styles.txPayment
                      }`}
                    >
                      {tx.type === 'recharge' ? (
                        <IoArrowDownCircleOutline size={20} />
                      ) : (
                        <IoArrowUpCircleOutline size={20} />
                      )}
                    </div>
                    <div className={styles.txInfo}>
                      <span className={styles.txDesc}>{tx.description}</span>
                      <span className={styles.txDate}>{formatDate(tx.created_at)}</span>
                    </div>
                    <span
                      className={`${styles.txAmount} ${
                        tx.type === 'recharge'
                          ? styles.txAmountPositive
                          : styles.txAmountNegative
                      }`}
                    >
                      {tx.type === 'recharge' ? '+' : '-'}
                      {tx.amount.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
