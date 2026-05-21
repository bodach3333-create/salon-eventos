# 🎉 Salón de Eventos Infantiles — Sistema de Reservas

Sistema web de reservas + cotización automática para salón de eventos infantiles.

---

## 📁 Estructura del proyecto

```
salon-eventos/
├── frontend/          → React + Vite + TypeScript (deploy → Firebase Hosting)
├── backend/           → Express + TypeScript + Prisma (deploy → Railway)
├── firebase.json      → Configuración de Firebase Hosting
├── .firebaserc        → Proyecto Firebase
└── README.md
```

---

## 🚀 Guía de instalación desde cero

### PASO 1 — Instalar herramientas globales

```bash
# Node.js 20+ requerido. Verificar:
node --version   # debe ser v20 o superior

# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión en Firebase
firebase login
```

---

### PASO 2 — Crear proyecto en Firebase

1. Ir a https://console.firebase.google.com
2. Click en **"Agregar proyecto"**
3. Nombre: `salon-eventos` (o el que prefieras)
4. Desactivar Google Analytics (no es necesario para este proyecto)
5. Click en **"Crear proyecto"**

Luego copiar el **Project ID** (ej: `salon-eventos-abc12`)

Editar `.firebaserc` y reemplazar el valor:

```json
{
  "projects": {
    "default": "TU-PROJECT-ID-AQUI"
  }
}
```

---

### PASO 3 — Configurar el Backend en Railway

#### 3a. Crear cuenta en Railway
1. Ir a https://railway.app
2. Crear cuenta con GitHub

#### 3b. Crear proyecto en Railway
1. Click **"New Project"**
2. Click **"Deploy from GitHub repo"**
   - Conectar tu repositorio
   - Seleccionar la carpeta `/backend` como root (o configurar en settings)
3. Railway detecta automáticamente Node.js

#### 3c. Agregar PostgreSQL
1. Dentro del proyecto en Railway, click **"New Service"**
2. Seleccionar **"Database → PostgreSQL"**
3. Railway crea la base de datos automáticamente
4. Copiar el valor de `DATABASE_URL` desde la pestaña **Variables** de PostgreSQL

#### 3d. Configurar variables de entorno en Railway
En el servicio del backend, ir a **Variables** y agregar:

```
DATABASE_URL        = (copiado del paso anterior, lo agrega Railway automáticamente)
JWT_SECRET          = una-cadena-larga-y-secreta-de-al-menos-32-caracteres
ADMIN_PASSWORD      = la-contrasena-del-panel-admin
NODE_ENV            = production
PORT                = 3001
FRONTEND_URL        = https://TU-PROYECTO.web.app
HOLD_DURATION_MINUTES = 30
```

> 💡 Para `JWT_SECRET`, podés generar uno con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### PASO 4 — Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### PASO 5 — Configurar el Frontend

Crear el archivo `frontend/.env.local`:

```bash
# Reemplazar con la URL que te dio Railway para tu backend
VITE_API_URL=https://tu-backend.railway.app
```

> ⚠️ En desarrollo local: `VITE_API_URL=http://localhost:3001`

---

### PASO 6 — Correr en desarrollo local

#### Terminal 1 — Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL local o la de Railway

npm run db:generate    # Genera el cliente de Prisma
npm run db:migrate     # Crea las tablas en la base de datos
npm run db:seed        # Carga datos iniciales (slots, paquetes, etc.)
npm run dev            # Inicia el servidor en http://localhost:3001
```

#### Terminal 2 — Frontend

```bash
cd frontend
npm run dev            # Inicia en http://localhost:5173
```

Abrir http://localhost:5173 para ver la aplicación.
Panel admin: http://localhost:5173/admin/login

---

### PASO 7 — Deploy a producción

#### 7a. Deploy del Backend (Railway)
Railway hace deploy automático cuando hacés push a tu rama principal.

Si querés deploy manual:
```bash
cd backend
# Railway CLI (opcional)
npm install -g @railway/cli
railway login
railway up
```

Verificar que el backend esté corriendo:
```
GET https://tu-backend.railway.app/health
→ { "status": "ok" }
```

#### 7b. Deploy del Frontend (Firebase Hosting)

```bash
cd frontend

# Build de producción
npm run build

