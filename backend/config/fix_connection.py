#!/usr/bin/env python3
"""
Script para diagnosticar y arreglar problemas de conexión con Supabase
"""

import os
import sys

def check_env_file():
    """Verifica si existe el archivo .env y su contenido"""
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    print("🔍 Verificando archivo .env...")
    
    if not os.path.exists(env_file_path):
        print("❌ No existe el archivo .env")
        print("📝 Creando archivo .env...")
        create_env_file()
        return False
    
    try:
        with open(env_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'TU_CONTRASEÑA_AQUI' in content:
            print("⚠️  El archivo .env tiene el placeholder de contraseña")
            print("Debes reemplazar 'TU_CONTRASEÑA_AQUI' con tu contraseña real")
            return False
        elif 'SUPABASE_DB_URL' not in content:
            print("❌ El archivo .env no tiene SUPABASE_DB_URL")
            return False
        else:
            print("✅ El archivo .env existe y tiene formato correcto")
            return True
            
    except Exception as e:
        print(f"❌ Error leyendo archivo .env: {e}")
        return False

def create_env_file():
    """Crea el archivo .env con la configuración básica"""
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
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
    
    try:
        with open(env_file_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ Archivo .env creado exitosamente")
        print(f"📁 Ubicación: {env_file_path}")
        return True
    except Exception as e:
        print(f"❌ Error creando archivo .env: {e}")
        return False

def show_supabase_instructions():
    """Muestra instrucciones detalladas para obtener la contraseña"""
    print("\n🔑 OBTENER CONTRASEÑA DE SUPABASE")
    print("=" * 50)
    print("\n📋 PASOS DETALLADOS:")
    print("\n1️⃣ Ve a Supabase Dashboard:")
    print("   https://supabase.com/dashboard")
    print("\n2️⃣ Selecciona tu proyecto:")
    print("   - Busca el proyecto con ID: ylwstbsiwkxtdgpicdaa")
    print("   - O busca por el nombre que le diste")
    print("\n3️⃣ Ve a Settings > Database:")
    print("   - En el menú lateral izquierdo, haz clic en 'Settings'")
    print("   - Luego haz clic en 'Database'")
    print("\n4️⃣ Busca la contraseña:")
    print("   - Busca la sección 'Connection string'")
    print("   - O busca 'Database password'")
    print("   - La contraseña está después de 'postgres:' y antes de '@'")
    print("\n5️⃣ Copia SOLO la contraseña:")
    print("   - NO copies toda la URL")
    print("   - Solo la parte que está entre 'postgres:' y '@'")
    print("\n📝 EJEMPLO:")
    print("   URL completa: postgresql://postgres:abc123xyz@host:5432/postgres")
    print("   Contraseña: abc123xyz")
    print("\n6️⃣ Edita el archivo .env:")
    print("   - Abre: backend/config/.env")
    print("   - Reemplaza 'TU_CONTRASEÑA_AQUI' con la contraseña real")
    print("   - Guarda el archivo")

def test_connection():
    """Prueba la conexión actual"""
    print("\n🔍 Probando conexión actual...")
    
    try:
        from supabase_config import db
        
        if db.health_check():
            print("✅ ¡CONEXIÓN EXITOSA!")
            print("🎉 Tu configuración está correcta")
            return True
        else:
            print("❌ Health check falló")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error de conexión: {error_msg}")
        
        if "no password supplied" in error_msg:
            print("\n💡 PROBLEMA: Falta contraseña en la URL")
            print("SOLUCIÓN: Asegúrate de que la URL tenga formato:")
            print("postgresql://postgres:CONTRASEÑA@host:5432/postgres")
            
        elif "password authentication failed" in error_msg:
            print("\n💡 PROBLEMA: Contraseña incorrecta")
            print("SOLUCIÓN: Verifica la contraseña en Supabase Dashboard")
            
        elif "timeout" in error_msg:
            print("\n💡 PROBLEMA: Timeout de conexión")
            print("SOLUCIÓN: Verifica tu conexión a internet")
            
        elif "connection refused" in error_msg:
            print("\n💡 PROBLEMA: Conexión rechazada")
            print("SOLUCIÓN: Verifica que el proyecto de Supabase esté activo")
            
        return False

def main():
    """Función principal"""
    print("🔧 DIAGNÓSTICO Y REPARACIÓN DE CONEXIÓN")
    print("=" * 50)
    
    # Verificar archivo .env
    if not check_env_file():
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. El archivo .env se creó automáticamente")
        print("2. Sigue las instrucciones para obtener la contraseña")
        show_supabase_instructions()
        return
    
    # Probar conexión
    if test_connection():
        print("\n🎉 ¡Todo funciona correctamente!")
        return
    
    # Mostrar instrucciones si hay problemas
    print("\n📋 ACCIONES REQUERIDAS:")
    print("1. Ve a Supabase Dashboard")
    print("2. Obtén la contraseña correcta")
    print("3. Edita backend/config/.env")
    print("4. Reemplaza 'TU_CONTRASEÑA_AQUI' con la contraseña real")
    print("5. Ejecuta: python test_security.py")
    
    show_supabase_instructions()

if __name__ == "__main__":
    main() 