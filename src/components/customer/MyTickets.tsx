import { useState, useEffect } from 'react';
import { IoCloseOutline, IoReceiptOutline, IoMailOutline, IoMailUnreadOutline } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { getMyTickets, sendTicketEmail, sendAllTicketsEmail } from '../../lib/db';
import { useUserStore } from '../../lib/store';
import styles from './MyTickets.module.css';

interface Ticket {
  id: string;
  order_id: string;
  table_number: number;
  items: { name: string; qty: number; price: number }[];
  total: number;
  payment_method: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyTickets({ isOpen, onClose }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getMyTickets()
      .then((data) => setTickets(data as Ticket[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const userEmail = user?.email || '';
  const userName = user?.name || 'Cliente';

  const handleSendOne = async (ticket: Ticket) => {
    if (!userEmail) {
      toast.error('Inicia sesión con email para enviar tickets');
      return;
    }
    setSendingId(ticket.id);
    try {
      await sendTicketEmail(userEmail, ticket);
      toast.success('📩 Ticket enviado a tu email', { duration: 3000 });
    } catch {
      toast.error('Error al enviar el ticket');
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAll = async () => {
    if (!userEmail) {
      toast.error('Inicia sesión con email para enviar tickets');
      return;
    }
    if (tickets.length === 0) return;
    setSendingAll(true);
    try {
      await sendAllTicketsEmail(userEmail, userName, tickets);
      toast.success(`📩 Resumen de ${tickets.length} tickets enviado a tu email`, { duration: 4000 });
    } catch {
      toast.error('Error al enviar el resumen');
    } finally {
      setSendingAll(false);
    }
  };

  const methodLabels: Record<string, string> = {
    bizum: 'Bizum',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Monedero',
    split: 'Dividido',
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <IoReceiptOutline size={20} /> Mis Tickets
          </h2>
          <div className={styles.headerActions}>
            {tickets.length > 0 && userEmail && (
              <button
                className={styles.sendAllBtn}
                onClick={handleSendAll}
                disabled={sendingAll}
                title="Enviar resumen completo por email"
              >
                <IoMailUnreadOutline size={16} />
                {sendingAll ? 'Enviando...' : 'Enviar todos'}
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <IoCloseOutline size={22} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Cargando tickets...</div>
          ) : tickets.length === 0 ? (
            <div className={styles.empty}>
              <IoReceiptOutline size={40} />
              <p>Aún no tienes tickets</p>
              <span>Tus recibos aparecerán aquí después de cada pedido</span>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className={styles.ticket}>
                <div className={styles.ticketHeader}>
                  <span className={styles.ticketDate}>{formatDate(ticket.created_at)}</span>
                  <div className={styles.ticketActions}>
                    <span className={styles.ticketMethod}>
                      {methodLabels[ticket.payment_method] || ticket.payment_method}
                    </span>
                    {userEmail && (
                      <button
                        className={styles.emailBtn}
                        onClick={() => handleSendOne(ticket)}
                        disabled={sendingId === ticket.id}
                        title="Enviar por email"
                      >
                        <IoMailOutline size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.ticketItems}>
                  {ticket.items.map((item, i) => (
                    <div key={i} className={styles.ticketItem}>
                      <span>{item.qty}x {item.name}</span>
                      <span>{(item.price * item.qty).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div className={styles.ticketTotal}>
                  <span>Total</span>
                  <span>{ticket.total.toFixed(2)} €</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
