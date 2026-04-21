# EMA — Guía de Despliegue

## 1. Configurar Supabase

### 1.1 Crear proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (nombre: `ema`, región: EU West)
3. Espera a que se provisione (~2 min)

### 1.2 Ejecutar el schema
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia todo el contenido de `supabase/schema.sql`
3. Pégalo en el editor SQL y pulsa **Run**
4. Verás que se crean: `categories`, `products`, `tables`, `orders`, `order_items`, `tickets`, `admin_settings`
5. Los datos de ejemplo (productos, categorías, mesas) se insertarán automáticamente

### 1.3 Habilitar Realtime
1. Ve a **Database → Replication**
2. Activa `orders` en la lista de tablas para Realtime

### 1.4 Obtener credenciales
1. Ve a **Settings → API**
2. Copia:
   - **Project URL** → será `PUBLIC_SUPABASE_URL`
   - **anon/public key** → será `PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Configurar variables de entorno

Edita el archivo `.env` con las credenciales reales:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (opcional, solo si quieres pagos con tarjeta online)
STRIPE_SECRET_KEY=sk_live_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URL donde estará desplegada la app
PUBLIC_APP_URL=https://tu-app.vercel.app
```

---

## 3. Desplegar en Vercel

### 3.1 Subir a GitHub
```bash
git init
git add .
git commit -m "EMA v1.0 - Sistema de pedidos QR"
git remote add origin https://github.com/tu-usuario/ema.git
git push -u origin main
```

### 3.2 Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Pulsa **Add New → Project**
3. Selecciona el repositorio `ema`
4. En **Environment Variables**, añade las mismas variables del `.env`
5. Pulsa **Deploy**
6. En ~1 minuto tendrás tu URL: `https://ema-xxxxx.vercel.app`

### 3.3 Actualizar la URL base
1. Ve al panel admin: `https://tu-url.vercel.app/admin`
2. Contraseña por defecto: `ema2026`
3. En **Ajustes**, pon la URL base de la aplicación
4. Esto hace que los QR generados apunten a la URL correcta

---

## 4. Configurar Bizum

1. En el panel admin → **Ajustes**
2. En **Teléfono Bizum**, pon el número del local (ej: `612345678`)
3. Guarda la configuración
4. Los clientes verán la opción "Bizum" al pagar y el número al que enviar el dinero

> **Nota:** Bizum funciona mostrando el número del local al cliente. El cliente abre su app de banco y envía el Bizum manualmente. No hay integración técnica con Bizum (Bizum no ofrece API pública).

---

## 5. Configurar Stripe (opcional)

Si quieres pagos con tarjeta online:

1. Crea cuenta en [stripe.com](https://stripe.com)
2. Ve a **Developers → API Keys**
3. Copia las claves y ponlas en las variables de entorno de Vercel
4. Configura un webhook apuntando a `https://tu-url.vercel.app/api/stripe/webhook`
5. En el admin → Ajustes → Habilita Stripe

---

## 6. Generar e imprimir QR

1. Ve al admin → **QR**
2. La URL base se carga automáticamente de la configuración
3. Pulsa **Imprimir todos** para imprimir las tarjetas QR de todas las mesas
4. Coloca un QR en cada mesa del local

---

## 7. Flujo de uso

### Cliente (móvil)
1. Escanea el QR de su mesa
2. Ve el menú completo con categorías
3. Añade productos al carrito
4. Elige método de pago (Bizum / Tarjeta / Efectivo)
5. Recibe ticket/recibo en "Mis Tickets"
6. Puede seguir su pedido en "Mis Pedidos"

### Administrador
1. Entra en `/admin` con la contraseña
2. Ve pedidos en tiempo real (se actualizan automáticamente)
3. Cambia estado: Pendiente → Preparando → Servido → Pagado
4. Gestiona el menú (añadir/editar/eliminar productos)
5. Ve ganancias, beneficios y estadísticas
6. Configura Bizum, mesas y ajustes generales

---

## 8. Presentar el TFG

Para la demostración:

1. Abre el panel admin en un portátil/tablet
2. Que los profesores escaneen un QR con su móvil
3. Hacen un pedido desde el móvil
4. Ves el pedido aparecer en tiempo real en el admin
5. Avanzas el estado del pedido
6. Muestras los tickets generados y las ganancias

**¡Todo funciona en tiempo real sin recargar la página!**
