#!/usr/bin/env python3
"""
Script para probar la conexión con Supabase
Ejecuta este script después de configurar tu archivo .env
"""

import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def test_supabase_connection():
    """Prueba la conexión con Supabase"""
    print("🔍 Probando conexión con Supabase...")
    
    # Verificar si existe la variable de entorno
    database_url = os.getenv('SUPABASE_DATABASE_URL')
    if not database_url:
        print("❌ Error: SUPABASE_DATABASE_URL no está configurada")
        print("📝 Crea un archivo .env en la carpeta backend/ con:")
        print("SUPABASE_DATABASE_URL=tu_url_aqui")
        return False
    
    print(f"✅ URL de conexión encontrada: {database_url[:50]}...")
    
    try:
        # Intentar importar psycopg2
        import psycopg2
        from psycopg2.extras import RealDictCursor
        print("✅ psycopg2 importado correctamente")
        
        # Intentar conectar
        print("🔌 Conectando a Supabase...")
        conn = psycopg2.connect(database_url)
        print("✅ Conexión establecida exitosamente!")
        
        # Probar una consulta simple
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()
            print(f"✅ PostgreSQL version: {version['version'][:50]}...")
            
            # Verificar que las tablas existen
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('usuarios', 'escaneos', 'reportes')
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            
            if tables:
                print("✅ Tablas encontradas:")
                for table in tables:
                    print(f"   - {table['table_name']}")
            else:
                print("❌ No se encontraron las tablas esperadas")
                return False
        
        conn.close()
        print("✅ Conexión cerrada correctamente")
        return True
        
    except ImportError:
        print("❌ Error: psycopg2 no está instalado")
        print("📦 Instala las dependencias con: pip install -r requirements.txt")
        return False
        
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        print("🔧 Verifica:")
        print("   1. Tu URL de conexión es correcta")
        print("   2. Tu IP está en la lista blanca de Supabase")
        print("   3. Tu contraseña es correcta")
        return False

def test_api_functions():
    """Prueba las funciones de la API"""
    print("\n🧪 Probando funciones de la API...")
    
    try:
        from backend.config.supabase_config import db
        
        # Probar consulta simple
        result = db.execute_one("SELECT COUNT(*) as count FROM usuarios")
        if result:
            print(f"✅ Usuarios en la base de datos: {result['count']}")
        else:
            print("✅ Conexión a través de la API funcionando")
            
        return True
        
    except Exception as e:
        print(f"❌ Error en funciones de API: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Iniciando pruebas de conexión con Supabase")
    print("=" * 50)
    
    # Probar conexión directa
    connection_ok = test_supabase_connection()
    
    if connection_ok:
        # Probar funciones de la API
        api_ok = test_api_functions()
        
        if api_ok:
            print("\n🎉 ¡Todas las pruebas pasaron!")
            print("✅ Tu backend está listo para usar con Supabase")
        else:
            print("\n⚠️  Conexión OK pero hay problemas con la API")
    else:
        print("\n❌ Problemas de conexión detectados")
        print("🔧 Revisa la configuración antes de continuar")
    
    print("\n" + "=" * 50) 