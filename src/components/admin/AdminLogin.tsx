import { useState } from 'react';
import { IoLockClosedOutline } from 'react-icons/io5';
import { getAdminSettings } from '../../lib/db';
import styles from './AdminLogin.module.css';

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const settings = await getAdminSettings();
      const adminPassword = settings.admin_password || 'orderly2026';

      if (password === adminPassword) {
        localStorage.setItem('ema_admin', 'true');
        onLogin();
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback si no hay conexión a Supabase
      if (password === 'orderly2026') {
        localStorage.setItem('ema_admin', 'true');
        onLogin();
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.iconWrap}>
          <IoLockClosedOutline size={28} />
        </div>
        <h1 className={styles.title}>Panel de Administración</h1>
        <p className={styles.subtitle}>ORDERLY</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Contraseña</label>
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-lg ${styles.submitBtn}`}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
