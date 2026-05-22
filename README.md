# PassMaster — Sistema de Ticketing y Control de Acceso a Eventos

Plataforma web para creación de eventos, venta de boletos digitales con código QR,
validación de acceso y monitoreo de aforo en tiempo real.

**Frontend:** https://pass-master-beta.vercel.app  
**Backend:** https://passmaster-production.up.railway.app  
**Repositorio:** https://github.com/Xwin-tex/PassMaster

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React + Vite | React 18, Vite 5 |
| **UI** | Bootstrap 5, CSS3 (animaciones, dark mode) | 5.3.3 |
| **Backend** | Node.js + Express | Node 20+, Express 4 |
| **Base de datos** | MySQL | 8.0+ (Railway MySQL / Docker) |
| **Autenticación** | JWT + bcryptjs | jsonwebtoken 9 |
| **Pagos** | Stripe | API 2024 |
| **Tiempo real** | Socket.IO | 4.7 |
| **QR** | qrcode.react | 4.2 |
| **Gráficos** | Recharts | 2.12 |
| **Email** | Nodemailer | 8.0 (Ethereal dev, SMTP prod) |
| **Despliegue** | Vercel (frontend) + Railway (backend + MySQL) | — |
| **Contenedores** | Docker / docker-compose | — |

---

## Arquitectura (MVC)

```
PassMaster/
├── backend/                    # API REST — Express MVC
│   ├── config/                 # Conexión DB, Stripe, auto-migración
│   ├── controllers/            # Lógica de negocio (auth, events, tickets, payments, admin)
│   ├── middlewares/            # JWT auth, role authorization, error handler
│   ├── models/                 # Capa de datos (pool.execute)
│   ├── routes/                 # Definición de rutas REST
│   ├── socket/                 # WebSocket (capacidad en tiempo real)
│   ├── utils/                  # Generación de códigos, mailer
│   ├── server.js               # Entry point
│   └── Procfile                # Railway start command
│
├── frontend/                   # SPA — React + Vite
│   ├── src/
│   │   ├── components/         # Navbar, CapacityGauge, ProtectedRoute, TicketQR
│   │   ├── context/            # AuthContext (login/logout/token management)
│   │   ├── pages/              # 13 páginas (Login, Register, Dashboard, Events, etc.)
│   │   ├── services/           # api.jsx (axios instance), socket.jsx (Socket.IO client)
│   │   └── styles/             # theme.css (colores, animaciones, dark mode, responsive)
│   └── index.html
│
├── database/
│   └── schema.sql              # Esquema MySQL completo
│
├── docker-compose.yml          # Desarrollo local con MySQL + Backend
├── Dockerfile                  # Backend container image
├── ecosystem.config.js         # PM2 cluster mode
├── .nvmrc                      # Node 20
└── README.md
```

---

## Base de Datos — Esquema

4 tablas con índices compuestos, foreign keys, charset utf8mb4:

### `users`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | INT PK | Auto-increment |
| name | VARCHAR(255) | Nombre completo |
| email | VARCHAR(255) UNIQUE | Email de acceso |
| password | VARCHAR(255) | Hash bcrypt |
| role | ENUM('admin','organizer','staff','buyer') | Rol de usuario |
| reset_token | VARCHAR(255) NULL | Token para reset de contraseña |
| reset_token_expires | DATETIME NULL | Expiración del token |
| created_at | TIMESTAMP | Fecha de registro |

### `events`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | INT PK | Auto-increment |
| organizer_id | INT FK → users.id | Creador del evento |
| name | VARCHAR(255) | Nombre del evento |
| description | TEXT | Descripción |
| date | DATETIME | Fecha y hora |
| location | VARCHAR(255) | Ubicación |
| capacity | INT | Aforo total |
| ticket_price | DECIMAL(10,2) | Precio del boleto |
| status | ENUM('draft','published','cancelled','completed') | Estado |
| media | JSON NULL | Array de {type, url} para imágenes/videos |
| created_at | TIMESTAMP | Fecha de creación |

### `tickets`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | INT PK | Auto-increment |
| event_id | INT FK → events.id | Evento asociado |
| buyer_id | INT FK → users.id | Comprador |
| unique_code | VARCHAR(36) UNIQUE | Código único QR |
| status | ENUM('active','used','cancelled','refunded') | Estado del boleto |
| purchase_date | TIMESTAMP | Fecha de compra |
| checked_in_at | TIMESTAMP NULL | Fecha de check-in |
| checked_in_by | INT FK → users.id NULL | Staff que realizó check-in |

