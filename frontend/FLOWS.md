# Flujos del Sistema - SecureCollabChat

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Components (Presentación)                  │   │
│  │  AdminLogin │ AdminDashboard │ ChatRoom │ UserLogin  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Services (Lógica)                          │   │
│  │        API.js    │    Socket.js                      │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↓                                    ↓              │
│      REST HTTP                          WebSocket (S.io)     │
└────────────────────────────────────────────────────────────┐─┘
                      ↓
           ┌──────────────────────┐
           │  BACKEND (Node.js)   │
           │  Express + Socket.io │
           └──────────────────────┘
                      ↓
           ┌──────────────────────┐
           │   Base de Datos      │
           │     (MongoDB)        │
           └──────────────────────┘
```

## 🔄 Flujo de Login - Administrador

```
┌──────────────────┐
│  Admin ingresa   │
│  usuario+pwd     │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Frontend valida campos           │
│  (No vacío, pwd > 6 caracteres)   │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  POST /api/admin/login            │
│  Frontend → Backend               │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Backend valida credenciales     │
│  (Comparar con BD)               │
└────────┬─────────────────────────┘
         │ ✓ Válido
         ↓
┌──────────────────────────────────┐
│  Backend genera JWT token         │
│  Response: { token, admin }       │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Frontend guarda token            │
│  localStorage.setItem('authToken')│
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Redirect → /admin/dashboard      │
└──────────────────────────────────┘
```

## 🔐 Flujo de Acceso - Usuario

```
┌──────────────────────────────┐
│  Usuario ingresa:            │
│  - ID Sala                   │
│  - PIN (4+ dígitos)          │
│  - Nickname (max 20 chars)   │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Frontend valida todos los campos    │
│  - PIN: ✓ Números, >= 4             │
│  - Nickname: ✓ Alfanumérico, < 20   │
│  - ID: ✓ Alfanumérico, < 30         │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  POST /api/salas/:roomId/join        │
│  Body: { pin }                       │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend:                            │
│  1. Validar PIN vs Sala.pin          │
│  2. Validar sesión única (IP)        │
│  3. Crear sesión                     │
└────────┬──────────────────────────────┘
         │ ✓ Válido
         ↓
┌──────────────────────────────────────┐
│  Response: {                         │
│    success: true,                    │
│    userId: "user_id",                │
│    roomType: "Multimedia"            │
│  }                                   │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Frontend:                           │
│  1. Guardar datos en localStorage    │
│  2. Conectar Socket.io               │
│  3. socket.emit('joinRoom', ...)     │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend Socket.io:                  │
│  1. Validar sesión única             │
│  2. Agregar usuario a activeRooms    │
│  3. Emitir 'roomUsersUpdate'         │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Frontend Socket.io:                 │
│  1. Recibir lista actualizada        │
│  2. Actualizar componente UserList   │
│  3. Mostrar usuario en el chat       │
└──────────────────────────────────────┘
```

## 💬 Flujo de Mensajería en Tiempo Real

```
┌─────────────────────────────┐
│ Usuario escribe mensaje     │
│ y presiona Enter o Enviar   │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ Frontend valida:            │
│ - Mensaje no vacío          │
│ - Socket conectado          │
└────────┬────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ socket.emit('sendMessage', {     │
│   roomId: "sala-1",              │
│   message: "Hola",               │
│   messageType: "text",           │
│   timestamp: "ISO_DATE"          │
│ })                               │
└────────┬─────────────────────────┘
         │
         ↓ WebSocket (< 1s)
┌──────────────────────────────────┐
│ Backend recibe evento            │
│ 1. Guardar en BD                 │
│ 2. Emitir a todos en sala        │
└────────┬─────────────────────────┘
         │
         ↓ Broadcast
┌──────────────────────────────────┐
│ io.to(roomId).emit(              │
│   'receiveMessage',              │
│   { userId, nickname, message... }│
│ )                                │
└────────┬─────────────────────────┘
         │
         ↓ WebSocket (< 1s)
┌──────────────────────────────────┐
│ Frontend recibe 'receiveMessage' │
│ 1. Agregar a array de mensajes   │
│ 2. Re-renderizar MessageList     │
│ 3. Auto-scroll a nuevo mensaje   │
└──────────────────────────────────┘
```

## 📁 Flujo de Subida de Archivo

```
┌──────────────────────────────┐
│ Usuario selecciona archivo   │
│ (click o drag & drop)        │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Frontend valida:                     │
│ 1. Tamaño: <= 10MB                   │
│ 2. Tipo: JPEG/PNG/GIF/PDF            │
│ 3. Sala: no es "Solo Texto"          │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ POST /api/salas/:roomId/upload       │
│ Body: FormData { file, nickname }    │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Backend:                             │
│ 1. Validar tamaño nuevamente         │
│ 2. Validar tipo nuevamente           │
│ 3. Guardar en servidor               │
│ 4. Guardar metadatos en BD           │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Backend emite via Socket.io:         │
│ io.to(roomId).emit('receiveFile', {  │
│   fileUrl, fileName, uploader        │
│ })                                   │
└────────┬──────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Frontend:                            │
│ 1. Recibir 'receiveFile'             │
│ 2. Agregar a mensajes (type:file)    │
│ 3. Mostrar en chat como descarga     │
└──────────────────────────────────────┘
```

## 👥 Flujo de Actualización de Usuarios

```
┌──────────────────────────────────┐
│ Usuario se une a sala            │
│ socket.emit('joinRoom', ...)     │
└────────┬───────────────────────┬─┘
         │                       │
         ↓                       ↓
    Backend:             Frontend:
    1. Validar           (Esperando
    2. Agregar a         respuesta)
       activeRooms
    3. Crear lista
       de usuarios
    
    4. io.to(roomId).emit(
         'roomUsersUpdate',
         [users]
       )
         │
         └────────────┬─────────────┘
                      │
                      ↓ WebSocket
              ┌──────────────────┐
              │ Frontend recibe: │
              │ [                │
              │   {userId,       │
              │    nickname},... │
              │ ]                │
              └────────┬─────────┘
                       │
                       ↓
              ┌──────────────────┐
              │ Actualizar       │
              │ useState(users)  │
              └────────┬─────────┘
                       │
                       ↓
              ┌──────────────────┐
              │ Re-renderizar    │
              │ <UserList>       │
              └──────────────────┘
