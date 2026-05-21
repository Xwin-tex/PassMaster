# PassMaster — Sistema de Ticketing y Acceso a Eventos

Plataforma web para creación de eventos, venta de boletos digitales y validación de acceso con monitoreo de aforo en tiempo real.

## Arquitectura

```
PassMaster/
├── backend/          → Node.js + Express (API REST, MVC)
├── frontend/         → React + Bootstrap 5 (SPA)
└── database/         → MySQL schema + índices
```

## Requisitos

- Node.js ≥ 18
- MySQL 8.0+
- Stripe cuenta (producción o pruebas)

## Inicio rápido

### 1. Base de datos

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # editar con credenciales reales
npm install
npm run dev             # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env    # editar con URL del backend y clave Stripe
npm install
npm start               # http://localhost:3000
```

## Despliegue

### Docker

```bash
docker compose up -d
```

Requiere archivo `.env` en la raíz del proyecto con las variables:

| Variable | Descripción |
|---|---|
| `DB_PASSWORD` | Contraseña MySQL |
| `DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Secreto para firmar tokens |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FRONTEND_URL` | URL del frontend (ej. https://tudominio.com) |

### Heroku / Railway / Render

```bash
# Backend
cd backend
heroku create passmaster-api
heroku config:set $(cat .env | grep -v ^# | xargs)
git push heroku main

# Frontend (build estático)
cd frontend
REACT_APP_API_URL=https://passmaster-api.herokuapp.com/api npm run build
# Subir ./build a cualquier host estático
```

### PM2 (servidor propio)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## API Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/auth/me` | JWT | Perfil del usuario |

### Eventos
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/events` | Opcional | Listar eventos |
| GET | `/api/events/:id` | No | Detalle del evento |
| POST | `/api/events` | Organizer | Crear evento |
| PUT | `/api/events/:id` | Organizer | Actualizar evento |

### Tickets
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/tickets/mine` | JWT | Mis tickets |
| POST | `/api/tickets/purchase` | JWT | Comprar ticket |
| GET | `/api/tickets/validate/:code` | JWT | Validar código |
| POST | `/api/tickets/checkin` | Staff | Realizar check-in |

### Pagos (Stripe)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/payments/create-payment-intent` | JWT | Crear PaymentIntent |
| POST | `/api/payments/webhook` | No | Webhook Stripe |

## Stack técnico

- **Backend:** Node.js, Express, JWT, bcrypt, Socket.IO, Stripe, MySQL2
- **Frontend:** React 18, Bootstrap 5, Axios, Socket.IO Client, Recharts
- **Seguridad:** Helmet, rate-limiting, CORS, body-size limits, graceful shutdown
- **Base de datos:** MySQL 8 con charset utf8mb4, índices compuestos

## Licencia

MIT
