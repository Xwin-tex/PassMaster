const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const paymentRoutes = require('./routes/payments');
const { setupSocket } = require('./socket/index');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  console.error('FATAL: FRONTEND_URL environment variable is required');
  process.exit(1);
}

const io = new Server(server, { cors: { origin: FRONTEND_URL } });
app.set('io', io);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: FRONTEND_URL }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intente de nuevo en 15 minutos.' },
});
app.use('/api/auth', authLimiter);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

setupSocket(io);

const PORT = process.env.PORT || 4000;
const srv = server.listen(PORT, () => {
  console.log(`PassMaster backend running on port ${PORT}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  srv.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