### `transactions`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | INT PK | Auto-increment |
| ticket_id | INT FK → tickets.id | Boleto asociado |
| buyer_id | INT FK → users.id | Comprador |
| amount | DECIMAL(10,2) | Monto |
| payment_method | VARCHAR(50) | Método de pago |
| payment_status | ENUM('pending','completed','failed','refunded') | Estado |
| payment_id | VARCHAR(255) | ID de Stripe |
| created_at | TIMESTAMP | Fecha de transacción |

### Auto-migración
Al iniciar, el backend verifica si la tabla `events` existe. Si no, ejecuta
automáticamente el schema completo desde `config/db.js`. También agrega
columnas nuevas (ej. `media` JSON) si no existen.

---

## API REST — Endpoints

### Autenticación (`/api/auth`)
| Método | Ruta | Auth | Body | Respuesta |
|--------|------|------|------|-----------|
| POST | `/register` | No | `{name, email, password, role?}` | `{token, user}` |
| POST | `/login` | No | `{email, password}` | `{token, user}` |
| GET | `/me` | JWT | — | `{user}` |
| PUT | `/profile` | JWT | `{name?, email?, currentPassword?, newPassword?}` | `{user, token}` |
| POST | `/forgot-password` | No | `{email}` | `{message}` |
| POST | `/reset-password` | No | `{token, password}` | `{message}` |

### Eventos (`/api/events`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Opcional | Listar eventos (filtros: `status`, `search`) |
| GET | `/:id` | No | Detalle del evento con `sold` count |
| POST | `/` | organizer/admin | Crear evento |
| PUT | `/:id` | organizer/admin | Actualizar evento |
| PUT | `/:id/media` | organizer/admin | Actualizar galería media |
| GET | `/:id/tickets` | JWT | Tickets vendidos del evento |

### Tickets (`/api/tickets`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/mine` | JWT | Tickets del usuario autenticado |
| POST | `/purchase` | JWT | Comprar ticket(s) |
| GET | `/validate/:code` | JWT | Validar código QR |
| POST | `/checkin` | staff/organizer/admin | Realizar check-in |
| POST | `/transfer` | JWT | Transferir ticket a otro email |

### Pagos (`/api/payments`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/create-payment-intent` | JWT | Crear intent de pago Stripe |
| POST | `/webhook` | No (raw body) | Webhook de Stripe |
| POST | `/refund` | JWT | Reembolsar ticket |

### Admin (`/api/admin`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users` | admin | Listar todos los usuarios |
| PUT | `/users/:id/role` | admin | Cambiar rol de usuario |

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check `→ {status: "ok"}` |

---

## Frontend — Páginas y Rutas

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/login` | Login | Público | Inicio de sesión |
| `/register` | Register | Público | Registro de usuario |
| `/forgot-password` | ForgotPassword | Público | Solicitar reset de contraseña |
| `/reset-password/:token` | ResetPassword | Público | Resetear contraseña con token |
| `/` | Dashboard | Protegido | Panel principal con estadísticas |
| `/events` | Events | Público | Lista de eventos publicados |
| `/events/new` | CreateEvent | organizer/admin | Crear nuevo evento |
| `/events/:id` | EventDetail | Público | Detalle y compra de boletos |
| `/checkin` | CheckIn | staff/organizer/admin | Validar códigos QR |
| `/my-tickets` | MyTickets | Protegido | Boletos comprados |
| `/profile` | Profile | Protegido | Editar perfil y contraseña |
| `/admin` | Admin | admin | Gestión de usuarios |

**HashRouter** — Todas las rutas usan `/#/` para compatibilidad con deploy
estático en Vercel.

**AuthContext** — Provee estado global de autenticación: token en localStorage,
fetch de perfil al cargar, refresh on mount.

**ProtectedRoute** — Componente envolvente que redirige a `/login` si no hay
sesión activa, con soporte para `roles` opcionales.

---

## Flujo de Compra (Stripe)

1. Usuario selecciona cantidad en `EventDetail` y hace clic en "Comprar"
2. Frontend llama a `POST /api/payments/create-payment-intent` con `{event_id, quantity}`
3. Backend devuelve `clientSecret`
4. Frontend usa `@stripe/react-stripe-js` para mostrar el formulario de pago
5. Stripe procesa el pago → `paymentIntent` confirmado
6. Webhook `POST /api/payments/webhook` recibe `payment_intent.succeeded`
7. Backend actualiza transacción a `completed` y genera ticket con código QR único
8. Email de confirmación enviado al comprador via Nodemailer

---

## Funcionalidades Clave

