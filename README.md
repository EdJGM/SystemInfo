# 🖥️ SystemInfo - Sistema de Monitoreo de Recursos en Tiempo Real

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://typescriptlang.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)](https://postgresql.org)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-orange.svg)](https://developer.mozilla.org/docs/Web/API/WebSockets_API)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com)

Un sistema completo de monitoreo de recursos del sistema en tiempo real que combina un backend híbrido (Python Flask + WebSocket Server) con una interfaz web moderna en Next.js, React y TypeScript. Incluye persistencia de datos con PostgreSQL y análisis de calidad de código con SonarQube.

## 📋 Descripción del Proyecto

SystemInfo es una aplicación avanzada de monitoreo de sistema que proporciona información detallada en tiempo real sobre el estado y rendimiento de los recursos del sistema. Utiliza una arquitectura híbrida con múltiples protocolos de comunicación para garantizar la máxima eficiencia y confiabilidad.

### 📊 Métricas Monitoreadas

- **🧠 CPU**: Porcentaje de uso del procesador por núcleo y general
- **💾 Memoria**: Uso de memoria RAM, swap y memoria virtual
- **💽 Disco**: Espacio utilizado, disponible y velocidad de I/O
- **🌐 Red**: Bytes enviados/recibidos, paquetes y conexiones activas
- **⚙️ Procesos**: Monitoreo detallado de procesos con PID, CPU y memoria
- **🔗 Conexiones de Red**: TCP/UDP conexiones con detalles de puertos y procesos

### 🎯 Características Principales

- ✅ **Comunicación en Tiempo Real** con WebSockets y TCP Sockets
- ✅ **Interfaz Web Moderna** con dashboards interactivos y responsive
- ✅ **Autenticación Segura** con Firebase Authentication
- ✅ **Persistencia de Datos** con PostgreSQL para análisis histórico
- ✅ **Reportes Avanzados** exportación a PDF con gráficos
- ✅ **Configuración Personalizable** de alertas y umbrales
- ✅ **Análisis de Calidad** con SonarQube integrado
- ✅ **Containerización** con Docker Compose
- ✅ **Túneles de Desarrollo** con Ngrok
- ✅ **API RESTful** para integración con otros sistemas

## 🏗️ Arquitectura del Proyecto

