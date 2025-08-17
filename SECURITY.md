# 🛡️ Política de Seguridad - SystemInfo

## 📋 Versiones Soportadas

Actualmente mantenemos soporte de seguridad para las siguientes versiones:

| Versión | Soporte de Seguridad | Estado |
| ------- | -------------------- | ------ |
| 1.0.x   | ✅ | Soporte completo |
| 0.9.x   | ✅ | Soporte de seguridad |
| 0.8.x   | ❌ | No soportada |
| < 0.8   | ❌ | No soportada |

## 🚨 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en SystemInfo, por favor **NO** la reportes a través de issues públicos de GitHub.

### 📧 Contacto Seguro

**Para reportes de seguridad sensibles:**
- **Email**: [security@ejemplo.com](mailto:security@ejemplo.com)
- **Asunto**: `[SECURITY] SystemInfo - Descripción breve`
- **PGP Key**: [Clave pública disponible aquí]

### 📝 Información Requerida

Incluye la siguiente información en tu reporte:

1. **Descripción detallada** de la vulnerabilidad
2. **Pasos para reproducir** el problema
3. **Impacto potencial** de la vulnerabilidad
4. **Versión afectada** del software
5. **Entorno** donde se detectó (OS, versiones, etc.)
6. **Evidencia** (logs, screenshots, etc.) si está disponible

### ⏱️ Tiempo de Respuesta

- **Confirmación inicial**: Dentro de 48 horas
- **Evaluación completa**: Dentro de 7 días
- **Resolución**: Según severidad (ver tabla abajo)

| Severidad | Tiempo de Resolución | Descripción |
|-----------|---------------------|-------------|
| 🔴 Crítica | 24-72 horas | RCE, SQLi, escalada de privilegios |
| 🟠 Alta | 7 días | XSS persistente, exposición de datos |
| 🟡 Media | 30 días | CSRF, información disclosure |
| 🟢 Baja | 90 días | Divulgación menor de información |

## 🔒 Mejores Prácticas de Seguridad

### 🔐 Para Usuarios

#### Configuración Segura
```bash
# 1. Usar contraseñas fuertes para la base de datos
DB_PASSWORD=UnA_CoNtRaSeNa_MuY_SeGuRa_123!@#

# 2. Cambiar claves por defecto
SECRET_KEY=clave-aleatoria-de-minimo-32-caracteres

# 3. Usar HTTPS en producción
NEXT_PUBLIC_API_URL=https://tu-api-segura.com

# 4. Configurar firewall
sudo ufw enable
sudo ufw allow 22,80,443/tcp
sudo ufw deny 5432,9000/tcp  # Bases de datos solo local
```

#### Variables de Entorno
```bash
# ✅ CORRECTO - Usar variables de entorno
DATABASE_URL=${DATABASE_URL}

# ❌ INCORRECTO - Hardcodear credenciales
DATABASE_URL="postgresql://admin:123456@localhost/db"
```

### 🛡️ Para Desarrolladores

#### Validación de Entrada
```python
# Backend - Validar y sanitizar datos
import bleach
from marshmallow import Schema, fields, validate

class SystemMetricsSchema(Schema):
    cpu_percent = fields.Float(
        required=True, 
        validate=validate.Range(min=0, max=100)
    )
    
def sanitize_input(data: str) -> str:
    """Sanitiza entrada del usuario."""
    return bleach.clean(data, tags=[], strip=True)
```

#### Autenticación Segura
```typescript
// Frontend - Verificar tokens
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useAuthCheck = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return unsubscribe;
  }, []);
};
```

#### Conexiones Seguras
```python
# WebSocket - Validar origen
async def websocket_handler(websocket, path):
    origin = websocket.request_headers.get('origin')
    allowed_origins = ['http://localhost:3000', 'https://tu-dominio.com']
    
    if origin not in allowed_origins:
        await websocket.close(code=1008, reason="Origin not allowed")
        return
```

## 🚫 Vulnerabilidades Conocidas

### 🔍 CVE Tracking

Mantenemos un registro de vulnerabilidades conocidas:

| CVE ID | Severidad | Componente | Versión Afectada | Estado |
|--------|-----------|------------|------------------|--------|
| - | - | - | - | Sin CVEs reportados |

### 🔄 Actualizaciones de Dependencias

```bash
# Backend - Verificar vulnerabilidades
pip audit

# Frontend - Verificar vulnerabilidades  
npm audit
yarn audit

# Actualizar dependencias con vulnerabilidades
npm audit fix
pip install --upgrade package-name
```

## 📋 Checklist de Seguridad

### 🖥️ Para Deployment

- [ ] ✅ Variables de entorno configuradas correctamente
- [ ] ✅ Base de datos con credenciales seguras
- [ ] ✅ Firewall configurado apropiadamente
- [ ] ✅ HTTPS habilitado en producción
- [ ] ✅ Logs de seguridad configurados
- [ ] ✅ Backups automáticos configurados
- [ ] ✅ Rate limiting implementado
- [ ] ✅ Autenticación multifactor (MFA) habilitada
- [ ] ✅ Dependencias actualizadas a versiones seguras
- [ ] ✅ Certificados SSL válidos y actualizados

### 🔧 Para Desarrollo

- [ ] ✅ Secrets no hardcodeados en código
- [ ] ✅ Inputs validados y sanitizados
- [ ] ✅ Principio de menor privilegio aplicado
- [ ] ✅ Logs de seguridad implementados
- [ ] ✅ Tests de seguridad incluidos
- [ ] ✅ Code review de cambios sensibles
- [ ] ✅ Dependency scanning automatizado
- [ ] ✅ Static analysis configurado (SonarQube)

## ⚠️ Configuraciones Inseguras

### 🚨 NUNCA hacer esto:

```bash
# ❌ Credenciales en código
const dbConfig = {
  password: "123456",
  host: "production-db.com"
};

# ❌ Deshabilitar validación SSL
DATABASE_URL="postgresql://user:pass@host/db?sslmode=disable"

# ❌ Exponer puertos sensibles públicamente
docker run -p 5432:5432 postgres  # ¡Peligroso!

# ❌ Usar secretos por defecto
SECRET_KEY="default-secret-key"
```

### ✅ Hacer esto en su lugar:

```bash
# ✅ Variables de entorno
const dbConfig = {
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST
};

# ✅ SSL habilitado
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# ✅ Puertos internos solamente
docker run -p 127.0.0.1:5432:5432 postgres

# ✅ Secretos aleatorios generados
SECRET_KEY=$(openssl rand -hex 32)
```

## 📞 Contacto de Emergencia

**Para incidentes de seguridad críticos:**
- **Email 24/7**: [emergency@ejemplo.com](mailto:emergency@ejemplo.com)
- **Teléfono**: +1-XXX-XXX-XXXX (solo emergencias)
- **Discord**: Server de emergencia [Enlace]

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python Security Guide](https://python.org/doc/security/)

## 🔄 Actualizaciones de Política

Esta política se revisa trimestralmente. Última actualización: **Enero 2025**

---

**Recuerda**: La seguridad es responsabilidad de todos. Si ves algo sospechoso, reportalo.
