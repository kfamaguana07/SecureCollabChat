# Backend Integration Example

Este archivo proporciona ejemplos de cómo estructurar el backend para que funcione con el frontend.

## 📋 Estructura Recomendada del Backend

```
backend/
├── src/
│   ├── routes/
│   │   ├── admin.js          # Rutas de admin
│   │   └── salas.js          # Rutas de salas/usuarios
│   ├── controllers/
│   │   ├── adminController.js
│   │   └── salaController.js
│   ├── middleware/
│   │   ├── auth.js           # Verificar JWT
│   │   └── validation.js     # Validar entrada
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Sala.js
│   │   ├── Mensaje.js
│   │   ├── Usuario.js
│   │   └── Sesion.js
│   ├── services/
│   │   └── socketService.js  # Lógica de Socket.io
│   ├── app.js                # App Express
│   └── server.js             # Server Socket.io
└── package.json
```

## 🔧 Ejemplo: server.js

```javascript
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://tudominio.com'],
  credentials: true
}));

// Middleware
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key';

// Rutas
app.post('/api/admin/login', require('./routes/admin'));
app.get('/api/admin/rooms', verifyToken, require('./routes/admin'));
app.post('/api/admin/rooms', verifyToken, require('./routes/admin'));
app.post('/api/salas/:roomId/join', require('./routes/salas'));

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true
  }
});

// Mapear salas activas
const activeRooms = new Map();
const activeSessions = new Map(); // IP -> sessionId

// Socket Events
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a sala
  socket.on('joinRoom', (data) => {
    const { roomId, nickname, userId } = data;
    
    // Validar sesión única
    const clientIp = socket.handshake.address;
    if (activeSessions.has(clientIp)) {
      socket.emit('roomError', { 
        message: 'Ya existe una sesión activa en este dispositivo' 
      });
      return;
    }

    // Agregar a sala
    socket.join(roomId);
    activeSessions.set(clientIp, { roomId, userId });

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, []);
    }
    activeRooms.get(roomId).push({ socketId: socket.id, userId, nickname });

    // Notificar
    io.to(roomId).emit('userJoined', { userId, nickname });
    io.to(roomId).emit('roomUsersUpdate', 
      activeRooms.get(roomId).map(u => ({
        userId: u.userId,
        nickname: u.nickname
      }))
    );
  });

  // Recibir mensaje
  socket.on('sendMessage', async (data) => {
    const { roomId, message, messageType, timestamp } = data;
    
    // Guardar en BD
    // const savedMessage = await Mensaje.create({...});
    
    // Emitir a sala
    io.to(roomId).emit('receiveMessage', {
      userId: socket.data.userId,
      nickname: socket.data.nickname,
      message,
      type: messageType,
      timestamp
    });
  });

  // Desconectar
  socket.on('disconnect', () => {
    const clientIp = socket.handshake.address;
    const session = activeSessions.get(clientIp);
    
    if (session) {
      const users = activeRooms.get(session.roomId);
      if (users) {
        const index = users.findIndex(u => u.socketId === socket.id);
        if (index > -1) {
          const user = users.splice(index, 1)[0];
          io.to(session.roomId).emit('userLeft', {
            userId: user.userId,
            nickname: user.nickname
          });
        }
      }
      activeSessions.delete(clientIp);
    }
  });
});

// Verificar JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 🔑 Ejemplo: Login Admin

```javascript
// routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key';

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar credenciales (comparar con BD)
    // const admin = await Admin.findOne({ username });
    // if (!admin || !admin.checkPassword(password)) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    // Generar JWT
    const token = jwt.sign(
      { id: 'admin_id', username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: { id: 'admin_id', username, email: 'admin@example.com' },
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🚪 Ejemplo: Join Room

```javascript
// routes/salas.js
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { pin } = req.body;

    // Obtener sala
    // const sala = await Sala.findById(roomId);
    // if (!sala) {
    //   return res.status(404).json({ error: 'Room not found' });
    // }

    // Validar PIN
    // if (sala.pin !== parseInt(pin)) {
    //   return res.status(401).json({ error: 'Invalid PIN' });
    // }

    // Validar sesión única (por IP)
    const clientIp = req.ip;
    // if (await Sesion.findOne({ ip: clientIp, active: true })) {
    //   return res.status(409).json({ error: 'Active session' });
    // }

    // Crear sesión
    const userId = 'user_' + Date.now();
    // await Sesion.create({ ip: clientIp, roomId, userId, active: true });

    res.json({
      success: true,
      userId,
      roomType: 'Multimedia',
      roomName: 'Test Room'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 📤 Ejemplo: Upload Archivo

```javascript
router.post('/:roomId/upload', async (req, res) => {
  try {
    const { roomId } = req.params;
    const file = req.files.file;
    const { nickname } = req.body;

    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large' });
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(415).json({ error: 'Invalid file type' });
    }

    // Guardar archivo
    const filename = `${Date.now()}_${file.name}`;
    // await file.mv(`./uploads/${filename}`);

    // Guardar en BD
    // await Archivo.create({
    //   roomId,
    //   filename,
    //   originalName: file.name,
    //   uploader: nickname,
    //   size: file.size
    // });

    // Emitir evento via Socket.io
    // io.to(roomId).emit('receiveFile', {
    //   fileUrl: `/uploads/${filename}`,
    //   fileName: file.name,
    //   uploader: nickname
    // });

    res.json({
      success: true,
      fileUrl: `/uploads/${filename}`,
      fileName: file.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📋 Checklist de Implementación

### Antes de conectar frontend:

- [ ] Servidor Express corriendo en puerto 3000
- [ ] Socket.io configurado
- [ ] CORS habilitado para http://localhost:5173
- [ ] POST /api/admin/login funcionando
- [ ] GET/POST /api/admin/rooms funcionando
- [ ] POST /api/salas/:id/join funcionando
- [ ] Socket 'joinRoom' emitiendo usuarios
- [ ] Socket 'receiveMessage' funcionando
- [ ] Validación de PIN en backend
- [ ] Validación de nickname único
- [ ] Validación de sesión única

### Variables de Entorno Backend

```env
PORT=3000
JWT_SECRET=your_secret_key
DB_URL=mongodb://localhost:27017/securecollabchat
NODE_ENV=development
```

## 🧪 Pruebas Rápidas

### Con cURL:

```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Unirse a sala
curl -X POST http://localhost:3000/api/salas/sala-1/join \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

### Con Postman:

1. Importar endpoints en Postman
2. Configurar variables de entorno
3. Ejecutar en orden: Login → Create Room → Join Room

## 📊 Base de Datos

### Ejemplo - MongoDB

```javascript
// models/Sala.js
const salaSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: String,
  pin: Number,
  type: { type: String, enum: ['Texto', 'Multimedia'] },
  description: String,
  adminId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// models/Mensaje.js
const mensajeSchema = new mongoose.Schema({
  roomId: String,
  userId: String,
  nickname: String,
  message: String,
  type: { type: String, enum: ['text', 'file', 'system'] },
  fileUrl: String,
  createdAt: { type: Date, default: Date.now }
});

// models/Sesion.js
const sesionSchema = new mongoose.Schema({
  ip: String,
  roomId: String,
  userId: String,
  active: Boolean,
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24h TTL
});
```

## 🎯 Próximos Pasos

1. Implementar los endpoints según este ejemplo
2. Configurar Socket.io correctamente
3. Guardar mensajes en BD
4. Implementar autenticación JWT
5. Agregar validaciones robustas
6. Hacer testing completo con frontend

---

Ver [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) para guía completa.
