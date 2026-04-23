import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { IoCheckmarkCircle, IoPersonOutline } from 'react-icons/io5';
import {
  getGroupSession,
  joinGroupSession,
  claimGroupItem,
  unclaimGroupItem,
  payGroupShare,
  getCurrentUser,
  subscribeToOrders,
} from '../../lib/db';
import { useUserStore } from '../../lib/store';
import type { GroupSession, GroupItem, UserPublic } from '../../lib/types';
import AuthModal from './AuthModal';
import styles from './GroupJoinApp.module.css';

interface Props {
  sessionId: string;
}

export default function GroupJoinApp({ sessionId }: Props) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const userLoading = useUserStore((s) => s.loading);
  const setUserLoading = useUserStore((s) => s.setLoading);

  const [session, setSession] = useState<GroupSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState<'join' | 'select' | 'pay'>('join');

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const existing = await getCurrentUser();
        if (existing) setUser(existing);
      } catch { /* ignore */ }
      setUserLoading(false);
    }
    checkAuth();
  }, [setUser, setUserLoading]);

  // Load session
  const loadSession = useCallback(async () => {
    try {
      const s = await getGroupSession(sessionId);
      if (!s) {
        setError('Sesion de grupo no encontrada');
        return;
      }
      setSession(s);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la sesion');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (user) loadSession();
  }, [user, loadSession]);

  // Real-time updates
  useEffect(() => {
    if (!session) return;
    const sub = subscribeToOrders(() => loadSession());
    return () => sub.unsubscribe();
  }, [session, loadSession]);

  // Join group
  const handleJoin = async () => {
    setJoining(true);
    try {
      const updated = await joinGroupSession(sessionId);
      setSession(updated);
      setStep('select');
      toast.success('Te has unido al grupo.');
    } catch (err: any) {
      toast.error(err.message || 'Error al unirse');
    } finally {
      setJoining(false);
    }
  };

  // Toggle claim item
  const handleToggleClaim = async (item: GroupItem) => {
    if (!session || !user) return;
    try {
      let updated: GroupSession;
      if (item.claimed_by === user.id) {
        updated = await unclaimGroupItem(session.id, item.id);
      } else if (item.claimed_by === null) {
        updated = await claimGroupItem(session.id, item.id);
      } else {
        return;
      }
      setSession(updated);
    } catch (err: any) {
      toast.error(err.message || 'Error al seleccionar');
    }
  };

  // Pay share
  const handlePayShare = async (method: 'wallet' | 'cash_admin' | 'cash_bar') => {
    if (!session) return;
    setPaying(true);
    try {
      const updated = await payGroupShare(session.id, method);
      setSession(updated);
      
      if (method === 'wallet') {
        toast.success('Pagado con monedero al anfitrion.');
      } else if (method === 'cash_admin') {
        toast.success('Pagas en efectivo al anfitrion.', { icon: '💵' });
      } else {
        toast.success('Pagas en efectivo al Bar directamente.', { icon: '🍺' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al pagar');
    } finally {
      setPaying(false);
    }
  };

  // Auth gate
  if (userLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.app}>
        <Toaster position="top-center" />
        <AuthModal
          tableNumber={0}
          onAuthenticated={(u: UserPublic) => {
            setUser(u);
            toast.success(`Hola ${u.name}!`);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p>Cargando grupo...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={styles.app}>
        <div className={styles.errorScreen}>
          <h2>Error</h2>
          <p>{error || 'Sesion no encontrada'}</p>
        </div>
      </div>
    );
  }

  const isMember = session.members.some((m) => m.user_id === user.id);
  const myMember = session.members.find((m) => m.user_id === user.id);
  const isHost = session.host_user_id === user.id;
  const myItems = session.items.filter((i) => i.claimed_by === user.id);
  const myTotal = myItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const totalGroup = session.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  return (
    <div className={styles.app}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#0A0A0A',
            color: '#fff',
            fontSize: '0.875rem',
          },
        }}
      />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pago en grupo</h1>
          <p className={styles.subtitle}>Mesa {session.table_number} - Anfitrion: {session.host_name}</p>
        </div>

        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total del pedido</div>
          <div className={styles.totalAmount}>{totalGroup.toFixed(2)} EUR</div>
          <div className={styles.membersCount}>
            <IoPersonOutline size={14} />
            {session.members.length} miembro{session.members.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Step: Join */}
        {!isMember && step === 'join' && (
          <div className={styles.joinSection}>
            <p>Unete al grupo para seleccionar los platos que has consumido y pagar tu parte.</p>
            <button
              className={styles.joinBtn}
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? 'Uniendose...' : 'Unirme al grupo'}
            </button>
          </div>
        )}

        {/* Step: Select items */}
        {(isMember || step === 'select') && step !== 'pay' && (
          <div className={styles.selectSection}>
            <h3 className={styles.sectionTitle}>Selecciona tus platos</h3>
            <div className={styles.itemsList}>
              {session.items.map((item) => {
                const isMine = item.claimed_by === user.id;
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
                    {isMine && <IoCheckmarkCircle size={20} className={styles.itemCheck} />}
                    {isTaken && claimedByName && (
                      <span className={styles.itemClaimedBy}>{claimedByName}</span>
                    )}
                  </button>
                );
              })}
            </div>

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

        {/* Step: Pay */}
        {step === 'pay' && (
          <div className={styles.paySection}>
            <div className={styles.myTotalBig}>
              <div className={styles.totalLabel}>Tu parte</div>
              <div className={styles.totalAmount}>{myTotal.toFixed(2)} EUR</div>
            </div>

            <h3 className={styles.sectionTitle}>Tus platos</h3>
            <div className={styles.myItemsList}>
              {myItems.map((item) => (
                <div key={item.id} className={styles.myItemRow}>
                  <span>{item.product_name}</span>
                  <span>{item.unit_price.toFixed(2)} EUR</span>
                </div>
              ))}
            </div>

            {!myMember?.paid ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  className={styles.payBtn}
                  onClick={() => handlePayShare('wallet')}
                  disabled={paying || myTotal <= 0}
                  style={{ marginBottom: 0 }}
                >
                  {paying ? 'Procesando...' : `💳 ${myTotal.toFixed(2)} € al monedero del jefe`}
                </button>
                <button
                  className={styles.backBtn}
                  onClick={() => handlePayShare('cash_admin')}
                  disabled={paying || myTotal <= 0}
                  style={{ marginBottom: 0 }}
                >
                  💵 Pagar en efectivo al anfitrión
                </button>
                <button
                  className={styles.backBtn}
                  onClick={() => handlePayShare('cash_bar')}
                  disabled={paying || myTotal <= 0}
                >
                  🏠 Pagar en efectivo al Bar
                </button>
              </div>
            ) : (
              <div className={styles.paidBanner}>Tu parte esta pagada</div>
            )}

            <button
              className={styles.backBtn}
              onClick={() => setStep('select')}
              style={{ borderStyle: 'dashed' }}
            >
              Volver a seleccionar platos
            </button>
          </div>
        )}

        {/* Session completed */}
        {session.status === 'completed' && (
          <div className={styles.completedBanner}>
            Todos los pagos completados. Gracias!
          </div>
        )}
      </div>
    </div>
  );
}