```
SystemInfo/
├── 📁 app/                          # Backend API híbrido (Flask + WebSocket)
│   ├── 🐍 server.py                 # Servidor principal Flask + WebSocket
│   ├── 🔧 utils.py                  # Utilidades para métricas del sistema (psutil)
│   └── 📦 __pycache__/              # Cache de Python compilado
├── 📁 frontend_systeminfo/          # Frontend Web (Next.js 15 + React 19)
│   ├── 📁 src/
│   │   ├── 📁 app/                  # App Router de Next.js
│   │   │   ├── 🔒 layout.tsx        # Layout principal con providers
│   │   │   ├── 🏠 page.tsx          # Landing page con autenticación
│   │   │   ├── 📊 dashboard/        # Dashboard principal del sistema
│   │   │   ├── ℹ️ about/            # Página informativa del proyecto
│   │   │   └── 📞 contact/          # Página de contacto y soporte
│   │   ├── 📁 components/           # Componentes React modulares
│   │   │   ├── 🔐 auth/             # Sistema de autenticación Firebase
│   │   │   │   ├── LoginForm.tsx    # Formulario de inicio de sesión
│   │   │   │   ├── SignupForm.tsx   # Formulario de registro
│   │   │   │   └── ResetPassword.tsx # Recuperación de contraseña
│   │   │   ├── ⚙️ config/           # Configuración de monitoreo
│   │   │   │   └── MonitoringConfig.tsx # Panel de configuración
│   │   │   ├── 📈 detailed/         # Vistas detalladas de métricas
│   │   │   │   ├── DashboardContainer.tsx    # Contenedor principal
│   │   │   │   ├── DetailedCPUMonitor.tsx    # Monitor detallado CPU
│   │   │   │   ├── DetailedMemoryMonitor.tsx # Monitor detallado memoria
│   │   │   │   ├── DetailedProcessMonitor.tsx # Monitor de procesos
│   │   │   │   ├── NetworkDetailMonitor.tsx   # Monitor de red detallado
│   │   │   │   └── ReportPage.tsx            # Generación de reportes PDF
│   │   │   ├── 📊 monitoring/       # Componentes de monitoreo básico
│   │   │   │   ├── CPUMonitor.tsx   # Widget monitor CPU
│   │   │   │   ├── DiskMonitor.tsx  # Widget monitor disco
│   │   │   │   ├── MemoryMonitor.tsx # Widget monitor memoria
│   │   │   │   ├── NetworkMonitor.tsx # Widget monitor red
│   │   │   │   ├── ProcessMonitor.tsx # Widget procesos
│   │   │   │   ├── ResourceList.tsx  # Lista de recursos
│   │   │   │   └── SearchBar.tsx     # Barra de búsqueda
│   │   │   └── 🎨 ui/               # Componentes de interfaz reutilizables
│   │   │       ├── button.tsx       # Botones personalizados
│   │   │       ├── checkbox.tsx     # Checkboxes estilizados
│   │   │       ├── input.tsx        # Inputs personalizados
│   │   │       ├── label.tsx        # Labels estilizados
│   │   │       ├── tabs.tsx         # Sistema de pestañas
│   │   │       ├── Logo.tsx         # Logo de la aplicación
│   │   │       ├── NavBar.tsx       # Navegación principal
│   │   │       └── Navbar_in.tsx    # Navegación interna
│   │   ├── 📁 styles/               # Hojas de estilo modulares
│   │   │   ├── globals.css          # Estilos globales Tailwind
│   │   │   ├── dashboard.module.css # Estilos específicos dashboard
│   │   │   ├── form.module.css      # Estilos para formularios
│   │   │   └── navbar.module.css    # Estilos navegación
│   │   └── 📁 utils/                # Utilidades del frontend
│   │       ├── cn.ts                # Utility para clsx/tailwind
│   │       ├── firebase.ts          # Configuración Firebase
│   │       ├── fonts.ts             # Configuración de fuentes
│   │       └── WebSocketContext.tsx # Context para WebSocket
│   ├── 📁 public/                   # Recursos estáticos
│   │   ├── 🎨 images/               # Imágenes y fondos
│   │   ├── favicon.png              # Favicon
│   │   └── icon.png                 # Icono de la app
│   ├── 📄 package.json              # Dependencias Node.js y scripts
│   ├── 🔧 next.config.ts            # Configuración Next.js
│   ├── 🎨 tailwind.config.ts        # Configuración Tailwind CSS
│   ├── ⚙️ postcss.config.mjs        # Configuración PostCSS
│   ├── 📝 tsconfig.json             # Configuración TypeScript
│   └── 🔍 eslint.config.mjs         # Configuración ESLint
├── 🐳 compose.yaml                  # Docker Compose (SonarQube + Ngrok)
├── 🌐 ngrok.yml                     # Configuración túneles Ngrok
├── 🔍 sonar-project.properties      # Análisis de código SonarQube
├── 📡 tcp_con_webcoket.txt          # Documentación de protocolos
└── 📚 README.md                     # Documentación del proyecto
```
│   │   ├── 📁 styles/               # Hojas de estilo CSS
│   │   └── 📁 utils/                # Utilidades del frontend
│   ├── 📁 public/                   # Recursos estáticos
│   └── 📄 package.json              # Dependencias de Node.js
├── 📁 ApiSystemInfo-main/           # Carpeta duplicada (legacy)
├── 🐳 compose.yaml                  # Docker Compose (SonarQube + Ngrok)
├── 🌐 ngrok.yml                     # Configuración de Ngrok
└── 🔍 sonar-project.properties      # Configuración de SonarQube
```

## 🚀 Tecnologías Utilizadas

### 🔧 Backend Stack
- **Python 3.12+** - Lenguaje principal del backend
- **Flask 3.0+** - Framework web para API REST
- **WebSocket Server** - Comunicación en tiempo real
- **psutil** - Biblioteca para métricas del sistema operativo
- **psycopg2** - Adaptador PostgreSQL para Python
- **asyncio** - Programación asíncrona
- **json** - Serialización de datos
- **socket** - Comunicación TCP de bajo nivel

### 🎨 Frontend Stack
- **Next.js 15.1.7** - Framework React con App Router
- **React 19.0.0** - Biblioteca para interfaces de usuario
- **TypeScript 5.0+** - Tipado estático para JavaScript
- **Tailwind CSS 3.4+** - Framework CSS utilitario
- **Radix UI** - Componentes primitivos accesibles
- **Recharts 2.15+** - Gráficos y visualizaciones
- **React PDF 9.2+** - Generación de reportes PDF
- **Axios 1.8+** - Cliente HTTP para comunicación con API
- **React Icons** - Biblioteca de iconos
- **React Toastify** - Notificaciones toast
- **React Spinners** - Indicadores de carga

### 🔐 Autenticación y Base de Datos
- **Firebase Authentication** - Sistema de autenticación
- **Firebase Hooks** - Integración React con Firebase
- **PostgreSQL** - Base de datos relacional
- **Firestore** - Base de datos NoSQL (opcional)

### 🛠️ DevOps y Herramientas
- **Docker Compose** - Orquestación de contenedores
- **SonarQube** - Análisis de calidad y seguridad del código
- **Ngrok** - Túneles seguros para desarrollo
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Procesador de CSS
- **Git** - Control de versiones

## 📦 Instalación y Configuración

### Prerrequisitos

- **Python 3.12+** con pip
- **Node.js 18+** con npm/yarn/pnpm
- **PostgreSQL 13+** (para persistencia de datos)
- **Docker & Docker Compose** (opcional, para SonarQube)
- **Git** para clonar el repositorio

### 1. 📥 Clonar el Repositorio

```bash
git clone https://github.com/Antoni30/SystemInfo.git
cd SystemInfo
```

### 2. 🗄️ Configuración de Base de Datos PostgreSQL

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE systemop;
CREATE USER postgres WITH PASSWORD 'adminadmin123';
GRANT ALL PRIVILEGES ON DATABASE systemop TO postgres;
\q

# Crear tabla para conexiones de red
psql -U postgres -d systemop -c "
CREATE TABLE network_connections (
    id SERIAL PRIMARY KEY,
    connection_type VARCHAR(10),
    local_address VARCHAR(45),
    local_port INTEGER,
    remote_address VARCHAR(45),
    remote_port INTEGER,
    status VARCHAR(20),
    pid INTEGER,
    process_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"
```

