# Blitz Scan Backend

## Configuración de Variables de Entorno

Para que el backend funcione correctamente, necesitas configurar las siguientes variables de entorno:

### 1. Crear archivo `.env`

Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```env
# OpenAI API Key
OPENAI_API_KEY=tu_clave_api_de_openai_aqui
```

### 2. Obtener una clave de API de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Inicia sesión o crea una cuenta
3. Ve a la sección "API Keys"
4. Crea una nueva clave de API
5. Copia la clave y pégala en tu archivo `.env`

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Ejecutar el servidor

```bash
python api.py
```

## Seguridad

- **NUNCA** subas tu archivo `.env` al repositorio
- El archivo `.env` ya está incluido en `.gitignore`
- Siempre usa variables de entorno para las claves de API
