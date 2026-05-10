require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const adminRouter = require('./routers/adminRouter');
const salaRouter = require('./routers/salaRouter');
const { configurarSockets } = require('./socketHandler');
const sequelize = require('./config/database');
require('./models'); // Cargar modelos y asociaciones

const app = express();
const server = http.createServer(app);

// ── Socket.io ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ── Middlewares ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos estáticamente
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Rutas REST ──────────────────────────────────────────
app.use('/api/admin', adminRouter);
app.use('/api/salas', salaRouter);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── WebSockets ──────────────────────────────────────────
configurarSockets(io);

// ── Sincronizar DB e iniciar servidor ───────────────────
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false })
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`WebSocket listo en ws://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la DB:', err);
    process.exit(1);
  });

module.exports = { app, server, io };