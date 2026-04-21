import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { IoSaveOutline, IoCloudUploadOutline } from 'react-icons/io5';
import { getAdminSettings, updateAdminSetting } from '../../lib/db';
import styles from './AdminSettings.module.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error('El archivo es demasiado grande (máx. 512 KB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleChange(key, reader.result as string);
      toast.success('Imagen cargada. Pulsa Guardar para aplicar.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const keys = [
        'admin_password',
        'business_name',
        'bizum_phone',
        'base_url',
        'stripe_enabled',
        'logo_url',
        'header_url',
      ];
      for (const key of keys) {
        if (settings[key] !== undefined) {
          await updateAdminSetting(key, settings[key]);
        }
      }
      toast.success('Configuración guardada');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.panel}><p style={{ textAlign: 'center', padding: '2rem' }}>Cargando configuración...</p></div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Marca / Branding</h3>

        <div className={styles.field}>
          <label>Logo</label>
          <div className={styles.uploadRow}>
            {settings.logo_url && (
              <img
                src={settings.logo_url}
                alt="Logo"
                className={styles.previewImg}
              />
            )}
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => logoInputRef.current?.click()}
            >
              <IoCloudUploadOutline size={16} />
              Subir logo
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload('logo_url')}
            />
          </div>
          <span className={styles.hint}>Logo que aparece en la cabecera del cliente y en el login. Máx 512 KB.</span>
        </div>

        <div className={styles.field}>
          <label>Encabezado</label>
          <div className={styles.uploadRow}>
            {settings.header_url && (
              <img
                src={settings.header_url}
                alt="Encabezado"
                className={styles.previewBanner}
              />
            )}
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => headerInputRef.current?.click()}
            >
              <IoCloudUploadOutline size={16} />
              Subir encabezado
            </button>
            <input
              ref={headerInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload('header_url')}
            />
          </div>
          <span className={styles.hint}>Banner que aparece en la sección hero del menú. Máx 512 KB.</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>General</h3>
        <div className={styles.field}>
          <label>Nombre del negocio</label>
          <input
            type="text"
            value={settings.business_name || ''}
            onChange={(e) => handleChange('business_name', e.target.value)}
            placeholder="ORDERLY"
          />
        </div>
        <div className={styles.field}>
          <label>URL base de la aplicación</label>
          <input
            type="text"
            value={settings.base_url || ''}
            onChange={(e) => handleChange('base_url', e.target.value)}
            placeholder="https://tu-dominio.vercel.app"
          />
          <span className={styles.hint}>Se usa para generar los QR de las mesas</span>
        </div>
        <div className={styles.field}>
          <label>Contraseña de administración</label>
          <input
            type="text"
            value={settings.admin_password || ''}
            onChange={(e) => handleChange('admin_password', e.target.value)}
            placeholder="orderly2026"
          />
          <span className={styles.hint}>Contraseña para acceder al panel de admin</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pagos — Bizum</h3>
        <div className={styles.field}>
          <label>Teléfono Bizum</label>
          <input
            type="tel"
            value={settings.bizum_phone || ''}
            onChange={(e) => handleChange('bizum_phone', e.target.value)}
            placeholder="600 123 456"
          />
          <span className={styles.hint}>Los clientes enviarán el pago por Bizum a este número. Déjalo vacío para ocultar la opción Bizum.</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pagos — Stripe (Tarjeta)</h3>
        <div className={styles.field}>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={settings.stripe_enabled === 'true'}
              onChange={(e) => handleChange('stripe_enabled', e.target.checked ? 'true' : 'false')}
            />
            Stripe habilitado
          </label>
          <span className={styles.hint}>
            Las claves de Stripe se configuran en las variables de entorno del servidor (STRIPE_SECRET_KEY, PUBLIC_STRIPE_PUBLISHABLE_KEY).
          </span>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: '1rem' }}
        onClick={handleSave}
        disabled={saving}
      >
        <IoSaveOutline size={18} />
        {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
}
