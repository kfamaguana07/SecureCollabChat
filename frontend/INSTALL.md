# 🚀 GUÍA DE INSTALACIÓN - SecureCollabChat Frontend

## 📋 Requisitos Previos

- **Node.js**: v16 o superior
- **npm**: v7 o superior (incluido con Node.js)
- **Git**: para control de versiones
- **Editor de código**: VS Code recomendado

### Verificar instalación

```bash
# Verificar Node.js
node --version
# Debe mostrar v16.0.0 o superior

# Verificar npm
npm --version
# Debe mostrar v7.0.0 o superior
```

## 📦 Instalación del Proyecto

### Paso 1: Navegar a la carpeta del proyecto

```bash
# Navegar al directorio del frontend
cd /home/carlosdev/Documentos/Universidad/app_distribuidas/"Unidad 1"/SecureCollabChat/frontend

# O desde la raíz del proyecto
cd SecureCollabChat/frontend
```

### Paso 2: Instalar dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install

# Esto descargará:
# - React 19
# - React Router DOM
# - Axios (cliente HTTP)
# - Socket.io-client
# - Tailwind CSS
# - Y todas sus dependencias
```

**Tiempo estimado**: 2-5 minutos (según tu conexión)

### Paso 3: Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu editor favorito
# En Windows:
# notepad .env

# En Mac/Linux:
# nano .env
# o
# vim .env
```

**Contenido de .env (por defecto):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

⚠️ **Nota**: Si tu backend está en otro puerto, cambiar aquí.

## 🎮 Desarrollo Local

### Iniciar servidor de desarrollo

```bash
# Desde la carpeta frontend/
npm run dev

# Output esperado:
# ➜ Local:   http://localhost:5173/
# ➜ press h to show help
```

### Acceder a la aplicación

1. Abre tu navegador web
2. Ve a: **http://localhost:5173**
3. ¡Verás la página de inicio!

### Modo de desarrollo con hot reload

- **Cambios automáticos**: Al guardar un archivo, se actualiza automáticamente
- **Errores en consola**: Los errores aparecerán en la terminal y en el navegador
- **DevTools**: F12 para abrir developer tools

### Detener el servidor

```bash
# En la terminal, presiona:
Ctrl + C
```

## 🧪 Pruebas Rápidas

### Prueba 1: Admin Flow

```
1. En navegador → http://localhost:5173
2. Haz click en botón "Administrador"
3. Ingresa cualquier usuario y contraseña
   (Frontend valida, backend autentica)
4. Deberías ver: Dashboard con "0 salas creadas"
5. Haz click en "+ Nueva Sala"
6. Completa formulario:
   - ID: test-room-1
   - Nombre: Mi Primera Sala
   - PIN: 1234
   - Tipo: Multimedia
7. Haz click en "Crear Sala"
8. Deberías ver la sala en la lista
```

### Prueba 2: User Flow

```
1. En navegador → http://localhost:5173
2. Haz click en botón "Usuario"
3. Ingresa datos:
   - ID de Sala: test-room-1
   - PIN: 1234
   - Nickname: miNombre
4. Haz click en "Acceder a Sala"
5. Deberías ver:
   - Header con "Mi Primera Sala" (Multimedia)
   - Área vacía de mensajes
   - Input para escribir
   - Botón para subir archivo
   - Sidebar con usuarios conectados (1 usuario: tú)
```

### Prueba 3: Chat Flow

```
1. En la sala (de Prueba 2)
2. En el input, escribe: "¡Hola, esto es un test!"
3. Presiona Ctrl+Enter o click en botón 📤
4. El mensaje debería aparecer a la derecha
5. Debería mostrar timestamp
6. En la lista de usuarios (derecha), deberías verte
```

## 📁 Estructura de Directorios

```
frontend/
├── src/
│   ├── App.jsx              ← Componente raíz
│   ├── main.jsx             ← Punto de entrada
│   ├── index.css            ← Estilos globales
│   ├── App.css              ← Estilos del App
│   │
│   ├── components/          ← Componentes UI
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UserLogin.jsx
│   │   ├── ChatRoom.jsx
│   │   └── ...
│   │
│   ├── services/            ← Servicios (API, Socket)
│   │   ├── api.js
│   │   └── socket.js
│   │
│   ├── context/             ← Estado global
│   │   └── AuthContext.jsx
│   │
│   ├── pages/               ← Páginas principales
│   │   └── HomePage.jsx
│   │
│   └── utils/               ← Utilidades
│       ├── validators.js
│       └── constants.js
│
├── public/                  ← Archivos estáticos
├── .env.example             ← Variables de ejemplo
├── .env                     ← Tu configuración (crear)
├── package.json             ← Dependencias
├── vite.config.js           ← Config Vite
├── tailwind.config.js       ← Config Tailwind
├── postcss.config.js        ← Config PostCSS
│
└── docs/                    ← DOCUMENTACIÓN
    ├── README.md            ← Info general
    ├── QUICK_START.md       ← Inicio rápido
    ├── ARCHITECTURE.md      ← Arquitectura
    ├── FLOWS.md             ← Flujos de datos
    ├── BACKEND_INTEGRATION.md
    ├── BACKEND_EXAMPLE.md
    └── VERIFICATION.md
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor en puerto 5173

# Compilación
npm run build            # Crea carpeta dist/ para producción
npm run preview          # Vista previa del build

# Validación
npm run lint             # Ejecuta ESLint

# Instalación
npm install              # Instala dependencias
npm install <package>    # Instala paquete específico
npm update               # Actualiza dependencias
```

