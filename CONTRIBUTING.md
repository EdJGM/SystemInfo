# 🤝 Guía de Contribución - SystemInfo

¡Gracias por tu interés en contribuir a SystemInfo! Esta guía te ayudará a entender cómo participar en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#¿cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)

## 📜 Código de Conducta

Este proyecto se adhiere al código de conducta de [Contributor Covenant](https://www.contributor-covenant.org/). Al participar, se espera que mantengas este código.

## 🚀 ¿Cómo puedo contribuir?

### 🐛 Reportar Bugs

1. Busca primero en [Issues existentes](https://github.com/EdJGM/SystemInfo/issues)
2. Si no existe, crea un nuevo issue usando el template de bug report
3. Incluye toda la información solicitada en el template

### ✨ Sugerir Funcionalidades

1. Revisa las [Issues](https://github.com/EdJGM/SystemInfo/issues)
2. Crea un nuevo issue usando el template de feature request
3. Explica claramente el problema que resuelve tu propuesta

### 🔧 Contribuir con Código

1. Fork el repositorio
2. Crea una rama para tu contribución
3. Realiza tus cambios
4. Asegúrate de que los tests pasen
5. Crea un Pull Request

## ⚙️ Configuración del Entorno

### Prerrequisitos

```bash
# Herramientas necesarias
- Python 3.12+
- Node.js 18+
- PostgreSQL 13+
- Git
- Docker (opcional)
```

### Configuración Local

```bash
# 1. Fork y clonar
git clone https://github.com/EdJGM/SystemInfo.git
cd SystemInfo

# 2. Configurar upstream
git remote add upstream https://github.com/EdJGM/SystemInfo.git

# 3. Instalar dependencias Backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate     # Windows

pip install -r app/requirements.txt

# 4. Instalar dependencias Frontend
cd frontend_systeminfo
npm install

# 5. Configurar base de datos
createdb systemop
psql -d systemop -f database/schema.sql

# 6. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

## 🔄 Proceso de Desarrollo

### Flujo de Git

```bash
# 1. Actualizar main local
git checkout main
git pull upstream main

# 2. Crear rama de feature
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-bug
# o
git checkout -b docs/mejora-documentacion

# 3. Realizar cambios
# Desarrollar, testear, documentar

# 4. Commit con mensaje descriptivo
git add .
git commit -m "feat: agregar monitoreo de GPU"

# 5. Push y crear PR
git push origin feature/nombre-descriptivo
# Crear Pull Request en GitHub
```

### Convenciones de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, espacios, etc.
refactor: refactorización sin cambio de funcionalidad
test: agregar o modificar tests
chore: tareas de mantenimiento
perf: mejoras de rendimiento
ci: cambios en CI/CD
```

Ejemplos:
```bash
feat(backend): agregar endpoint para métricas de GPU
fix(frontend): corregir refresh de datos en tiempo real
docs(readme): actualizar instrucciones de instalación
refactor(utils): simplificar función get_system_info
test(api): agregar tests para endpoints de red
```

## 📏 Estándares de Código

### Python (Backend)

```python
# Usar Black para formateo
black app/

# Usar isort para imports
isort app/

# Seguir PEP 8 y usar type hints
def get_cpu_info() -> Dict[str, Union[float, int]]:
    """
    Obtiene información detallada del CPU.
    
    Returns:
        Dict con porcentaje de uso, núcleos y frecuencia
    """
    return {
        "percent": psutil.cpu_percent(),
        "count": psutil.cpu_count(),
        "freq": psutil.cpu_freq().current
    }

# Usar docstrings en formato Google
class SystemMonitor:
    """Monitor principal del sistema.
    
    Args:
        interval: Intervalo de actualización en segundos
        
    Attributes:
        running: Estado del monitor
    """
```

### TypeScript (Frontend)

```typescript
// Usar nombres descriptivos y PascalCase para componentes
interface SystemMetrics {
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

// Componentes funcionales con tipos explícitos
const CPUMonitor: React.FC<CPUMonitorProps> = ({ 
  data, 
  onUpdate 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="cpu-monitor">
      {/* JSX aquí */}
    </div>
  );
};

// Hooks personalizados con nombres descriptivos
const useSystemMetrics = (interval: number = 1000) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  
  useEffect(() => {
    // Lógica del hook
  }, [interval]);
  
  return { metrics, isLoading: !metrics };
};
```

### CSS/Tailwind

```css
/* Usar nombres de clase descriptivos */
.dashboard-container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6;
}

.metric-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700;
}

/* Responsive design */
.cpu-chart {
  @apply w-full h-64 sm:h-80 md:h-96;
}
```

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar todos los tests
pytest app/tests/

# Tests con coverage
pytest --cov=app --cov-report=html

# Test específico
pytest app/tests/test_utils.py::test_get_cpu_info -v
```

```python
# Ejemplo de test
import pytest
from unittest.mock import patch, MagicMock
from app.utils import get_system_resources

def test_get_system_resources():
    """Test que get_system_resources retorna datos válidos."""
    with patch('psutil.cpu_percent') as mock_cpu:
        mock_cpu.return_value = 45.0
        
        result = get_system_resources()
        
        assert 'cpu_percent' in result
        assert result['cpu_percent'] == 45.0
        assert isinstance(result['cpu_percent'], float)
```

### Frontend Tests

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests e2e
npm run test:e2e
```

```typescript
// Ejemplo de test con React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CPUMonitor from './CPUMonitor';

describe('CPUMonitor', () => {
  it('muestra el porcentaje de CPU correctamente', async () => {
    const mockData = { cpuPercent: 75.5 };
    
    render(<CPUMonitor data={mockData} />);
    
    expect(screen.getByText('75.5%')).toBeInTheDocument();
  });
  
  it('actualiza datos cuando cambia la prop', async () => {
    const { rerender } = render(<CPUMonitor data={{ cpuPercent: 50 }} />);
    
    rerender(<CPUMonitor data={{ cpuPercent: 80 }} />);
    
    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });
});
```

## 📚 Documentación

### Comentarios en Código

```python
# Comentarios para lógica compleja
def calculate_network_throughput(bytes_sent: int, bytes_recv: int, interval: float) -> Dict[str, float]:
    """
    Calcula el throughput de red en KB/s.
    
    Args:
        bytes_sent: Bytes enviados en el intervalo
        bytes_recv: Bytes recibidos en el intervalo  
        interval: Duración del intervalo en segundos
        
    Returns:
        Dict con throughput de envío y recepción en KB/s
        
    Raises:
        ValueError: Si interval es 0 o negativo
    """
    if interval <= 0:
        raise ValueError("El intervalo debe ser positivo")
    
    # Convertir bytes a KB y calcular por segundo
    sent_kbps = (bytes_sent / 1024) / interval
    recv_kbps = (bytes_recv / 1024) / interval
    
    return {
        "sent_kbps": round(sent_kbps, 2),
        "recv_kbps": round(recv_kbps, 2)
    }
```

### README y Wiki

- Mantener README.md actualizado
- Agregar ejemplos de uso
- Documentar nuevas funcionalidades en Wiki
- Incluir screenshots cuando sea relevante

## 🔍 Code Review

### Checklist para Pull Requests

- [ ] ✅ Tests pasan en CI/CD
- [ ] 📝 Código bien documentado
- [ ] 🧪 Tests incluidos para nueva funcionalidad
- [ ] 📚 Documentación actualizada
- [ ] 🎨 Código formateado correctamente
- [ ] 🔒 No hay secretos hardcodeados
- [ ] ⚡ Cambios no afectan performance negativamente
- [ ] 📱 Responsive design (frontend)
- [ ] ♿ Accesibilidad considerada (frontend)

### Proceso de Review

1. **Auto-review**: Revisa tu propio código antes de crear PR
2. **Description**: Describe claramente qué hace tu PR
3. **Links**: Referencia issues relacionados
4. **Screenshots**: Incluye capturas si hay cambios visuales
5. **Testing**: Explica cómo probar los cambios

## 🏷️ Versionado

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles en API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs compatibles

Ejemplo: `1.2.3`
- 1: Versión major
- 2: Versión minor  
- 3: Versión patch

## 🎯 Áreas de Contribución

### 🚀 Backend (Python)
- Nuevas métricas del sistema
- Optimización de performance
- Endpoints de API REST
- Integración con bases de datos
- Seguridad y autenticación

### 🎨 Frontend (React/TypeScript)
- Nuevos componentes de visualización
- Mejoras de UX/UI
- Optimización de rendimiento
- Responsive design
- Accesibilidad

### 📊 DevOps
- Mejoras en Docker
- CI/CD pipelines
- Monitoreo y logging
- Documentación de deployment

### 📚 Documentación
- Tutoriales
- Guías de API
- Ejemplos de uso
- Traducciones
