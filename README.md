# 🔍 Blitz Scan - Plataforma de Ciberseguridad Web

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-orange.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC.svg)](https://tailwindcss.com/)

**Blitz Scan** es una plataforma integral de ciberseguridad web que combina herramientas de escaneo avanzadas con inteligencia artificial para detectar vulnerabilidades, analizar infraestructura y proporcionar recomendaciones de seguridad en tiempo real.

## 🌟 Características Principales

### 🔧 Herramientas de Escaneo
- **Fuzzing Web**: Búsqueda de directorios y archivos ocultos
- **Nmap Scan**: Escaneo de puertos y servicios de infraestructura
- **WHOIS Lookup**: Información detallada del dominio y registrante
- **Subfinder**: Enumeración de subdominios
- **ParamSpider**: Extracción de parámetros vulnerables
- **WhatWeb**: Fingerprinting de tecnologías web
- **theHarvester**: Recolección de correos y hosts públicos

### 🤖 Inteligencia Artificial Integrada
- **BlitzScanIA**: Asistente de ciberseguridad con análisis contextual
- **Reportes Automáticos**: Generación de reportes de seguridad estructurados
- **Análisis de Vulnerabilidades**: Identificación y clasificación de riesgos
- **Recomendaciones Personalizadas**: Consejos específicos según el tipo de escaneo

### 📊 Gestión de Datos
- **Base de Datos Supabase**: Almacenamiento seguro y escalable
- **Historial de Escaneos**: Seguimiento completo de todas las actividades
- **Reportes PDF**: Exportación de resultados en formato profesional
- **Gestión de Usuarios**: Sistema de autenticación y perfiles

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18.3.1** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **React Router** para navegación
- **React Query** para gestión de estado
- **Recharts** para visualizaciones

### Backend
- **Flask** (Python) para API REST
- **Supabase** como base de datos PostgreSQL
- **psycopg2** para conexión a base de datos
- **OpenAI API** para funcionalidades de IA

### Herramientas de Seguridad
- **Nmap** para escaneo de puertos
- **Fuzzing** para descubrimiento de directorios
- **WHOIS** para información de dominios
- **Subfinder** para enumeración de subdominios
- **ParamSpider** para extracción de parámetros
- **WhatWeb** para fingerprinting
- **theHarvester** para OSINT

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.8+
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Alvaro-Calleros/blitzscan.git
cd Blitz-Scan-React-Version
```

### 2. Instalar Dependencias Frontend
```bash
npm install
```

### 3. Instalar Dependencias Backend
```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en el directorio raíz:
```env
# OpenAI API Key (opcional, para funcionalidades de IA)
OPENAI_API_KEY=tu_api_key_aqui

# Configuración de Supabase (ya configurada en el proyecto)
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_key_de_supabase
```

### 5. Inicializar Base de Datos (ya configurada en el proyecto)

Ejecutar los scripts SQL en Supabase:
```sql
-- Ejecutar los archivos en backend/queries/
-- basic_new_tables.sql
-- add_new_scan_tables.sql
-- add_soft_delete_columns.sql
-- update_profile_image_column.sql
```

### 6. Instalar y Configurar Herramientas de Seguridad

#### Nmap
```bash
# Windows
# Descargar desde: https://nmap.org/download.html
# Instalar en: C:\Program Files (x86)\Nmap\

# Linux/macOS
sudo apt-get install nmap  # Ubuntu/Debian
brew install nmap          # macOS
```

#### Dirsearch
```bash
# Clonar repositorio
git clone https://github.com/maurosoria/dirsearch.git
# Mover a: C:\Users\[usuario]\dirsearch\ (Windows)
# O configurar ruta en server/app.py línea 168
```

#### Subfinder
```bash
# Instalar Go primero: https://golang.org/dl/
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
# Agregar al PATH o configurar ruta completa
```

#### ParamSpider
```bash
# Clonar repositorio
git clone https://github.com/devanshbatham/ParamSpider.git
# Mover a: ./ParamSpider/ (en el directorio del proyecto)
# O configurar ruta en server/app.py línea 584
```

#### theHarvester
```bash
# Clonar repositorio
git clone https://github.com/laramies/theHarvester.git
# Mover a: ./theHarvester/ (en el directorio del proyecto)
# O configurar ruta en server/app.py línea 612
```

#### Python Dependencies
```bash
pip install whois requests beautifulsoup4
```

### 7. Configurar Rutas de Acceso

Editar `server/app.py` y actualizar las siguientes rutas según tu sistema:

```python
# Línea 147: Ruta de Nmap
r'C:\Program Files (x86)\Nmap\nmap.exe'  # Windows
# Cambiar a: '/usr/bin/nmap'  # Linux/macOS

# Línea 167-168: Ruta de Python y Dirsearch
r'C:\Users\alvar\AppData\Local\Programs\Python\Python313\python.exe',
r'C:\Users\alvar\dirsearch\dirsearch.py',
# Cambiar a tus rutas locales

# Línea 584: Ruta de ParamSpider
cwd=r'C:\Users\alvar\Desktop\BLITZ_SCAN\Blitz-Scan-React-Version\ParamSpider'
# Cambiar a: './ParamSpider'  # Ruta relativa

# Línea 612: Ruta de theHarvester
cwd=r'C:\Users\alvar\Desktop\BLITZ_SCAN\Blitz-Scan-React-Version\theHarvester'
# Cambiar a: './theHarvester'  # Ruta relativa
```

### 8. Configurar Servidor de Herramientas

El proyecto incluye un servidor adicional (`server/app.py`) que maneja las herramientas de seguridad directamente:

```bash
# Iniciar servidor de herramientas (puerto 5000)
cd server
python app.py
```

**Endpoints disponibles:**
- `POST /escanear` - Escaneo Nmap
- `POST /dir` - Descubrimiento de directorios (Dirsearch)
- `POST /whois` - Información WHOIS
- `POST /subfinder` - Enumeración de subdominios
- `POST /whatweb` - Fingerprinting de tecnologías
- `POST /paramspider` - Extracción de parámetros
- `POST /theharvester` - Recolección OSINT

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:5000/escanear \
  -H "Content-Type: application/json" \
  -d '{"objetivo": "example.com"}'
```

## 🏃‍♂️ Ejecución

### Desarrollo

1. **Iniciar Backend** (puerto 3001):
```bash
cd backend
python api.py
```

2. **Iniciar Frontend** (puerto 8080):
```bash
npm run dev
```

3. **Acceder a la aplicación**:
```
http://localhost:8080
```

### Producción

1. **Build del Frontend**:
```bash
npm run build
```

2. **Desplegar Backend**:
```bash
cd backend
python api.py
```

## 🎯 Uso

### 1. Registro e Inicio de Sesión
- Crear cuenta en `/register`
- Iniciar sesión en `/login`
- Acceder al perfil en `/profile`

### 2. Realizar Escaneos
1. Navegar a `/scanner`
2. Seleccionar categoría de escaneo:
   - **Web**: Fuzzing, Subfinder, ParamSpider
   - **Infraestructura**: Nmap
   - **Información**: WHOIS, theHarvester, WhatWeb
3. Ingresar URL objetivo
4. Ejecutar escaneo
5. Revisar resultados en tiempo real

### 3. Análisis con IA
- Usar el chat integrado para consultas
- Generar reportes automáticos
- Obtener recomendaciones de seguridad
- Analizar vulnerabilidades específicas

### 4. Gestión de Resultados
- Guardar escaneos en la base de datos
- Exportar reportes en PDF
- Ocultar escaneos sensibles
- Ver historial completo

## 🏗️ Estructura del Proyecto

```
Blitz-Scan-React-Version/
├── src/                          # Frontend React
│   ├── components/               # Componentes UI
│   ├── pages/                   # Páginas principales
│   ├── contexts/                # Contextos de React
│   ├── hooks/                   # Hooks personalizados
│   ├── utils/                   # Utilidades y lógica
│   └── lib/                     # Configuraciones
├── backend/                     # API Flask
│   ├── api.py                   # Endpoints principales
│   ├── config/                  # Configuraciones
│   ├── queries/                 # Scripts SQL
│   └── uploads/                 # Archivos subidos
├── ParamSpider/                 # Herramienta de parámetros
├── WhatWeb/                     # Herramienta de fingerprinting
├── theHarvester/                # Herramienta OSINT
└── public/                      # Assets estáticos
```

## 🔧 Configuración Avanzada

### Personalizar Herramientas de Escaneo
Las herramientas están configuradas en `src/utils/scanUtils.ts`:
- Ajustar timeouts y configuraciones
- Agregar nuevas herramientas
- Modificar parámetros de escaneo

### Configurar IA
En `src/utils/blitzScanAI.ts`:
- Personalizar prompts
- Agregar nuevos tipos de consulta
- Configurar contexto de conversación

### Base de Datos
En `backend/config/supabase_config.py`:
- Configurar conexión a Supabase
- Ajustar esquemas de base de datos
- Optimizar consultas

## 🛡️ Seguridad

### Medidas Implementadas
- **Autenticación**: Sistema de login seguro
- **Validación**: Verificación de inputs
- **CORS**: Configuración de origen cruzado
- **Sanitización**: Limpieza de datos de entrada
- **Soft Delete**: Eliminación lógica de datos

### Buenas Prácticas
- Usar HTTPS en producción
- Configurar rate limiting
- Implementar logging de seguridad
- Mantener dependencias actualizadas
- Realizar auditorías regulares

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores y Desarrolladores

### 🚀 Equipo Principal
- **Alvaro Calleros** - *Desarrollo inicial y arquitectura* - [Alvaro-Calleros](https://github.com/Alvaro-Calleros)
  - Frontend React/TypeScript
  - Backend Flask
  - Integración de herramientas de seguridad al frontend
  - Sistema de IA BlitzScanIA
- **Santiago Gonzalez** - *Integracion de herramientas en escaneo* - [santijuan24](https://github.com/santijuan24)
  - Integración de herramientas de seguridad
  - Pentester Certificado que valido funcionalidad de cada herramienta implementada
- **Luis Fernando Cristerna** - *Conexion de api-key con openAI* - [fcristerna](https://github.com/fcristerna)
  - Sistema de IA BlitzScanIA
- **Luis Arturo Morales** - *Diseño de pagina principal, terminos, register y login* - [luarmoro123](https://github.com/luarmoro123)
  - Frontend React/TypeScript

### 🛠️ Herramientas de Seguridad Utilizadas
- **Dirsearch (Fuzzing)** - *Descubrimiento de directorios y archivos ocultos* - [Mauro Soria](https://github.com/maurosoria/dirsearch)
- **Nmap** - *Escaneo de puertos y servicios* - [Gordon Lyon](https://nmap.org/)
- **Subfinder** - *Enumeración de subdominios* - [ProjectDiscovery](https://github.com/projectdiscovery/subfinder)
- **ParamSpider** - *Extracción de parámetros* - [Devansh Batham](https://github.com/devanshbatham/ParamSpider)
- **theHarvester** - *Recolección OSINT* - [Laramie](https://github.com/laramies/theHarvester)
- **WhatWeb** - *Fingerprinting web* - [Andrew Horton](https://github.com/urbanadventurer/WhatWeb)

### 🎨 Componentes UI
- **Shadcn/ui** - *Componentes de interfaz* - [Shadcn](https://ui.shadcn.com/)
- **Tailwind CSS** - *Framework de estilos* - [Adam Wathan](https://tailwindcss.com/)
- **Lucide React** - *Iconografía* - [Lucide](https://lucide.dev/)

### 🔧 Tecnologías de Desarrollo
- **React 18** - *Framework frontend* - [Meta](https://react.dev/)
- **TypeScript** - *Lenguaje tipado* - [Microsoft](https://www.typescriptlang.org/)
- **Vite** - *Build tool* - [Evan You](https://vitejs.dev/)
- **Flask** - *Framework backend* - [Pallets](https://flask.palletsprojects.com/)
- **Supabase** - *Base de datos* - [Supabase](https://supabase.com/)

## 🙏 Agradecimientos

### 🎯 Comunidad de Ciberseguridad
- **OWASP** - Por las mejores prácticas de seguridad web
- **HackerOne** - Por inspirar metodologías de testing
- **Bugcrowd** - Por las técnicas de reconnaissance
- **CVE Database** - Por mantener la base de datos de vulnerabilidades

### 🛠️ Herramientas de Código Abierto
- **Nmap Security Scanner** - Escaneo de red profesional
- **Dirsearch** - Descubrimiento de directorios web
- **Subfinder** - Enumeración de subdominios
- **ParamSpider** - Extracción de parámetros vulnerables
- **theHarvester** - Recolección de información OSINT
- **WhatWeb** - Fingerprinting de tecnologías web

### 🎨 Frameworks y Librerías
- **React Team** - Framework frontend revolucionario
- **Vite** - Build tool de próxima generación
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes de interfaz elegantes
- **Flask** - Microframework web minimalista
- **Supabase** - Backend-as-a-Service moderno

### 🤝 Contribuidores y Testers
- Comunidad de desarrolladores de seguridad
- Testers beta que probaron la aplicación
- Revisores de código y documentación
- Mentores y asesores técnicos

### 📚 Recursos Educativos
- **PortSwigger Web Security Academy** - Recursos de aprendizaje
- **HackTricks** - Técnicas de pentesting
- **PayloadsAllTheThings** - Payloads de testing
- **OWASP Testing Guide** - Guía de testing de seguridad

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación técnica

---

**⚠️ Descargo de Responsabilidad**: Esta herramienta está diseñada para uso ético y legal. Los usuarios son responsables de cumplir con todas las leyes y regulaciones aplicables al realizar escaneos de seguridad.

**🔒 Uso Ético**: Solo utilice esta herramienta en sistemas que posea o tenga autorización explícita para probar.