### 3. 🐍 Configuración del Backend

```bash
# Crear entorno virtual de Python
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install psutil flask flask-cors psycopg2-binary websockets asyncio

# Ejecutar el servidor
cd app
python server.py
```

**Endpoints disponibles:**
- WebSocket Server: `ws://localhost:8765`
- Flask API: `http://localhost:5000`
- TCP Socket: `tcp://localhost:9999`

### 4. ⚛️ Configuración del Frontend

```bash
cd frontend_systeminfo

# Instalar dependencias
npm install
# o con yarn
yarn install
# o con pnpm
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

**Configurar `.env.local`:**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8765
```

```bash
# Ejecutar en modo desarrollo
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### 5. 🐳 Configuración con Docker (Opcional)

```bash
# Crear archivo .env para Ngrok
echo "NGROK_AUTHTOKEN=tu_ngrok_token" > .env

# Ejecutar SonarQube y Ngrok
docker-compose up -d

# Acceder a los servicios
# SonarQube: http://localhost:9000
# Ngrok Dashboard: http://localhost:4040
```

## 🔧 Configuración de Firebase

1. **Crear Proyecto Firebase**
   - Ir a [Firebase Console](https://console.firebase.google.com/)
   - Crear un nuevo proyecto
   - Habilitar Analytics (opcional)

2. **Configurar Authentication**
   ```bash
   # En Firebase Console:
   # 1. Ir a Authentication > Sign-in method
   # 2. Habilitar Email/Password
   # 3. Configurar dominio autorizado (localhost:3000)
   ```

3. **Configurar Firestore (Opcional)**
   ```bash
   # En Firebase Console:
   # 1. Ir a Firestore Database
   # 2. Crear base de datos en modo de prueba
   # 3. Configurar reglas de seguridad
   ```

4. **Obtener Configuración**
   ```bash
   # En Firebase Console:
   # 1. Ir a Project Settings (⚙️)
   # 2. Scroll hasta "Your apps"
   # 3. Crear/seleccionar app web
   # 4. Copiar firebaseConfig
   ```

5. **Variables de Entorno**
   
   Crear archivo `frontend_systeminfo/.env.local`:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=proyecto-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
   
   # API Configuration  
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8765
   NEXT_PUBLIC_TCP_HOST=localhost
   NEXT_PUBLIC_TCP_PORT=9999
   ```

