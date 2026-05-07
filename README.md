# 📚 Study Planner

Aplicación web para gestión y planificación de actividades de estudio. Permite crear actividades con subtareas, hacer seguimiento del progreso, detectar sobrecargas de trabajo y redistribuir tareas automáticamente.

**🌐 URLs en producción:**
- Frontend: https://study-planner-frontend-lake.vercel.app
- Backend API: https://study-planner-backend-5b5w.onrender.com/api
- Health check: https://study-planner-backend-5b5w.onrender.com/health/

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 3 |
| Backend | Django 6 + Django REST Framework |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (JWT) |
| Despliegue Frontend | Vercel |
| Despliegue Backend | Render |

---

## 🚀 Instalación y ejecución local

### Requisitos previos
- Python 3.11+
- Node.js 18+
- Cuenta en Supabase (gratuita)
- Git

---

### Backend

**1. Clonar el repositorio:**
```bash
git clone https://github.com/AndresChicaiza/study_planner_backend.git
cd study_planner_backend
```

**2. Crear entorno virtual e instalar dependencias:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**3. Crear el archivo `.env` en la raíz del proyecto:**
```env
DATABASE_URL=postgresql://postgres.XXXX:PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://XXXX.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_JWT_SECRET=...
SECRET_KEY=una-clave-secreta-larga
DEBUG=true
ALLOWED_HOSTS=localhost 127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**4. Correr migraciones e iniciar el servidor:**
```bash
python manage.py migrate
python manage.py runserver
```

El backend queda disponible en `http://127.0.0.1:8000`

---

### Frontend

**1. Clonar el repositorio:**
```bash
git clone https://github.com/AndresChicaiza/study-planner-frontend.git
cd study-planner-frontend
```

**2. Instalar dependencias:**
```bash
npm install
```

**3. Crear el archivo `.env` en la raíz:**
```env
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_API_URL=http://127.0.0.1:8000/api
```

**4. Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

El frontend queda disponible en `http://localhost:5173`

---

## 📁 Estructura del proyecto

### Backend
```
study_planner_backend/
├── activities/         # Gestión de actividades de estudio
├── subtasks/           # Subtareas con estado, fechas y notas
├── conflicts/          # Detección y resolución de sobrecargas
├── today/              # Vista diaria con clasificación de tareas
├── users/              # Configuración de usuario (límite diario)
├── progress/           # Módulo de progreso
├── core/
│   └── auth.py         # Autenticación JWT con Supabase
└── config/
    ├── settings.py
    └── urls.py
```

### Frontend
```
study-planner-frontend/
├── public/
│   └── logo.png
└── src/
    ├── api/
    │   ├── axios.js        # Cliente HTTP con interceptores JWT
    │   └── supabase.js     # Cliente Supabase
    ├── context/
    │   ├── AuthContext.js
    │   ├── AuthProvider.jsx
    │   └── useAuth.js
    ├── components/
    │   ├── Layout.jsx
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── PrivateRoute.jsx
    │   └── TodaySection.jsx
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── Today.jsx
        ├── Activities.jsx
        ├── Conflicts.jsx
        ├── Analytics.jsx
        └── Settings.jsx
```

---

## 🔌 API — Endpoints principales

### Actividades
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/activities/` | Listar actividades del usuario |
| POST | `/api/activities/` | Crear actividad (title, due_date, tag) |
| PATCH | `/api/activities/:id/` | Editar actividad |
| DELETE | `/api/activities/:id/` | Eliminar actividad y sus subtareas |

### Subtareas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/subtasks/` | Listar subtareas |
| POST | `/api/subtasks/create/` | Crear subtarea |
| PATCH | `/api/subtasks/:id/complete/` | Completar (acepta real_hours, note) |
| PATCH | `/api/subtasks/:id/postpone/` | Posponer a nueva fecha |
| PATCH | `/api/subtasks/:id/reschedule/` | Reprogramar fecha |
| PATCH | `/api/subtasks/:id/hours/` | Actualizar horas |
| DELETE | `/api/subtasks/:id/delete/` | Eliminar subtarea |

### Vista diaria
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/today/` | Retorna vencidas, hoy, próximas y detecta sobrecarga |

### Dashboard
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard/` | Resumen: actividades, subtareas, horas pendientes y hoy |

### Conflictos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/conflicts/` | Listar conflictos no resueltos |
| PATCH | `/api/conflicts/:id/resolve/` | Marcar como resuelto |
| POST | `/api/conflicts/:id/redistribute/` | Redistribuir subtareas automáticamente |

### Configuración
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users/settings/` | Obtener límite diario de horas |
| PATCH | `/api/users/settings/update/` | Actualizar límite diario |

**Autenticación:** Todas las rutas requieren el header:
```
Authorization: Bearer <token_supabase>
```

---

## 🔐 Autenticación

El sistema usa **Supabase Auth** con tokens JWT. El flujo es:

1. Usuario inicia sesión en `/` — Supabase devuelve un `access_token`
2. El frontend guarda el token en `localStorage`
3. Axios intercepta cada request y agrega el header `Authorization: Bearer <token>`
4. El backend decodifica el token en `core/auth.py` sin verificar firma (compatible con ECC P-256)
5. Se obtiene el `sub` (user_id) y se busca o crea el `UserProfile`

---

## 🎨 Accesibilidad (WCAG 2.2)

El proyecto implementa dos pautas de accesibilidad:

**1. Contraste para daltonismo**
- Paleta que no depende solo de rojo/verde
- Estados diferenciados por forma + color + texto
- Colores accesibles: naranja para vencido, azul para pendiente, verde para completado

**2. Navegación por teclado**
- Skip link "Saltar al contenido principal" al inicio de cada página
- `focus-visible` con anillo de 2px en todos los elementos interactivos
- `aria-label` en botones y controles sin texto visible
- `role` y `aria-live` en alertas dinámicas
- Modales con `role="dialog"` y `aria-modal="true"`

---

## 📦 Despliegue en producción

### Backend en Render
1. Conectar repositorio en render.com → New Web Service
2. Build Command: `pip install -r requirements.txt && python manage.py migrate`
3. Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. Agregar variables de entorno (ver sección .env)

### Frontend en Vercel
1. Conectar repositorio en vercel.com → New Project
2. Framework: Vite (detectado automáticamente)
3. Agregar variables de entorno `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
4. El archivo `vercel.json` ya está configurado para React Router SPA

---

## 👨‍💻 Autor

**Andrés Chicaiza** — [@AndresChicaiza](https://github.com/AndresChicaiza)

Proyecto desarrollado como parte del curso de Desarrollo de Software II.