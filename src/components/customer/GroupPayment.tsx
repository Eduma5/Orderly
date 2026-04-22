import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { IoCloseOutline, IoQrCodeOutline, IoCheckmarkCircle, IoPersonOutline } from 'react-icons/io5';
import { QRCodeSVG } from 'qrcode.react';
import {
  createGroupSession,
  getGroupSession,
  claimGroupItem,
  unclaimGroupItem,
  payGroupShare,
  hostPayVenue,
  getAdminSettings,
  subscribeToOrders,
} from '../../lib/db';
import { useUserStore } from '../../lib/store';
import type { Order, GroupSession, GroupItem } from '../../lib/types';
import styles from './GroupPayment.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tableNumber: number;
  unpaidOrders: Order[];
}

export default function GroupPayment({ isOpen, onClose, onComplete, tableNumber, unpaidOrders }: Props) {
  const user = useUserStore((s) => s.user);
  const [session, setSession] = useState<GroupSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payingVenue, setPayingVenue] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [step, setStep] = useState<'create' | 'qr' | 'select' | 'pay'>('create');

  const total = unpaidOrders.reduce((s, o) => s + o.total, 0);

  // Cargar base URL para QR
  useEffect(() => {
    if (isOpen) {
      getAdminSettings().then((s) => {
        setBaseUrl(s.base_url || window.location.origin);
      });
    }
  }, [isOpen]);

  // Escuchar cambios en la sesion de grupo
  const refreshSession = useCallback(async () => {
    if (!session) return;
    const updated = await getGroupSession(session.id);
    if (updated) setSession(updated);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const sub = subscribeToOrders(() => refreshSession());
    return () => sub.unsubscribe();
  }, [session, refreshSession]);

  // Crear sesion de grupo
  const handleCreate = async () => {
    if (unpaidOrders.length === 0) return;
    setCreating(true);
    try {
      const orderIds = unpaidOrders.map((o) => o.id);
      const newSession = await createGroupSession(tableNumber, orderIds);
      setSession(newSession);
      setStep('qr');
      toast.success('Grupo creado. Comparte el QR con tus amigos.');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el grupo');
    } finally {
      setCreating(false);
    }
  };

  // Reclamar/liberar un item
  const handleToggleClaim = async (item: GroupItem) => {
    if (!session || !user) return;
    try {
      let updated: GroupSession;
      if (item.claimed_by === user.id) {
        updated = await unclaimGroupItem(session.id, item.id);
      } else if (item.claimed_by === null) {
        updated = await claimGroupItem(session.id, item.id);
      } else {
        return; // Item reclamado por otro
      }
      setSession(updated);
    } catch (err: any) {
      toast.error(err.message || 'Error al seleccionar el item');
    }
  };

  // Pagar mi parte al monedero del anfitrion
  const handlePayShare = async (method: 'wallet' | 'cash_admin' | 'cash_bar') => {
    if (!session) return;
    setPaying(true);
    try {
      const updated = await payGroupShare(session.id);
      setSession(updated);
      
      if (isHost) {
        toast.success(`Tu parte (${myTotal.toFixed(2)}€) ha sido confirmada.`);
      } else {
        if (method === 'wallet') {
          toast.success('Pagado con monedero al anfitrion.');
        } else if (method === 'cash_admin') {
          toast.success('Pagas en efectivo al anfitrion.', { icon: '💵' });
        } else {
          toast.success('Pagas en efectivo al Bar directamente.', { icon: '🍺' });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al pagar');
    } finally {
      setPaying(false);
    }
  };

  // Anfitrion paga al local
  const handlePayVenue = async () => {
    if (!session) return;
    setPayingVenue(true);
    try {
      await hostPayVenue(session.id);
      toast.success('Pago completado al local. Todos los pedidos pagados.');
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Error al pagar al local');
    } finally {
      setPayingVenue(false);
    }
  };

  if (!isOpen) return null;

  const isHost = session && user && session.host_user_id === user.id;
  const myMember = session?.members.find((m) => m.user_id === user?.id);
  const allMembersPaid = session?.members.every((m) => m.paid) || false;
  const myItems = session?.items.filter((i) => i.claimed_by === user?.id) || [];
  const myTotal = myItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const unclaimedItems = session?.items.filter((i) => i.claimed_by === null) || [];
  const groupUrl = session ? `${baseUrl}/grupo/${session.id}` : '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Pago en grupo</h2>
          <button className={styles.closeBtn} onClick={onClose}><IoCloseOutline size={20} /></button>
        </div>

        {/* PASO 1: Crear grupo */}
        {step === 'create' && !session && (
          <div className={styles.createSection}>
            <div className={styles.totalCard}>
              <div className={styles.totalLabel}>Total de la mesa</div>
              <div className={styles.totalAmount}>{total.toFixed(2)} EUR</div>
            </div>

            <div className={styles.stepsGuide}>
              <div className={styles.stepGuide}>
                <span className={styles.stepNum}>1</span>
                <div>
                  <strong>Se genera un QR</strong>
                  <p>Al crear el grupo, se genera un QR unico vinculado a esta comanda.</p>
                </div>
              </div>
              <div className={styles.stepGuide}>
                <span className={styles.stepNum}>2</span>
                <div>
                  <strong>Cada comensal escanea</strong>
                  <p>Los demas escanean el QR y acceden al pedido compartido.</p>
                </div>
              </div>
              <div className={styles.stepGuide}>
                <span className={styles.stepNum}>3</span>
                <div>
                  <strong>Selecciona lo tuyo</strong>
                  <p>Cada persona marca los platos que ha consumido.</p>
                </div>
              </div>
              <div className={styles.stepGuide}>
                <span className={styles.stepNum}>4</span>
                <div>
                  <strong>Pago al anfitrion</strong>
                  <p>Cada comensal paga su parte al monedero del anfitrion.</p>
                </div>
              </div>
              <div className={styles.stepGuide}>
                <span className={styles.stepNum}>5</span>
                <div>
                  <strong>Pago al local</strong>
                  <p>El anfitrion tramita el pago total al establecimiento.</p>
                </div>
              </div>
            </div>

            <button
              className={styles.createBtn}
              onClick={handleCreate}
              disabled={creating || unpaidOrders.length === 0}
            >
              {creating ? 'Creando grupo...' : 'Crear grupo y generar QR'}
            </button>
          </div>
        )}

        {/* PASO 2: QR generado */}
        {step === 'qr' && session && (
          <div className={styles.qrSection}>
            <p className={styles.qrLabel}>Comparte este QR con los comensales de tu mesa</p>
            <div className={styles.qrContainer}>
              <QRCodeSVG
                value={groupUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0A0A0A"
                level="M"
                includeMargin
              />
            </div>
            <p className={styles.qrUrl}>{groupUrl}</p>

            <div className={styles.membersRow}>
              <IoPersonOutline size={16} />
              <span>{session.members.length} miembro{session.members.length > 1 ? 's' : ''} en el grupo</span>
            </div>

            <button
              className={styles.nextBtn}
              onClick={() => setStep('select')}
            >
              Continuar a seleccionar platos
            </button>
          </div>
        )}

        {/* PASO 3: Seleccionar platos */}
        {step === 'select' && session && (
          <div className={styles.selectSection}>
            <p className={styles.selectLabel}>Selecciona los platos que has consumido:</p>

            <div className={styles.itemsList}>
              {session.items.map((item) => {
                const isMine = item.claimed_by === user?.id;
                const isTaken = item.claimed_by !== null && !isMine;
                const claimedByName = isTaken
                  ? session.members.find((m) => m.user_id === item.claimed_by)?.name || 'Otro'
                  : null;

                return (
                  <button
                    key={item.id}
                    className={`${styles.itemCard} ${isMine ? styles.itemMine : ''} ${isTaken ? styles.itemTaken : ''}`}
                    onClick={() => handleToggleClaim(item)}
                    disabled={isTaken}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.product_name}</span>
                      <span className={styles.itemPrice}>{item.unit_price.toFixed(2)} EUR</span>
                    </div>
                    {isMine && (
                      <IoCheckmarkCircle size={20} className={styles.itemCheck} />
                    )}
                    {isTaken && claimedByName && (
                      <span className={styles.itemClaimedBy}>{claimedByName}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {unclaimedItems.length > 0 && (
              <div className={styles.warningBanner}>
                {unclaimedItems.length} plato{unclaimedItems.length > 1 ? 's' : ''} sin asignar
              </div>
            )}

            <div className={styles.myTotal}>
              <span>Tu total:</span>
              <strong>{myTotal.toFixed(2)} EUR</strong>
            </div>

            <button
              className={styles.nextBtn}
              onClick={() => setStep('pay')}
              disabled={myItems.length === 0}
            >
              Continuar al pago
            </button>
          </div>
        )}

        {/* PASO 4: Pagar */}
        {step === 'pay' && session && (
          <div className={styles.paySection}>
            <div className={styles.totalCard}>
              <div className={styles.totalLabel}>Tu parte</div>
              <div className={styles.totalAmount}>{myTotal.toFixed(2)} EUR</div>
            </div>

            {/* Lista de miembros y su estado */}
            <div className={styles.membersSection}>
              <div className={styles.sectionTitle}>Estado del grupo</div>
              {session.members.map((m) => (
                <div key={m.user_id} className={styles.memberRow}>
                  <span className={styles.memberName}>
                    {m.name}
                    {m.user_id === session.host_user_id ? ' (Anfitrion)' : ''}
                  </span>
                  <span className={styles.memberAmount}>{m.amount.toFixed(2)} EUR</span>
                  {m.paid ? (
                    <span className={styles.memberPaid}>Pagado</span>
                  ) : (
                    <span className={styles.memberPending}>Pendiente</span>
                  )}
                </div>
              ))}
            </div>

            {/* Boton pagar mi parte */}
            {!myMember?.paid && myTotal > 0 && (
                isHost ? (
                  <button
                    className={styles.payBtn}
                    onClick={() => handlePayShare('wallet')}
                    disabled={paying}
                  >
                    {paying ? 'Procesando...' : `Confirmar mi parte (${myTotal.toFixed(2)} €)`}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      className={styles.payBtn}
                      onClick={() => handlePayShare('wallet')}
                      disabled={paying}
                      style={{ marginBottom: 0 }}
                    >
                      {paying ? 'Procesando...' : `💳 ${myTotal.toFixed(2)} € al monedero del jefe`}
                    </button>
                    <button
                      className={styles.backBtn}
                      onClick={() => handlePayShare('cash_admin')}
                      disabled={paying}
                      style={{ marginBottom: 0 }}
                    >
                      💵 Pagar en efectivo al anfitrión
                    </button>
                    <button
                      className={styles.backBtn}
                      onClick={() => handlePayShare('cash_bar')}
                      disabled={paying}
                    >
                      🏠 Pagar en efectivo al Bar
                    </button>
                  </div>
                )
            {myMember?.paid && (
              <div className={styles.paidBanner}>
                Tu parte esta pagada
              </div>
            )}

            {/* Boton: anfitrion paga al local */}
            {isHost && allMembersPaid && (
              <button
                className={styles.venuePayBtn}
                onClick={handlePayVenue}
                disabled={payingVenue}
              >
                {payingVenue ? 'Procesando pago al local...' : `Pagar ${total.toFixed(2)} EUR al local`}
              </button>
            )}

            {isHost && !allMembersPaid && (
              <div className={styles.waitingBanner}>
                Esperando a que todos los miembros paguen su parte...
              </div>
            )}
          </div>
        )}

        {/* Navegacion entre pasos */}
        {session && step !== 'create' && (
          <div className={styles.stepNav}>
            {step === 'select' && (
              <button className={styles.backBtn} onClick={() => setStep('qr')}>
                Volver al QR
              </button>
            )}
            {step === 'pay' && (
              <button className={styles.backBtn} onClick={() => setStep('select')}>
                Volver a seleccionar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
