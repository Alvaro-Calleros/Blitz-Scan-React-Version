import os
import psycopg2
from psycopg2.extras import RealDictCursor

class SupabaseDB:
    def __init__(self):
        # Configuración directa de Supabase
        self.connection_string = "postgresql://postgres:0unAzjWbhKiiKT2q@db.ylwstbsiwkxtdgpicdaa.supabase.co:5432/postgres"
    
    def get_connection(self):
        """Obtiene una conexión a la base de datos de Supabase"""
        return psycopg2.connect(self.connection_string)
    
    def get_cursor(self, connection):
        """Obtiene un cursor que devuelve diccionarios en lugar de tuplas"""
        return connection.cursor(cursor_factory=RealDictCursor)
    
    def execute_query(self, query, params=None):
        """Ejecuta una consulta y devuelve los resultados"""
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cur:
                cur.execute(query, params)
                upper_query = query.strip().upper()
                if upper_query.startswith('SELECT'):
                    return cur.fetchall()
                elif 'RETURNING' in upper_query:
                    return cur.fetchone()
                else:
                    conn.commit()
                    return cur.rowcount
    
    def execute_one(self, query, params=None):
        """Ejecuta una consulta y devuelve un solo resultado"""
        with self.get_connection() as conn:
            with self.get_cursor(conn) as cur:
                cur.execute(query, params)
                if query.strip().upper().startswith('SELECT'):
                    return cur.fetchone()
                else:
                    conn.commit()
                    return cur.rowcount

# Instancia global de la base de datos
db = SupabaseDB() 