# Deploy a Firebase
firebase deploy --only hosting
```

O usar el script combinado:
```bash
npm run deploy
```

Firebase te dará una URL tipo:
```
https://salon-eventos-abc12.web.app
```

---

## 🔧 Comandos útiles

### Backend

```bash
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Correr en producción (después del build)
npm start

# Gestión de base de datos
npm run db:migrate       # Aplicar migraciones pendientes
npm run db:generate      # Regenerar cliente Prisma (después de cambiar schema)
npm run db:seed          # Cargar datos de prueba
npm run db:studio        # Abrir Prisma Studio (visualizador de BD)
```

### Frontend

```bash
npm run dev              # Desarrollo
npm run build            # Build para producción
npm run preview          # Previsualizar el build localmente
npm run deploy           # Build + deploy a Firebase
```

---

## 🛣️ Endpoints del API

### Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/availability/month?year=2024&month=3` | Disponibilidad del mes |
| GET | `/api/availability/day/2024-03-15` | Disponibilidad de un día |
| GET | `/api/catalog/catering` | Paquetes de catering |
| GET | `/api/catalog/drinks` | Opciones de bebidas |
| GET | `/api/catalog/cakes` | Opciones de tortas |
| GET | `/api/catalog/extras` | Extras disponibles |
| GET | `/api/catalog/config` | Config del negocio |
| POST | `/api/pricing/estimate` | Cotización estimada |
| POST | `/api/reservations` | Crear reserva |

### Admin (requieren `Authorization: Bearer <token>`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login |
| GET | `/api/admin/reservations` | Listar reservas |
| PATCH | `/api/admin/reservations/:id/status` | Cambiar estado |
| GET | `/api/admin/blocks` | Listar bloqueos |
| POST | `/api/admin/blocks` | Bloquear fecha/slot |
| DELETE | `/api/admin/blocks/:id` | Desbloquear |
| GET | `/api/admin/slots` | Listar turnos |
| POST | `/api/admin/slots` | Crear turno |

---

## 🗺️ Rutas del Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Home pública |
| `/reservar` | Wizard de reserva (4 pasos) |
| `/reserva-exitosa/:id` | Confirmación post-reserva |
| `/admin/login` | Login admin |
| `/admin/dashboard` | Panel principal |
| `/admin/reservas` | Gestión de reservas |
| `/admin/calendario` | Vista calendario |
| `/admin/catalogo` | CRUD de servicios |

---

## 🧠 Conceptos clave del sistema

### Estados de disponibilidad
```
available  → El slot se puede reservar
pending    → Tiene una reserva PENDING o HOLD activa
reserved   → Confirmado por el admin
blocked    → Bloqueado manualmente
closed     → Día no operativo
```

### Estados de reserva
```
PENDING    → Solicitud recibida (no ocupa definitivamente)
HOLD       → Slot bloqueado temporalmente (expira en X minutos)
CONFIRMED  → Admin confirmó
CANCELLED  → Cancelado
EXPIRED    → El HOLD venció sin confirmación
```

### Flujo de precios
1. El frontend llama a `POST /api/pricing/estimate` para mostrar estimación
2. Al crear la reserva, el **backend recalcula siempre** el precio
3. El precio queda guardado en `pricingSnapshot` (inmutable)
4. Si los precios cambian después, la reserva conserva el precio original

---

## 📦 Variables de entorno de referencia

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="tu-secreto-largo"
JWT_EXPIRES_IN="7d"
ADMIN_PASSWORD="tu-password-admin"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
HOLD_DURATION_MINUTES=30
```

### Frontend (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:3001
```

---

## 🔒 Seguridad

- El panel admin usa JWT con contraseña simple (sin usuarios, sin registro)
- La contraseña del admin **nunca** se guarda en la BD — se compara con la variable de entorno
- CORS configurado para aceptar solo el dominio del frontend
- Helmet activo en el backend

---

## 🧱 Próximos pasos (post-MVP)

- [ ] Vista de calendario completa en el admin
- [ ] CRUD completo de paquetes de catering desde el panel
- [ ] Integración con WhatsApp Business API (notificaciones automáticas)
- [ ] Analytics básico (reservas por mes, servicios más populares)
- [ ] Múltiples salones / espacios
- [ ] Sistema de cupones / descuentos