## 📊 Uso de la Aplicación

### 🔐 1. Autenticación y Acceso
- **Registro**: Crear cuenta con email y contraseña segura
- **Inicio de Sesión**: Acceso con credenciales registradas
- **Recuperación**: Reset de contraseña vía email
- **Seguridad**: Autenticación controlada por Firebase

### 📈 2. Dashboard Principal
- **Vista General**: Métricas en tiempo real de todos los recursos
- **Gráficos Interactivos**: Visualizaciones de CPU, memoria, disco y red
- **Lista de Procesos**: Procesos activos con detalles de consumo
- **Actualizaciones**: Datos refrescados cada segundo vía WebSocket

### 🔍 3. Vistas Detalladas

#### CPU Monitor Detallado
- Uso por núcleo del procesador
- Frecuencia actual y máxima
- Historial de uso en tiempo real
- Alertas por uso excesivo

#### Memory Monitor Detallado  
- Memoria RAM total, usada y disponible
- Memoria virtual y swap
- Procesos con mayor consumo de memoria
- Gráficos de tendencias

#### Process Monitor Detallado
- Lista completa de procesos del sistema
- PID, nombre, CPU%, memoria, estado
- Búsqueda y filtrado de procesos
- Información detallada por proceso

#### Network Monitor Detallado
- Conexiones TCP/UDP activas
- Puertos locales y remotos
- Bytes enviados/recibidos
- Procesos asociados a conexiones
- Estadísticas de interfaz de red

### ⚙️ 4. Configuración Avanzada
- **Intervalos de Actualización**: Personalizar frecuencia de datos
- **Umbrales de Alertas**: Configurar límites personalizados
- **Filtros**: Personalizar qué métricas mostrar
- **Notificaciones**: Configurar alertas por email/toast

### 📄 5. Generación de Reportes
- **Reportes PDF**: Generación automática con gráficos
- **Exportación de Datos**: CSV con métricas históricas
- **Análisis de Tendencias**: Informes de uso a largo plazo
- **Programación**: Reportes automáticos programados

## 🔌 API del Sistema

### 🌐 WebSocket API (Puerto 8765)

**Conexión WebSocket**
```javascript
const ws = new WebSocket('ws://localhost:8765');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Datos del sistema:', data);
};
```

**Estructura de datos recibidos:**
```json
{
  "timestamp": "2025-01-17T10:30:00Z",
  "cpu": {
    "percent": 45.2,
    "cores": [23.1, 67.8, 34.5, 89.2],
    "frequency": 2.8
  },
  "memory": {
    "total": 16777216000,
    "used": 11349540864,
    "percent": 67.8,
    "available": 5427675136
  },
  "disk": {
    "total": 500000000000,
    "used": 117000000000,
    "percent": 23.4,
    "free": 383000000000
  },
  "network": {
    "bytes_sent": 1048576,
    "bytes_recv": 2097152,
    "packets_sent": 1024,
    "packets_recv": 2048,
    "connections": 25
  },
  "processes": {
    "count": 342,
    "top_cpu": [
      {"pid": 1234, "name": "chrome.exe", "cpu": 15.2, "memory": 512000000},
      {"pid": 5678, "name": "python.exe", "cpu": 8.7, "memory": 256000000}
    ]
  }
}
```

### 🔗 REST API Flask (Puerto 5000)

**Endpoints Disponibles:**

