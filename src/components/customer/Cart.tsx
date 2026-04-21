import { useState } from 'react';
import { useCartStore } from '../../lib/store';
import { IoClose, IoAdd, IoRemove, IoTrashOutline, IoSendOutline } from 'react-icons/io5';
import styles from './Cart.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  sending?: boolean;
}

export default function Cart({ isOpen, onClose, onCheckout, sending }: Props) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateNotes = useCartStore((s) => s.updateNotes);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);

  const total = getTotal();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tu pedido</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Tu carrito está vacío</p>
            <span>Añade productos desde el menú</span>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.product.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product.name}</span>
                    <span className={styles.itemPrice}>
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        {item.quantity === 1 ? (
                          <IoTrashOutline size={14} />
                        ) : (
                          <IoRemove size={14} />
                        )}
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        <IoAdd size={14} />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    className={styles.notes}
                    placeholder="Notas (sin hielo, extra leche...)"
                    value={item.notes || ''}
                    onChange={(e) =>
                      updateNotes(item.product.id, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button className={styles.clearBtn} onClick={clearCart}>
                Vaciar carrito
              </button>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>{total.toFixed(2)} €</span>
              </div>
              <button
                className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}
                onClick={onCheckout}
                disabled={sending}
              >
                <IoSendOutline size={18} />
                {sending ? 'Enviando...' : 'Hacer pedido'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