- **QR Codes** — Cada boleto tiene un código SHA-256 único de 36 caracteres
- **Dark Mode** — Tema oscuro/claro con persistencia en localStorage
- **Tiempo Real** — Socket.IO actualiza capacidad disponible en todas las vistas
- **Aforo** — Gauge visual con actualización en vivo
- **Transferencia** — Transferir boletos a otro usuario por email
- **Reembolso** — Stripe refund con actualización de estado
- **Impresión** — window.print() como alternativa PDF
- **Búsqueda** — Filtro de eventos por nombre, ubicación o descripción
- **Galería Media** — El organizador puede agregar imágenes y videos (YouTube) al evento
- **Reset de Contraseña** — Flujo completo con email y token temporal
- **Roles** — admin, organizer, staff, buyer con permisos diferenciados
- **Auto-migración** — Tablas creadas automáticamente al iniciar
- **Rate Limiting** — 20 requests / 15 min en rutas de auth
- **Seguridad** — Helmet, compression, body size limit 10kb, CORS, graceful shutdown

---

## Variables de Entorno

### Backend (Railway / .env)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `FRONTEND_URL` | **Sí** | URL exacta del frontend (CORS) |
| `JWT_SECRET` | **Sí** | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | No | Duración del token (default: 7d) |
| — | — | **Base de datos (Railway MySQL plugin)** |
| `MYSQL_HOST` | Auto | `mysql.railway.internal` |
| `MYSQL_PORT` | Auto | `3306` |
| `MYSQL_USER` | Auto | `root` |
| `MYSQL_PASSWORD` | Auto | Password del plugin |
| `MYSQL_DATABASE` | Auto | `railway` |
| — | — | **Stripe (opcional para desarrollo)** |
| `STRIPE_SECRET_KEY` | No | Stripe API secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| — | — | **Email (opcional)** |
| `SMTP_HOST` | No | Servidor SMTP |
| `SMTP_PORT` | No | Puerto SMTP |
| `SMTP_USER` | No | Usuario SMTP |
| `SMTP_PASS` | No | Contraseña SMTP |

### Frontend (Vercel / .env)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_API_URL` | **Sí** | URL del backend `/api` |
| `VITE_SOCKET_URL` | **Sí** | URL del backend para Socket.IO |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (pk_test_...) |

---

## Despliegue

### Railway (Backend + MySQL)

1. Crear proyecto en [Railway](https://railway.app)
2. Agregar servicio **GitHub** → seleccionar `Xwin-tex/PassMaster`
3. Configurar **Root Directory** → `/backend`
4. Agregar servicio **MySQL** → Railway inyecta automáticamente `MYSQL_HOST`,
   `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
5. Conectar MySQL al servicio backend (drag para enlazar o Add Reference en Variables)
6. Agregar variables manuales: `FRONTEND_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
   `STRIPE_SECRET_KEY` (opcional), `STRIPE_WEBHOOK_SECRET` (opcional)
7. Railway despliega automáticamente con cada push a `main`
8. El backend escucha en `0.0.0.0:$PORT` y Railway expone en
   `https://passmaster-production.up.railway.app`

### Vercel (Frontend)

```bash
cd frontend
npx vercel --prod
```

O conectando el repositorio a [Vercel](https://vercel.com):

1. Importar `Xwin-tex/PassMaster`
2. Root Directory: dejar vacío (la raíz del repo)
3. Build Command: `cd frontend && npm run build`
4. Output Directory: `frontend/dist`
5. Variables: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

Las variables `VITE_*` se hornean en el build — cualquier cambio requiere
redeploy.

### Docker (Desarrollo Local)

```bash
docker compose up -d
```

Requiere archivo `.env` en la raíz con `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`,
`FRONTEND_URL`.

### PM2 (Servidor Propio)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

---

## Desarrollo Local

### 1. Base de datos

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con credenciales locales
npm install
npm run dev    # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Editar .env con VITE_API_URL=http://localhost:4000/api
npm install
npm run dev    # http://localhost:5173
```

---

## Tiempo Real (Socket.IO)

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `event:join` | Cliente → Servidor | Unirse a sala del evento |
| `event:leave` | Cliente → Servidor | Salir de sala del evento |
| `capacity:update` | Servidor → Clientes | Actualización de aforo (`{eventId, sold}`) |

El servidor notifica a todos los clientes en la sala cuando un boleto es
comprado, actualizando el gauge de capacidad en tiempo real.

---

## Seguridad

- **Helmet** — Headers HTTP seguros
- **CORS** — Solo el origen definido en `FRONTEND_URL`
- **Rate Limiting** — 20 requests / 15 min en rutas `/api/auth`
- **Body Limit** — 10kb máximo en requests JSON
- **bcrypt** — Hash de contraseñas con salt
- **JWT** — Tokens con expiración, verificación en cada request
- **Graceful Shutdown** — SIGTERM/SIGINT cierran conexiones limpiamente
- **Stripe Webhook** — Raw body con verificación de firma
- **SQL Injection** — Prepared statements (mysql2/promise)
- **XSS** — Helmet + React sanitización por defecto