#### `GET /api/system/info`
Obtiene información general del sistema
```json
{
  "os": "Windows 10",
  "architecture": "AMD64",
  "processor": "Intel Core i7-8700K",
  "cores": 8,
  "threads": 16,
  "memory_total": "16.0 GB"
}
```

#### `GET /api/system/realtime`
Obtiene métricas en tiempo real
```json
{
  "cpu_percent": 45.2,
  "memory_percent": 67.8,
  "disk_percent": 23.4,
  "network_io": {
    "bytes_sent": 1024.50,
    "bytes_recv": 2048.75
  }
}
```

#### `GET /api/network/connections`
Lista conexiones de red activas
```json
{
  "connections": [
    {
      "type": "TCP",
      "local_address": "192.168.1.100",
      "local_port": 3000,
      "remote_address": "142.250.191.14",
      "remote_port": 443,
      "status": "ESTABLISHED",
      "pid": 1234,
      "process": "chrome.exe"
    }
  ]
}
```

#### `POST /api/network/connections`
Almacena conexión en base de datos
```json
{
  "connection_type": "TCP",
  "local_address": "192.168.1.100",
  "local_port": 3000,
  "remote_address": "142.250.191.14", 
  "remote_port": 443,
  "status": "ESTABLISHED",
  "pid": 1234,
  "process_name": "chrome.exe"
}
```

### 📡 TCP Socket Server (Puerto 9999)

**Conexión TCP Raw**
```python
import socket
import json

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('localhost', 9999))

while True:
    data = client.recv(1024).decode('utf-8')
    metrics = json.loads(data)
    print(f"CPU: {metrics['cpu']}, RAM: {metrics['memoria']}")
```

## 🧪 Testing y Calidad de Código

### 🎯 Testing del Frontend

```bash
cd frontend_systeminfo

# Ejecutar tests unitarios
npm run test
# o con yarn
yarn test
# o con pnpm  
pnpm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests e2e (si están configurados)
npm run test:e2e
```

### 🐍 Testing del Backend

```bash
cd app

# Instalar dependencias de testing
pip install pytest pytest-cov pytest-mock

# Ejecutar tests unitarios
python -m pytest

# Ejecutar tests con coverage
python -m pytest --cov=. --cov-report=html

# Ejecutar tests específicos
python -m pytest test_utils.py -v
```

### � Análisis de Código con SonarQube

```bash
# 1. Iniciar SonarQube con Docker
docker-compose up -d sonar

# 2. Acceder a SonarQube
# URL: http://localhost:9000
# Usuario: admin
# Contraseña: admin (cambiar en primer uso)

# 3. Instalar SonarScanner
# Windows (con Chocolatey):
choco install sonarscanner-msbuild-netcore

# macOS (con Homebrew):
brew install sonar-scanner

# Linux (descarga manual):
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip

# 4. Configurar proyecto en sonar-project.properties
# (ya configurado en el proyecto)

# 5. Ejecutar análisis
sonar-scanner
```

**Configuración SonarQube (`sonar-project.properties`):**
```properties
sonar.projectKey=SystemInfo
sonar.projectName=SystemInfo - Sistema de Monitoreo
sonar.projectVersion=1.0
sonar.sources=app/,frontend_systeminfo/src/
sonar.exclusions=**/node_modules/**,**/__pycache__/**,**/build/**,**/dist/**
sonar.python.coverage.reportPaths=app/coverage.xml
sonar.javascript.lcov.reportPaths=frontend_systeminfo/coverage/lcov.info
```

### 🔍 Linting y Formateo

```bash
# Frontend - ESLint
cd frontend_systeminfo
npm run lint
npm run lint:fix

# Backend - Black y Flake8
cd app
pip install black flake8 mypy
black .
flake8 .
mypy .
```

### 📈 Métricas de Calidad

- **Cobertura de Código**: >80%
- **Complejidad Ciclomática**: <10
- **Duplicación de Código**: <3%
- **Vulnerabilidades**: 0 críticas
- **Code Smells**: <5 mayores

## 🚀 Despliegue y Producción

### 🐳 Despliegue con Docker

