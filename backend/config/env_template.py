# =====================================================
# TEMPLATE DE CONFIGURACIÓN DE ENTORNO
# =====================================================
# Copia este archivo como .env y configura tus variables

# URL de conexión a Supabase PostgreSQL (Transaction Pooler para IPv4)
SUPABASE_DB_URL = "postgresql://postgres.turpxjbdemmtlxpkjjzz:Sanichims_Is_Very_Gay_6-9@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Configuración de conexión
DB_CONNECT_TIMEOUT = 10
DB_POOL_MIN_CONNECTIONS = 1
DB_POOL_MAX_CONNECTIONS = 10

# Configuración de logging
LOG_LEVEL = "INFO"
LOG_DB_QUERIES = True

# Configuración de retry
DB_RETRY_MAX_ATTEMPTS = 3
DB_RETRY_DELAY = 1

# Configuración de Supabase (opcional para futuras expansiones)
SUPABASE_URL = "https://turpxjbdemmtlxpkjjzz.supabase.co"
SUPABASE_ANON_KEY = "your_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here" 