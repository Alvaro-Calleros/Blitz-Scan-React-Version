import os
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseDB:
    def __init__(self):
        """Inicializa la conexión a Supabase con configuración segura"""
        self._load_config()
        self._validate_config()
        logger.info("✅ Configuración de Supabase cargada correctamente")
    
    def _load_config(self):
        """Carga la configuración desde variables de entorno o valores por defecto"""
        # Intentar cargar desde archivo .env si existe
        try:
            from dotenv import load_dotenv
            load_dotenv()
            logger.info("📁 Archivo .env cargado")
        except ImportError:
            logger.warning("⚠️  python-dotenv no instalado, usando variables de entorno del sistema")
        
        # Cargar configuración
        self.connection_string = os.getenv('SUPABASE_DB_URL')
        self.connect_timeout = int(os.getenv('DB_CONNECT_TIMEOUT', 10))
        self.pool_min_connections = int(os.getenv('DB_POOL_MIN_CONNECTIONS', 1))
        self.pool_max_connections = int(os.getenv('DB_POOL_MAX_CONNECTIONS', 10))
        self.log_queries = os.getenv('LOG_DB_QUERIES', 'false').lower() == 'true'
        self.retry_max_attempts = int(os.getenv('DB_RETRY_MAX_ATTEMPTS', 3))
        self.retry_delay = int(os.getenv('DB_RETRY_DELAY', 1))
    
    def _validate_config(self):
        """Valida que la configuración sea correcta"""
        if not self.connection_string:
            raise ValueError("❌ SUPABASE_DB_URL no está configurada. Verifica tu archivo .env")
        
        if not self.connection_string.startswith('postgresql://'):
            raise ValueError("❌ SUPABASE_DB_URL debe ser una URL válida de PostgreSQL")
        
        logger.info("✅ Configuración validada correctamente")
    
    def get_connection(self):
        """Obtiene una conexión a la base de datos de Supabase"""
        try:
            # Parámetros adicionales para forzar IPv4 y mejorar la conectividad
            connection_params = {
                'dsn': self.connection_string,
                'connect_timeout': self.connect_timeout,
                'options': '-c search_path=public'
            }
            return psycopg2.connect(**connection_params)
        except Exception as e:
            logger.error(f"❌ Error conectando a Supabase: {e}")
            raise
    
    def get_cursor(self, connection):
        """Obtiene un cursor que devuelve diccionarios en lugar de tuplas"""
        return connection.cursor(cursor_factory=RealDictCursor)
    
    def _log_query(self, query, params=None):
        """Registra la consulta si está habilitado el logging"""
        if self.log_queries:
            query_preview = query[:100] + "..." if len(query) > 100 else query
            logger.info(f"🔍 Query: {query_preview}")
            if params:
                logger.info(f"📝 Params: {params}")
    
    def _retry_on_failure(self, func, *args, **kwargs):
        """Implementa retry automático para operaciones de base de datos"""
        for attempt in range(self.retry_max_attempts):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if attempt == self.retry_max_attempts - 1:
                    logger.error(f"❌ Error después de {self.retry_max_attempts} intentos: {e}")
                    raise e
                logger.warning(f"⚠️  Intento {attempt + 1} falló, reintentando en {self.retry_delay * (2 ** attempt)}s...")
                import time
                time.sleep(self.retry_delay * (2 ** attempt))
    
    def execute_query(self, query, params=None):
        """Ejecuta una consulta y devuelve los resultados con retry automático"""
        def _execute():
            with self.get_connection() as conn:
                with self.get_cursor(conn) as cur:
                    self._log_query(query, params)
                    cur.execute(query, params)
                    upper_query = query.strip().upper()
                    if upper_query.startswith('SELECT'):
                        result = cur.fetchall()
                        logger.info(f"✅ Query SELECT ejecutado, {len(result)} filas retornadas")
                        return result
                    elif 'RETURNING' in upper_query:
                        result = cur.fetchone()
                        logger.info("✅ Query con RETURNING ejecutado")
                        return result
                    else:
                        conn.commit()
                        rowcount = cur.rowcount
                        logger.info(f"✅ Query modificado ejecutado, {rowcount} filas afectadas")
                        return rowcount
        
        return self._retry_on_failure(_execute)
    
    def execute_one(self, query, params=None):
        """Ejecuta una consulta y devuelve un solo resultado con retry automático"""
        def _execute():
            with self.get_connection() as conn:
                with self.get_cursor(conn) as cur:
                    self._log_query(query, params)
                    cur.execute(query, params)
                    if query.strip().upper().startswith('SELECT'):
                        result = cur.fetchone()
                        logger.info("✅ Query SELECT ONE ejecutado")
                        return result
                    else:
                        conn.commit()
                        rowcount = cur.rowcount
                        logger.info(f"✅ Query modificado ejecutado, {rowcount} filas afectadas")
                        return rowcount
        
        return self._retry_on_failure(_execute)
    
    def health_check(self):
        """Verifica la salud de la conexión a la base de datos"""
        try:
            result = self.execute_one("SELECT 1 as health")
            is_healthy = result and result['health'] == 1
            if is_healthy:
                logger.info("✅ Health check: Base de datos conectada correctamente")
            else:
                logger.error("❌ Health check: Respuesta inesperada de la base de datos")
            return is_healthy
        except Exception as e:
            logger.error(f"❌ Health check falló: {e}")
            return False
    
    def get_connection_info(self):
        """Obtiene información de la conexión (sin credenciales sensibles)"""
        try:
            # Extraer información de la URL sin mostrar credenciales
            url_parts = self.connection_string.split('@')
            if len(url_parts) == 2:
                host_part = url_parts[1]
                host = host_part.split('/')[0]
                database = host_part.split('/')[1] if '/' in host_part else 'unknown'
                return {
                    'host': host,
                    'database': database,
                    'timeout': self.connect_timeout,
                    'pool_min': self.pool_min_connections,
                    'pool_max': self.pool_max_connections
                }
        except Exception:
            pass
        return {'error': 'No se pudo parsear la información de conexión'}

# Instancia global de la base de datos
db = SupabaseDB()

# Verificar conexión al importar
if __name__ == "__main__":
    print("🔍 Verificando conexión a Supabase...")
    if db.health_check():
        print("✅ Conexión exitosa!")
        info = db.get_connection_info()
        print(f"📊 Información de conexión: {info}")
    else:
        print("❌ Error de conexión") 