#### 1. Crear Dockerfile para Backend
```dockerfile
# app/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 5000 8765 9999

CMD ["python", "server.py"]
```

#### 2. Crear Dockerfile para Frontend
```dockerfile
# frontend_systeminfo/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### 3. Docker Compose Completo
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: systemop
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: adminadmin123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./app
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:adminadmin123@db:5432/systemop
    ports:
      - "5000:5000"
      - "8765:8765" 
      - "9999:9999"

  frontend:
    build: ./frontend_systeminfo
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
      - NEXT_PUBLIC_WEBSOCKET_URL=ws://backend:8765
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

```bash
# Ejecutar en producción
docker-compose -f docker-compose.prod.yml up -d
```

### ☁️ Despliegue en la Nube

#### Vercel (Frontend)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Configurar variables de entorno en Vercel
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_API_URL

# 3. Desplegar
cd frontend_systeminfo
vercel --prod
```

#### Railway/Render (Backend)
```bash
# 1. Crear requirements.txt
echo "psutil==5.9.6
flask==3.0.0
flask-cors==4.0.0
psycopg2-binary==2.9.8
websockets==12.0" > app/requirements.txt

# 2. Crear Procfile
echo "web: python server.py" > app/Procfile

# 3. Configurar variables de entorno en la plataforma
DATABASE_URL=postgresql://...
PORT=5000
```

#### AWS EC2 (Completo)
```bash
# 1. Configurar instancia EC2
sudo apt update
sudo apt install docker.io docker-compose nginx

# 2. Configurar dominio y SSL
sudo certbot --nginx -d tu-dominio.com

# 3. Configurar proxy reverso nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
    }
    
    location /ws {
        proxy_pass http://localhost:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 📊 Monitoreo en Producción

#### PM2 para Node.js
```bash
npm install -g pm2

