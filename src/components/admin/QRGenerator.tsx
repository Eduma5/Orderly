import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IoDownloadOutline, IoPrintOutline } from 'react-icons/io5';
import { getAdminSettings, getTables } from '../../lib/db';
import styles from './QRGenerator.module.css';

export default function QRGenerator() {
  const [baseUrl, setBaseUrl] = useState('');
  const [tableCount, setTableCount] = useState(10);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [settings, tables] = await Promise.all([getAdminSettings(), getTables()]);
        setBaseUrl(settings.base_url || window.location.origin);
        setTableCount(tables.length || 10);
      } catch {
        setBaseUrl(window.location.origin);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);
  const getUrl = (table: number) => `${baseUrl}/mesa/${table}`;

  const handlePrintAll = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ORDERLY</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; }
            .page { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 2rem; 
              padding: 2rem;
            }
            .qr-card { 
              text-align: center; 
              padding: 1.5rem; 
              border: 2px solid #e5e7eb; 
              border-radius: 12px;
              page-break-inside: avoid;
            }
            .qr-card h3 { 
              font-size: 1.25rem; 
              margin-bottom: 0.75rem; 
              color: #0A0A0A;
            }
            .qr-card p { 
              font-size: 0.875rem; 
              color: #6b7280; 
              margin-top: 0.75rem;
            }
            .brand { 
              font-size: 0.75rem; 
              color: #9ca3af; 
              margin-top: 0.25rem;
            }
            @media print {
              .page { gap: 1.5rem; padding: 1rem; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadSVG = (table: number) => {
    const svg = document.getElementById(`qr-${table}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orderly-mesa-${table}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className={styles.panel}><p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p></div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.config}>
        <div className={styles.field}>
          <label>URL base de la aplicación</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://tu-dominio.com"
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label>Número de mesas</label>
          <input
            type="number"
            min="1"
            max="100"
            value={tableCount}
            onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
            className={styles.input}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handlePrintAll}>
          <IoPrintOutline size={16} /> Imprimir todos
        </button>
      </div>

      <div className={styles.grid}>
        {tables.map((table) => (
          <div
            key={table}
            className={`${styles.qrCard} ${selectedTable === table ? styles.selected : ''}`}
            onClick={() => setSelectedTable(selectedTable === table ? null : table)}
          >
            <h3 className={styles.qrTitle}>Mesa {table}</h3>
            <div className={styles.qrWrap}>
              <QRCodeSVG
                id={`qr-${table}`}
                value={getUrl(table)}
                size={160}
                level="M"
                includeMargin
                bgColor="transparent"
                fgColor="#0A0A0A"
              />
            </div>
            <p className={styles.qrUrl}>{getUrl(table)}</p>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.5rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSVG(table);
              }}
            >
              <IoDownloadOutline size={14} /> Descargar
            </button>
          </div>
        ))}
      </div>

      {/* Hidden print content */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div className="page">
          {tables.map((table) => (
            <div key={table} className="qr-card">
              <h3>Mesa {table}</h3>
              <QRCodeSVG
                value={getUrl(table)}
                size={200}
                level="M"
                includeMargin
                bgColor="transparent"
                fgColor="#0A0A0A"
              />
              <p>Escanea para ver el menú</p>
              <p className="brand">ORDERLY</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
