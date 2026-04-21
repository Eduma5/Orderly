import { useState } from 'react';
import { registerUser, loginUser, requestPasswordReset, resetPassword } from '../../lib/db';
import type { UserPublic } from '../../lib/types';
import styles from './AuthModal.module.css';

interface Props {
  tableNumber: number;
  onAuthenticated: (user: UserPublic) => void;
}

export default function AuthModal({ tableNumber, onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) { setError('Introduce tu nombre'); setLoading(false); return; }
        if (!email.trim()) { setError('Introduce tu email'); setLoading(false); return; }
        if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); setLoading(false); return; }
        const user = await registerUser(name.trim(), email.trim(), password);
        onAuthenticated(user);
      } else if (mode === 'login') {
        if (!email.trim()) { setError('Introduce tu email'); setLoading(false); return; }
        if (!password) { setError('Introduce tu contraseña'); setLoading(false); return; }
        const user = await loginUser(email.trim(), password);
        onAuthenticated(user);
      } else if (mode === 'forgot') {
        if (!email.trim()) { setError('Introduce tu email'); setLoading(false); return; }
        const message = await requestPasswordReset(email.trim());
        setSuccess(message);
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2500);
      } else if (mode === 'reset') {
        if (!resetCode.trim()) { setError('Introduce el código de 6 dígitos'); setLoading(false); return; }
        if (newPassword.length < 4) { setError('La nueva contraseña debe tener al menos 4 caracteres'); setLoading(false); return; }
        await resetPassword(email.trim(), resetCode.trim(), newPassword);
        setSuccess('Contraseña actualizada correctamente');
        setPassword('');
        setResetCode('');
        setNewPassword('');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guestId = `guest_${Date.now()}`;
    const guestUser: UserPublic = {
      id: guestId,
      name: 'Invitado',
      email: '',
      created_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('ema_user_id', guestId);
      localStorage.setItem('ema_user_token', `guest_${guestId}`);
    }
    onAuthenticated(guestUser);
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot' | 'reset') => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="ORDERLY" className={styles.logoImg} />
        </div>
        <p className={styles.subtitle}>
          {mode === 'forgot' || mode === 'reset' ? 'Recuperar contraseña' : 'Sistema de pedidos digital'}
        </p>

        <div className={styles.tableInfo}>
          Estás en la <strong>Mesa {tableNumber}</strong>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              Registrarse
            </button>
          </div>
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <button
            className={styles.backBtn}
            onClick={() => switchMode('login')}
            type="button"
          >
            ← Volver al inicio de sesión
          </button>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Contraseña</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Código de verificación</label>
                <input
                  className={`${styles.input} ${styles.codeInput}`}
                  type="text"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Cargando...'
              : mode === 'login'
                ? 'Entrar'
                : mode === 'register'
                  ? 'Crear cuenta'
                  : mode === 'forgot'
                    ? 'Enviar código'
                    : 'Cambiar contraseña'}
          </button>
        </form>

        {mode === 'login' && (
          <div className={styles.forgotLink}>
            <button className={styles.forgotBtn} onClick={() => switchMode('forgot')} type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {mode === 'reset' && (
          <div className={styles.forgotLink}>
            <button className={styles.forgotBtn} onClick={() => switchMode('forgot')} type="button">
              Reenviar código
            </button>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className={styles.guestLink}>
            <button className={styles.guestBtn} onClick={handleGuest} type="button">
              Continuar como invitado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