```

## 🚪 Flujo de Desconexión

```
┌─────────────────────────────────┐
│ Usuario hace click en "Salir"   │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ Mostrar confirmación            │
└────────┬────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Frontend:                        │
│ 1. socketService.leaveRoom(...)  │
│ 2. socketService.disconnect()    │
│ 3. logout()                      │
└────────┬───────────────────────┬─┘
         │                       │
         ↓                       ↓
    Backend Socket:      Frontend:
    1. Emitir            1. Limpiar
       'userLeft'           localStorage
    2. Actualizar       2. Redirect a
       activeRooms         /user/login
    3. io.to(roomId).emit(
         'roomUsersUpdate'
       )
```

## 🛡️ Flujo de Validación de Sesión Única

```
┌──────────────────────────────┐
│ Usuario intenta unirse a     │
│ sala desde mismo dispositivo │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Frontend POST join request   │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Backend:                         │
│ 1. Obtener IP del cliente        │
│ 2. Buscar sesión activa          │
│    en activeSessions.get(IP)     │
│ 3. ¿Encontró sesión activa?      │
└────────┬─────────────────────────┘
         │
         ├─→ ✓ SÍ
         │   │
         │   ↓
         │   ┌──────────────────┐
         │   │ Rechazar con:    │
         │   │ status 409       │
         │   │ error: "Active   │
         │   │ session"         │
         │   └────────┬─────────┘
         │            │
         │            ↓
         │   ┌──────────────────┐
         │   │ Frontend recibe  │
         │   │ error, muestra:  │
         │   │ "Ya existe       │
         │   │ sesión activa"   │
         │   └──────────────────┘
         │
         └─→ ✗ NO
             │
             ↓
         ┌──────────────────┐
         │ Permitir acceso  │
         │ Crear sesión     │
         └──────────────────┘
```

## 🎯 Estados de Componentes

```
ChatRoom.jsx
├── isLoading: boolean (cargando historial)
├── isConnected: boolean (socket conectado)
├── messages: array (historial)
├── users: array (usuarios conectados)
├── error: string (mensaje de error)
└── currentRoom: object (información de sala)

AdminDashboard.jsx
├── rooms: array (salas del admin)
├── isLoading: boolean (cargando salas)
├── showForm: boolean (mostrar formulario)
└── error: string (errores de operación)

AuthContext.jsx (Global)
├── user: object (datos del usuario)
├── admin: object (datos del admin)
├── currentRoom: object (sala actual)
├── isAuthenticated: boolean (está logueado)
└── error: string (error global)
```

## 🔐 Estados de Error

```
Error PIN Incorrecto
├── Backend: return 401 { error: 'Invalid PIN' }
└── Frontend: Mostrar "PIN de sala incorrecto"

Error Nickname Duplicado
├── Backend: return 409 { error: 'Nickname taken' }
└── Frontend: Mostrar "Nickname ya está en uso"

Error Sesión Activa
├── Backend: return 409 { error: 'Active session' }
└── Frontend: Mostrar "Ya existe sesión activa"

Error Archivo Muy Grande
├── Frontend: Validar tamaño (10MB)
├── Backend: Validar nuevamente
└── Frontend: Mostrar "Archivo supera 10MB"

Error Tipo Archivo Inválido
├── Frontend: Validar MIME type
├── Backend: Validar nuevamente
└── Frontend: Mostrar "Tipo no permitido"

Error Conexión Perdida
├── Socket.io: Reconexión automática (5 intentos)
└── Frontend: Mostrar "Desconectado" en header
```

## 📋 Resumen de Endpoints

```
REST API
├── POST   /api/admin/login
├── GET    /api/admin/rooms
├── POST   /api/admin/rooms
├── GET    /api/admin/rooms/:id
├── PUT    /api/admin/rooms/:id
├── DELETE /api/admin/rooms/:id
├── POST   /api/salas/:id/join
├── GET    /api/salas/:id/users
├── GET    /api/salas/:id/messages
├── POST   /api/salas/:id/upload
└── POST   /api/salas/:id/leave

Socket.io Events
├── emit sendMessage (Frontend → Backend)
├── emit sendFile (Frontend → Backend)
├── emit joinRoom (Frontend → Backend)
├── emit leaveRoom (Frontend → Backend)
├── on receiveMessage (Backend → Frontend)
├── on receiveFile (Backend → Frontend)
├── on roomUsersUpdate (Backend → Frontend)
├── on userJoined (Backend → Frontend)
├── on userLeft (Backend → Frontend)
├── on roomError (Backend → Frontend)
└── on fileError (Backend → Frontend)
```

---

**Ver [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) para detalles técnicos completos**