# Configurar ecosystem
echo "module.exports = {
  apps: [{
    name: 'systeminfo-frontend',
    script: 'npm',
    args: 'start',
    cwd: './frontend_systeminfo',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}" > ecosystem.config.js

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Supervisor para Python
```bash
sudo apt install supervisor

# Configurar supervisor
sudo nano /etc/supervisor/conf.d/systeminfo.conf
```

```ini
[program:systeminfo-backend]
command=/path/to/venv/bin/python server.py
directory=/path/to/app
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/systeminfo.log
```

### 🔒 Seguridad en Producción

```bash
# 1. Configurar firewall
sudo ufw enable
sudo ufw allow 22,80,443,3000,5000/tcp

# 2. Configurar variables de entorno seguras
export DATABASE_URL="postgresql://..."
export SECRET_KEY="tu-clave-secreta-muy-larga"
export FIREBASE_PRIVATE_KEY="..."

# 3. Configurar rate limiting en nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

### 📋 Proceso de Contribución

1. **Fork del Proyecto**
   ```bash
   # Hacer fork en GitHub y clonar
   git clone https://github.com/tu-usuario/SystemInfo.git
   cd SystemInfo
   ```

2. **Configurar Upstream**
   ```bash
   git remote add upstream https://github.com/Antoni30/SystemInfo.git
   git fetch upstream
   ```

3. **Crear Rama de Feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # o
   git checkout -b fix/correccion-bug
   # o
   git checkout -b docs/mejora-documentacion
   ```

4. **Hacer Cambios**
   ```bash
   # Desarrollar la funcionalidad
   # Seguir las convenciones de código
   # Agregar tests si es necesario
   ```

5. **Commit y Push**
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad de X"
   git push origin feature/nueva-funcionalidad
   ```

6. **Crear Pull Request**
   - Ir a GitHub y crear PR
   - Describir los cambios claramente
   - Referenciar issues relacionados

### 📝 Convenciones de Código

#### Commits (Conventional Commits)
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltante, etc
refactor: refactorización de código
test: agregar tests faltantes
chore: actualizar dependencias, etc
```

#### Python (Backend)
```python
# Usar Black para formateo
black .

# Seguir PEP 8
# Usar type hints
def get_system_info() -> Dict[str, Any]:
    """Obtiene información del sistema."""
    return {}
```

#### TypeScript (Frontend)
```typescript
// Usar nombres descriptivos
interface SystemMetrics {
  cpuPercent: number;
  memoryPercent: number;
}

// Usar arrow functions para componentes
const CPUMonitor: React.FC<Props> = ({ data }) => {
  return <div>{data}</div>;
};
```

### 🐛 Reportar Bugs

Usa el [template de issue](https://github.com/Antoni30/SystemInfo/issues/new?template=bug_report.md):

```markdown
**Describe el bug**
Descripción clara del problema.

**Para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento Esperado**
Lo que debería pasar.

**Screenshots**
Si aplica, agregar capturas.

**Información del Sistema**
- OS: [ej. Windows 10]
- Browser: [ej. Chrome 91]
- Versión: [ej. 1.0.0]
```

### ✨ Sugerir Funcionalidades

Usa el [template de feature](https://github.com/Antoni30/SystemInfo/issues/new?template=feature_request.md):

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción del problema.

**Describe la solución que te gustaría**
Descripción clara de la funcionalidad.

**Describe alternativas consideradas**
Otras soluciones que consideraste.

**Contexto adicional**
Cualquier otro contexto o screenshots.
```

### 📊 Directrices de Desarrollo

1. **Código Limpio**: Seguir principios SOLID
2. **Testing**: Mantener >80% cobertura
3. **Documentación**: Comentar funciones complejas
4. **Performance**: Optimizar consultas y renders
5. **Seguridad**: No hardcodear secrets
6. **Accesibilidad**: Seguir estándares WCAG

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores y Reconocimientos

### 👨‍💻 Equipo de Desarrollo

- **[Antoni30](https://github.com/EdJGM)** - *Desarrollo Principal & Arquitectura*
  - Backend Python (Flask + WebSocket)
  - Base de datos PostgreSQL
  - Integración de APIs

### 🙏 Agradecimientos Especiales

#### 📚 Bibliotecas y Frameworks
- **[psutil](https://github.com/giampaolo/psutil)** - Por la excelente biblioteca de métricas del sistema
- **[Next.js Team](https://nextjs.org/)** - Por el increíble framework React
- **[Vercel](https://vercel.com/)** - Por la plataforma de despliegue
- **[Firebase](https://firebase.google.com/)** - Por los servicios de autenticación
- **[Recharts](https://recharts.org/)** - Por las hermosas visualizaciones
- **[Tailwind CSS](https://tailwindcss.com/)** - Por el framework CSS utilitario
- **[Radix UI](https://www.radix-ui.com/)** - Por los componentes primitivos accesibles

#### 🛠️ Herramientas de Desarrollo
- **[SonarQube](https://www.sonarqube.org/)** - Por el análisis de calidad de código
- **[Docker](https://www.docker.com/)** - Por la contenedorización
- **[Ngrok](https://ngrok.com/)** - Por los túneles de desarrollo
- **[PostgreSQL](https://www.postgresql.org/)** - Por la base de datos robusta

#### 🎨 Recursos de Diseño
- **[Heroicons](https://heroicons.com/)** - Por los iconos minimalistas
- **[React Icons](https://react-icons.github.io/react-icons/)** - Por la amplia colección de iconos
- **[Unsplash](https://unsplash.com/)** - Por las imágenes de fondo

### 🏫 Contexto Académico

Este proyecto fue desarrollado como parte del curso:
- **Materia**: Sistemas Operativos
- **Período**: Octubre 2024 - Marzo 2025
- **Parcial**: Tercer Parcial
- **Tipo**: Proyecto Final

### 🎯 Objetivos Académicos Logrados

- ✅ Implementación de comunicación entre procesos (IPC)
- ✅ Monitoreo de recursos del sistema operativo
- ✅ Manejo de sockets TCP y WebSocket
- ✅ Integración con base de datos
- ✅ Arquitectura cliente-servidor
- ✅ Desarrollo Full-Stack
- ✅ Containerización con Docker
- ✅ Análisis de calidad de código

### 🔧 Solución de Problemas Comunes

#### Frontend no conecta con Backend
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:5000/api/system/info

# Verificar WebSocket
wscat -c ws://localhost:8765
```

#### Error de Base de Datos
```bash
# Verificar conexión PostgreSQL
psql -U postgres -d systemop -c "SELECT version();"

# Recrear tablas
python -c "from app.server import init_db; init_db()"
```

#### Error de Permisos (Linux/macOS)
```bash
# Ejecutar con permisos de administrador
sudo python app/server.py
```

#### Problemas de Firewall
```bash
# Windows - Permitir puertos
netsh advfirewall firewall add rule name="SystemInfo" dir=in action=allow protocol=TCP localport=3000,5000,8765,9999

# Linux - UFW
sudo ufw allow 3000,5000,8765,9999/tcp
```

### 📊 Estado del Proyecto

| Componente | Estado | Versión | Última Actualización |
|------------|--------|---------|---------------------|
| 🎨 Frontend | ✅ Estable | 0.1.0 | 2025-01-17 |
| 🐍 Backend | ✅ Estable | 0.1.0 | 2025-01-17 |
| 🗄️ Database | ✅ Estable | 1.0 | 2025-01-17 |
| 🐳 Docker | ✅ Estable | 1.0 | 2025-01-17 |
| 📖 Docs | ✅ Completa | 1.0 | 2025-01-17 |

### 🚀 Roadmap Futuro

#### Versión 0.2.0 (Q2 2025)
- [ ] Autenticación OAuth (Google, GitHub)
- [ ] Alertas por email/SMS
- [ ] API REST más robusta
- [ ] Dashboard personalizable

#### Versión 0.3.0 (Q3 2025)
- [ ] Monitoreo de múltiples servidores
- [ ] Machine Learning para predicciones
- [ ] Mobile app (React Native)
- [ ] Integración con Prometheus/Grafana

#### Versión 1.0.0 (Q4 2025)
- [ ] Versión estable de producción
- [ ] Documentación completa
- [ ] Tests de integración completos
- [ ] Certificaciones de seguridad

---

**⭐ ¡No olvides darle una estrella al proyecto si te fue útil!**

## 📁 Estructura Completa del Proyecto

```
SystemInfo/
├── 📄 README.md                    # Documentación principal (este archivo)
├── 📄 CONTRIBUTING.md              # Guía de contribución
├── 📄 LICENSE                      # Licencia MIT del proyecto
├── 📄 SECURITY.md                  # Política de seguridad
├── 🚫 .gitignore                   # Archivos ignorados por Git
├── 🐳 compose.yaml                 # Docker Compose para servicios
├── 🌐 ngrok.yml                    # Configuración de túneles Ngrok
├── 🔍 sonar-project.properties     # Configuración SonarQube
├── 📡 tcp_con_webcoket.txt         # Documentación de protocolos
├── 📁 app/                         # Backend Python
│   ├── 🐍 server.py                # Servidor principal Flask + WebSocket
│   ├── 🔧 utils.py                 # Utilidades del sistema (psutil)
│   ├── 📋 requirements.txt         # Dependencias Python
│   └── 📦 __pycache__/             # Cache Python
└── 📁 frontend_systeminfo/         # Frontend Next.js
    ├── 📋 package.json             # Dependencias y scripts npm
    ├── 🔧 next.config.ts           # Configuración Next.js
    ├── 🎨 tailwind.config.ts       # Configuración Tailwind CSS
    ├── ⚙️ postcss.config.mjs       # Configuración PostCSS
    ├── 📝 tsconfig.json            # Configuración TypeScript
    ├── 🔍 eslint.config.mjs        # Configuración ESLint
    ├── 🌱 .env.example             # Variables de entorno de ejemplo
    ├── 🚫 .gitignore               # Ignorados específicos de Next.js
    ├── 📁 src/                     # Código fuente
    │   ├── 📁 app/                 # App Router Next.js
    │   ├── 📁 components/          # Componentes React
    │   ├── 📁 styles/              # Hojas de estilo
    │   └── 📁 utils/               # Utilidades frontend
    └── 📁 public/                  # Recursos estáticos
        ├── 🎨 images/              # Imágenes y fondos
        ├── favicon.png             # Favicon
        └── icon.png                # Icono de la aplicación
```