## 🐛 Troubleshooting

### ❌ Error: "command not found: npm"

**Solución:**
- Verificar que Node.js está instalado: `node --version`
- Reinstalar Node.js desde https://nodejs.org
- Reiniciar terminal

### ❌ Error: "Port 5173 already in use"

**Solución:**
```bash
# Opción 1: Cambiar puerto
npm run dev -- --port 3001

# Opción 2: Liberar puerto (en otra terminal)
# En Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# En Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### ❌ Error: "Cannot find module"

**Solución:**
```bash
# Eliminar node_modules
rm -rf node_modules

# Limpiar cache
npm cache clean --force

# Reinstalar
npm install
```

### ❌ Error: "CORS error" / "Backend no responde"

**Verificar:**
1. Backend está corriendo en puerto 3000
2. Variables en .env son correctas
3. Backend CORS está configurado
4. Sin firewall bloqueando conexión

### ❌ Página en blanco / No carga contenido

**Soluciones:**
1. Abrir DevTools (F12)
2. Revisar pestaña "Console" para errores
3. Revisar pestaña "Network" para fallos
4. Reiniciar servidor: `npm run dev`

## 📊 Verificar Instalación

Después de `npm install`, verifica que tienes los archivos correctos:

```bash
# Debe haber estos directorios:
ls src/components        # Debe tener 11 archivos .jsx
ls src/services          # Debe tener 2 archivos .js
ls src/context           # Debe tener 1 archivo .jsx
ls src/pages             # Debe tener 1 archivo .jsx
ls src/utils             # Debe tener 2 archivos .js

# Archivos de config:
ls -la | grep tailwind   # tailwind.config.js
ls -la | grep postcss    # postcss.config.js
ls -la | grep vite       # vite.config.js
```

## 🚀 Deployment (Producción)

### Compilar para producción

```bash
# Generar optimizado
npm run build

# Genera carpeta dist/ con los archivos listos
# Tamaño típico: ~200KB gzipped
```

### Servir localmente (preview)

```bash
# Ver cómo se vería en producción
npm run preview

# Abrirá en http://localhost:4173
```

### Desplegar

El contenido de la carpeta `dist/` está listo para:
- Subirlo a cualquier servidor web
- Subir a CDN
- Docker container
- Vercel, Netlify, GitHub Pages, etc.

## 📚 Documentación

**Después de instalar**, revisa:

1. **QUICK_START.md** - Para empezar inmediatamente
2. **ARCHITECTURE.md** - Para entender la estructura
3. **BACKEND_INTEGRATION.md** - Para conectar backend
4. **FLOWS.md** - Para entender los flujos de datos

## 🎓 Aprendizaje

### Primeras cosas que revisar

1. `src/App.jsx` - Enrutamiento principal
2. `src/components/HomePage.jsx` - Landing page
3. `src/components/ChatRoom.jsx` - Componente principal
4. `src/context/AuthContext.jsx` - Estado global
5. `src/services/api.js` - Llamadas REST

### Modificar la aplicación

**Ejemplo: Cambiar color primario**

1. Abre `tailwind.config.js`
2. Encuentra `primary: '#6B46C1'`
3. Cambia a otro color HEX
4. Guarda - ¡Se actualiza automáticamente!

**Ejemplo: Agregar validación**

1. Abre `src/utils/validators.js`
2. Agrega nueva función de validación
3. Importa en el componente que la necesita
4. Úsala en el formulario

## ✨ Tips Útiles

- **DevTools**: F12 para inspeccionar elementos
- **Console**: Ver logs y errores
- **Network**: Ver llamadas HTTP
- **Elements**: Inspeccionar estructura HTML
- **Hot Reload**: Guarda automáticamente = actualización inmediata
- **Error Overlay**: Los errores aparecen directamente en navegador

## 🔐 Seguridad

- ✅ No guardes credenciales en `.env`
- ✅ Usa `.env` solo para desarrollo
- ✅ En producción, usa variables de servidor
- ✅ Nunca commitees `.env` a git
- ✅ Usa `.gitignore` para archivos sensibles

## 📞 Soporte

Si algo no funciona:

1. Revisa mensajes de error en consola (F12)
2. Verifica que Backend está corriendo
3. Revisa variables en `.env`
4. Intenta: `npm install && npm run dev`
5. Lee documentación en carpeta actual

---

## ✅ Lista de Verificación Final

- [ ] Node.js v16+ instalado
- [ ] npm v7+ instalado
- [ ] Carpeta frontend descargada
- [ ] `npm install` ejecutado sin errores
- [ ] `.env` configurado
- [ ] `npm run dev` ejecutado correctamente
- [ ] http://localhost:5173 abre en navegador
- [ ] Home page visible con botones Admin/Usuario

**Si todo está ✅, ¡estás listo para desarrollar!**

---

**Tiempo total de instalación**: 5-10 minutos
**Próximo paso**: Lee [QUICK_START.md](./QUICK_START.md)
