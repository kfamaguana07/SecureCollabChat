# Guía de Integración Frontend-Backend

## 📋 Requisitos de API REST

El frontend espera los siguientes endpoints del backend:

### Admin - Autenticación
```
POST /api/admin/login
- Body: { username, password }
- Response: { token, admin: { id, username, email }, success: true }
```

### Admin - Gestión de Salas
```
POST /api/admin/rooms
- Headers: Authorization: Bearer {token}
- Body: { id, name, pin, type, description }
- Response: { room: { id, name, pin, type, description, createdAt }, success: true }

GET /api/admin/rooms
- Headers: Authorization: Bearer {token}
- Response: { rooms: [], success: true }

GET /api/admin/rooms/:roomId
- Headers: Authorization: Bearer {token}
- Response: { room: {}, success: true }

PUT /api/admin/rooms/:roomId
- Headers: Authorization: Bearer {token}
- Body: { name, pin, type, description }
- Response: { room: {}, success: true }

DELETE /api/admin/rooms/:roomId
- Headers: Authorization: Bearer {token}
- Response: { success: true }
```

### Usuario - Acceso a Salas
```
POST /api/salas/:roomId/join
- Body: { pin }
- Response: { 
    success: true, 
    userId: "unique_id", 
    roomType: "Texto|Multimedia",
    roomName: "nombre_sala"
  }
```

### Usuario - Datos de Sala
```
GET /api/salas/:roomId/users
- Response: { users: [{ userId, nickname }], success: true }

GET /api/salas/:roomId/messages?limit=50&offset=0
- Response: { 
    messages: [
      { 
        id, 
        userId, 
        nickname, 
        message, 
        type: "text|file|system", 
        fileUrl, 
        fileName, 
        timestamp 
      }
    ], 
    success: true 
  }

POST /api/salas/:roomId/upload
- Headers: Content-Type: multipart/form-data
- Form Data: { file, nickname }
- Response: { fileUrl, fileName, success: true }

POST /api/salas/:roomId/leave
- Response: { success: true }
```

## 🔌 Eventos Socket.io Requeridos

### Que el frontend EMITE (Backend debe escuchar):
```javascript
// Unirse a sala
socket.emit('joinRoom', {
  roomId: 'string',
  nickname: 'string',
  userId: 'string'
})

// Salir de sala
socket.emit('leaveRoom', {
  roomId: 'string',
  nickname: 'string'
})

// Enviar mensaje
socket.emit('sendMessage', {
  roomId: 'string',
  message: 'string',
  messageType: 'text|file|system',
  timestamp: 'ISO string'
})

// Enviar archivo (placeholder - idealizar con HTTP POST)
socket.emit('sendFile', {
  roomId: 'string',
  fileData: 'objeto con datos del archivo',
  timestamp: 'ISO string'
})
```

### Que el backend EMITE (Frontend está escuchando):
```javascript
// Respuesta de actualización de usuarios
socket.on('roomUsersUpdate', (users) => {
  // users = [{ userId, nickname }, ...]
})

// Nuevo usuario se unió
socket.on('userJoined', (data) => {
  // data = { userId, nickname }
})

// Usuario salió
socket.on('userLeft', (data) => {
  // data = { userId, nickname }
})

// Recibir mensaje
socket.on('receiveMessage', (message) => {
  // message = { userId, nickname, message, type, timestamp, fileUrl?, fileName? }
})

// Error de sala
socket.on('roomError', (error) => {
  // error = { message: 'string', code: 'string' }
})

// Error de archivo
socket.on('fileError', (error) => {
  // error = { message: 'string' }
})
```

## 🔐 Validaciones del Backend

El backend DEBE validar:

1. **PIN de Sala**
   - Comparar PIN enviado con PIN de sala
   - Retornar error si no coincide: "PIN incorrecto"

2. **Nickname Único**
   - Verificar que el nickname no esté en uso en esa sala
   - Retornar error si está duplicado

3. **Sesión Única**
   - Validar sesión por IP/dispositivo
   - Rechazar nueva conexión si existe sesión activa
   - Retornar error específico

4. **Tamaño de Archivo**
   - Rechazar archivos > 10MB
   - Retornar error claro

5. **Tipo de Archivo**
   - Validar que sea JPEG, PNG, GIF o PDF
   - Rechazar otros tipos

6. **Tipo de Sala**
   - Si sala es "Texto", bloquear uploads
   - Si sala es "Multimedia", permitir archivos

## 🔧 Configuración de CORS

El backend debe configurar CORS para permitir:
- Origen: `http://localhost:5173` (desarrollo)
- Métodos: GET, POST, PUT, DELETE
- Headers: Authorization, Content-Type
- Credenciales: true (si usa cookies)

