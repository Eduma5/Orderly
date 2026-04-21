import { useState, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { getTables, upsertTable, deleteTable } from '../../lib/db';
import styles from './TablesPanel.module.css';

interface TableData {
  id: string;
  number: number;
  name?: string;
  active: boolean;
}

export default function TablesPanel() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTables()
      .then((data) => setTables(data as TableData[]))
      .catch((err) => {
        console.error('Error loading tables:', err);
        toast.error('Error al cargar las mesas');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTable = async (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    try {
      await upsertTable({ id: table.id, number: table.number, active: !table.active });
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, active: !t.active } : t
        )
      );
    } catch (err) {
      console.error('Error toggling table:', err);
      toast.error('Error al cambiar estado de la mesa');
    }
  };

  const addTable = async () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;

    try {
      const newTable = await upsertTable({ number: nextNumber, active: true });
      setTables((prev) => [...prev, newTable as TableData]);
      toast.success(`Mesa ${nextNumber} añadida`);
    } catch (err) {
      console.error('Error adding table:', err);
      toast.error('Error al añadir mesa');
    }
  };

  const removeTable = async (tableId: string) => {
    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      toast.success('Mesa eliminada');
    } catch (err) {
      console.error('Error removing table:', err);
      toast.error('Error al eliminar mesa');
    }
  };

  if (loading) {
    return <div className={styles.panel}><p style={{ textAlign: 'center', padding: '2rem' }}>Cargando mesas...</p></div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.statValue}>
              {tables.filter((t) => t.active).length}
            </span>
            <span className={styles.statLabel}>Activas</span>
          </span>
          <span className={styles.stat}>
            <span className={styles.statValue}>{tables.length}</span>
            <span className={styles.statLabel}>Total</span>
          </span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addTable}>
          <IoAddOutline size={16} /> Añadir mesa
        </button>
      </div>

      <div className={styles.grid}>
        {tables.map((table) => (
          <div
            key={table.id}
            className={`${styles.table} ${
              !table.active ? styles.disabled : styles.free
            }`}
          >
            <span className={styles.tableNumber}>{table.number}</span>
            <span className={styles.tableStatus}>
              {table.active ? 'Activa' : 'Deshabilitada'}
            </span>
            <div className={styles.tableActions}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => toggleTable(table.id)}
              >
                {table.active ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => removeTable(table.id)}
                style={{ color: '#ef4444' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
