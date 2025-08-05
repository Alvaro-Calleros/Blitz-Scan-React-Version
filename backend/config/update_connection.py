#!/usr/bin/env python3
"""
Script para actualizar la conexión con el nuevo proyecto de Supabase
"""

import os
import shutil

def update_env_file():
    """Actualiza el archivo .env con la nueva conexión"""
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    template_file_path = os.path.join(os.path.dirname(__file__), 'env_template.py')
    
    print("🔄 Actualizando conexión con nuevo proyecto de Supabase...")
    
    # Leer el template actualizado
    try:
        with open(template_file_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
        
        # Extraer la URL de conexión del template
        lines = template_content.split('\n')
        new_connection_string = None
        
        for line in lines:
            if line.startswith('SUPABASE_DB_URL'):
                new_connection_string = line.split('=', 1)[1].strip().strip('"')
                break
        
        if not new_connection_string:
            print("❌ No se encontró SUPABASE_DB_URL en el template")
            return False
        
        print(f"📝 Nueva URL de conexión: {new_connection_string[:50]}...")
        
        # Crear contenido del archivo .env
        env_content = f"""# =====================================================
# CONFIGURACIÓN DE BASE DE DATOS SUPABASE
# =====================================================
# IMPORTANTE: Nunca subir este archivo al repositorio
# Agregar .env al .gitignore

# URL de conexión a Supabase PostgreSQL (Transaction Pooler para IPv4)
# FORMATO: postgresql://usuario:contraseña@host:puerto/database
SUPABASE_DB_URL={new_connection_string}

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
SUPABASE_URL=https://turpxjbdemmtlxpkjjzz.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
"""
        
        # Escribir el archivo .env
        with open(env_file_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ Archivo .env actualizado exitosamente")
        print(f"📁 Ubicación: {env_file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error actualizando archivo .env: {e}")
        return False

def test_new_connection():
    """Prueba la nueva conexión"""
    print("\n🔍 Probando nueva conexión...")
    
    try:
        from supabase_config import db
        
        if db.health_check():
            print("✅ ¡CONEXIÓN EXITOSA CON NUEVO PROYECTO!")
            print("🎉 El problema se resolvió")
            
            # Mostrar información de conexión
            info = db.get_connection_info()
            print(f"📊 Información de conexión: {info}")
            
            return True
        else:
            print("❌ Health check falló")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error de conexión: {error_msg}")
        
        if "password authentication failed" in error_msg:
            print("\n💡 PROBLEMA: Credenciales incorrectas")
            print("SOLUCIÓN: Verifica la contraseña en el nuevo proyecto")
            
        elif "timeout" in error_msg:
            print("\n💡 PROBLEMA: Timeout de conexión")
            print("SOLUCIÓN: Verifica que el nuevo proyecto esté activo")
            
        elif "connection refused" in error_msg:
            print("\n💡 PROBLEMA: Conexión rechazada")
            print("SOLUCIÓN: El nuevo proyecto puede estar pausado")
            
        return False

def main():
    """Función principal"""
    print("🔄 ACTUALIZACIÓN DE CONEXIÓN - NUEVO PROYECTO SUPABASE")
    print("=" * 60)
    
    # Actualizar archivo .env
    if not update_env_file():
        print("❌ No se pudo actualizar el archivo .env")
        return
    
    # Probar nueva conexión
    if test_new_connection():
        print("\n🎉 ¡ACTUALIZACIÓN EXITOSA!")
        print("✅ Tu aplicación ahora usa el nuevo proyecto de Supabase")
        print("✅ El problema del proyecto pausado se resolvió")
    else:
        print("\n⚠️  La conexión aún tiene problemas")
        print("💡 Verifica que el nuevo proyecto esté activo en Supabase Dashboard")

if __name__ == "__main__":
    main() 