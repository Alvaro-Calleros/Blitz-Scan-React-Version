#!/usr/bin/env python3
"""
Script para configurar variables de entorno para BlitzScan
"""

import os
import sys

def create_env_file():
    """Crea el archivo .env con la configuración por defecto"""
    
    env_content = """# =====================================================
# CONFIGURACIÓN DE BASE DE DATOS SUPABASE
# =====================================================
# IMPORTANTE: Nunca subir este archivo al repositorio
# Agregar .env al .gitignore

# URL de conexión a Supabase PostgreSQL
# FORMATO: postgresql://usuario:contraseña@host:puerto/database
SUPABASE_DB_URL=postgresql://postgres:TU_CONTRASEÑA_AQUI@db.ylwstbsiwkxtdgpicdaa.supabase.co:5432/postgres

# Configuración de conexión
DB_CONNECT_TIMEOUT=10
DB_POOL_MIN_CONNECTIONS=1
DB_POOL_MAX_CONNECTIONS=10

# Configuración de logging
LOG_LEVEL=INFO
LOG_DB_QUERIES=true

# Configuración de retry
DB_RETRY_MAX_ATTEMPTS=3
DB_RETRY_DELAY=1

# Configuración de Supabase (opcional para futuras expansiones)
SUPABASE_URL=https://ylwstbsiwkxtdgpicdaa.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
"""
    
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_file_path):
        print("⚠️  El archivo .env ya existe")
        response = input("¿Deseas sobrescribirlo? (y/N): ")
        if response.lower() != 'y':
            print("❌ Operación cancelada")
            return False
    
    try:
        with open(env_file_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ Archivo .env creado exitosamente")
        print(f"📁 Ubicación: {env_file_path}")
        print("\n⚠️  IMPORTANTE: Debes editar el archivo .env y reemplazar 'TU_CONTRASEÑA_AQUI' con tu contraseña real de Supabase")
        return True
    except Exception as e:
        print(f"❌ Error creando archivo .env: {e}")
        return False

def check_dependencies():
    """Verifica que las dependencias necesarias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    missing_deps = []
    
    try:
        import psycopg2
        print("✅ psycopg2 instalado")
    except ImportError:
        missing_deps.append("psycopg2")
        print("❌ psycopg2 no instalado")
    
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv instalado")
    except ImportError:
        missing_deps.append("python-dotenv")
        print("❌ python-dotenv no instalado")
    
    if missing_deps:
        print(f"\n⚠️  Dependencias faltantes: {', '.join(missing_deps)}")
        print("Instala las dependencias con:")
        print(f"pip install {' '.join(missing_deps)}")
        return False
    
    print("✅ Todas las dependencias están instaladas")
    return True

def test_connection():
    """Prueba la conexión a la base de datos"""
    print("\n🔍 Probando conexión a Supabase...")
    
    try:
        from supabase_config import db
        
        if db.health_check():
            print("✅ Conexión exitosa!")
            info = db.get_connection_info()
            print(f"📊 Información de conexión: {info}")
            return True
        else:
            print("❌ Error de conexión")
            return False
            
    except Exception as e:
        print(f"❌ Error probando conexión: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Configurando BlitzScan para Supabase...")
    print("=" * 50)
    
    # Verificar dependencias
    if not check_dependencies():
        print("\n❌ Instala las dependencias faltantes antes de continuar")
        sys.exit(1)
    
    # Crear archivo .env
    print("\n📝 Configurando variables de entorno...")
    if create_env_file():
        print("✅ Variables de entorno configuradas")
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. Edita el archivo .env en backend/config/")
        print("2. Reemplaza 'TU_CONTRASEÑA_AQUI' con tu contraseña real de Supabase")
        print("3. Ejecuta: python test_security.py")
    else:
        print("❌ Error configurando variables de entorno")
        sys.exit(1)

if __name__ == "__main__":
    main() 