```javascript
// Ejemplo con Express/CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://tudominio.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
```

## 🚀 Flujo de Integración

### 1. Startup
```
Frontend carga → Lee localStorage (sesión previa)
              → Si hay token válido → Redirect a dashboard/chat
              → Si no → Mostrar Home
```

### 2. Login Admin
```
Admin ingresa credenciales
    ↓
Frontend POST /api/admin/login
    ↓
Backend valida y retorna token
    ↓
Frontend guarda token en localStorage
    ↓
Frontend redirect a /admin/dashboard
    ↓
Dashboard carga salas con GET /api/admin/rooms
```

### 3. Usuario Accede a Sala
```
Usuario ingresa PIN + Nickname + Sala ID
    ↓
Frontend POST /api/salas/{roomId}/join
    ↓
Backend valida PIN y Nickname
    ↓
Backend valida sesión única
    ↓
Si válido: retorna userId y tipo de sala
    ↓
Frontend guarda datos y redirige a /chat
    ↓
Frontend conecta Socket.io
    ↓
Socket emite 'joinRoom'
    ↓
Backend emite 'roomUsersUpdate' a todos
```

### 4. Chat en Tiempo Real
```
Usuario escribe mensaje
    ↓
Frontend emite 'sendMessage' via Socket
    ↓
Backend recibe, guarda en DB
    ↓
Backend emite 'receiveMessage' a todos en sala
    ↓
Frontend recibe y muestra en pantalla (< 1s)
```

## 📊 Mapeo de Errores

| Error Frontend | Causa Esperada | Respuesta Backend |
|---|---|---|
| "PIN de sala incorrecto" | PIN no coincide | `{ error: 'Invalid PIN' }` |
| "El nickname ya está en uso en esta sala" | Nickname duplicado | `{ error: 'Nickname taken' }` |
| "Ya existe una sesión activa en este dispositivo" | Sesión activa | `{ error: 'Active session' }` |
| "El archivo no debe superar 10MB" | Archivo muy grande | `{ error: 'File too large' }` |
| "Tipo de archivo no permitido" | MIME type inválido | `{ error: 'Invalid file type' }` |
| "Esta sala no permite subida de archivos" | Sala solo texto | Frontend valida |

## 🧪 Testing del Backend

Usar herramientas como Postman o curl:

```bash
# 1. Login Admin
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# 2. Crear Sala
curl -X POST http://localhost:3000/api/admin/rooms \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"id":"sala-1","name":"Test","pin":"1234","type":"Multimedia"}'

# 3. Unirse a Sala
curl -X POST http://localhost:3000/api/salas/sala-1/join \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

## 📝 Notas Importantes

1. **Autenticación**: Usar JWT tokens con Bearer scheme
2. **CORS**: Configurar correctamente para desarrollo y producción
3. **Validación**: Backend es fuente de verdad, Frontend valida para UX
4. **Seguridad**: Nunca confiar solo en validación frontend
5. **Logs**: Registrar intentos fallidos de acceso
6. **Timeouts**: Socket debe tener timeout de reconexión
7. **Persistencia**: Guardar mensajes en base de datos

## 🔄 Flujo Completo de Ejemplo

```javascript
// Frontend - Usuario se une a sala
const joinRoom = async () => {
  try {
    // 1. Validar PIN
    if (pin.length < 4) throw new Error('PIN inválido')
    
    // 2. POST a backend
    const res = await axios.post(`/api/salas/${roomId}/join`, { pin })
    
    // 3. Guardar datos
    localStorage.setItem('user', JSON.stringify({
      nickname,
      roomId,
      userId: res.data.userId
    }))
    
    // 4. Conectar Socket
    await socketService.connect(localStorage.getItem('authToken'))
    
    // 5. Unirse a sala
    socketService.joinRoom(roomId, nickname, res.data.userId)
    
    // 6. Redirect
    navigate('/chat')
  } catch (error) {
    setError(error.message)
  }
}
```

## 🎯 Checklist de Integración

- [ ] Endpoints REST implementados y probados
- [ ] Socket.io configurado en backend
- [ ] CORS habilitado en backend
- [ ] Validación de PIN en backend
- [ ] Validación de Nickname único en backend
- [ ] Validación de sesión única en backend
- [ ] Manejo de archivos en backend
- [ ] Mensaje de bienvenida/salida en sistema
- [ ] Historial de mensajes guardado
- [ ] Reconexión automática funcionando
- [ ] Errores mapeados correctamente
- [ ] Tests E2E con frontend y backend
