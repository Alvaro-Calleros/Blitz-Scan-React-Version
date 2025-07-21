# backend/db_config.py
# Este archivo se mantiene por compatibilidad, pero ahora usa Supabase
from supabase_config import db

def init_mysql(app):
    """
    Función de compatibilidad - ahora usa Supabase en lugar de MySQL
    """
    print("⚠️  Nota: Esta función ahora usa Supabase en lugar de MySQL")
    return db

# Para compatibilidad con código existente
mysql = db