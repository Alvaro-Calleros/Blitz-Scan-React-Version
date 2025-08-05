#!/usr/bin/env python3
"""
Script para ayudar a obtener la contraseña correcta de Supabase
"""

import os
import sys

def show_supabase_instructions():
    """Muestra las instrucciones para obtener la contraseña de Supabase"""
    
    print("🔑 OBTENER CONTRASEÑA DE SUPABASE")
    print("=" * 50)
    print("\n📋 PASOS PARA OBTENER LA CONTRASEÑA:")
    print("\n1️⃣ Ve a tu proyecto de Supabase:")
    print("   https://supabase.com/dashboard")
    print("\n2️⃣ Selecciona tu proyecto:")
    print("   - Busca el proyecto: ylwstbsiwkxtdgpicdaa")
    print("   - O el nombre que le diste al proyecto")
    print("\n3️⃣ Ve a Settings > Database:")
    print("   - En el menú lateral, haz clic en 'Settings'")
    print("   - Luego en 'Database'")
    print("\n4️⃣ Copia la contraseña:")
    print("   - Busca la sección 'Connection string'")
    print("   - O en 'Database password'")
    print("   - Copia la contraseña (no toda la URL)")
    print("\n5️⃣ Actualiza tu archivo .env:")
    print("   - Abre: backend/config/.env")
    print("   - Reemplaza 'TU_CONTRASEÑA_AQUI' con la contraseña real")
    print("\n📝 EJEMPLO:")
    print("   ANTES: postgresql://postgres:TU_CONTRASEÑA_AQUI@host:5432/postgres")
    print("   DESPUÉS: postgresql://postgres:abc123xyz@host:5432/postgres")
    
    print("\n⚠️  IMPORTANTE:")
    print("- La contraseña es sensible, no la compartas")
    print("- No subas el archivo .env al repositorio")
    print("- Agrega .env al .gitignore")
    
    print("\n🔍 UBICACIÓN DE LA CONTRASEÑA EN SUPABASE:")
    print("Dashboard > Tu Proyecto > Settings > Database > Connection string")
    print("O busca 'Database password' en la misma sección")

def check_current_env():
    """Verifica el estado actual del archivo .env"""
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if not os.path.exists(env_file_path):
        print("❌ No existe el archivo .env")
        print("Ejecuta primero: python setup_env.py")
        return False
    
    try:
        with open(env_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'TU_CONTRASEÑA_AQUI' in content:
            print("⚠️  El archivo .env aún tiene el placeholder de contraseña")
            print("Debes reemplazar 'TU_CONTRASEÑA_AQUI' con tu contraseña real")
            return False
        elif 'postgresql://postgres:' in content:
            print("✅ El archivo .env parece tener una contraseña configurada")
            return True
        else:
            print("❌ El archivo .env no tiene el formato correcto")
            return False
            
    except Exception as e:
        print(f"❌ Error leyendo archivo .env: {e}")
        return False

def test_connection_with_current_config():
    """Prueba la conexión con la configuración actual"""
    print("\n🔍 Probando conexión con configuración actual...")
    
    try:
        from supabase_config import db
        
        if db.health_check():
            print("✅ ¡CONEXIÓN EXITOSA!")
            print("🎉 Tu configuración está correcta")
            return True
        else:
            print("❌ Error de conexión")
            print("Verifica que la contraseña sea correcta")
            return False
            
    except Exception as e:
        print(f"❌ Error probando conexión: {e}")
        if "no password supplied" in str(e):
            print("\n💡 SOLUCIÓN:")
            print("La URL no tiene contraseña. Asegúrate de que sea:")
            print("postgresql://postgres:TU_CONTRASEÑA@host:5432/postgres")
        elif "password authentication failed" in str(e):
            print("\n💡 SOLUCIÓN:")
            print("La contraseña es incorrecta. Verifica en Supabase Dashboard")
        return False

def main():
    """Función principal"""
    print("🔑 CONFIGURACIÓN DE CONTRASEÑA SUPABASE")
    print("=" * 50)
    
    # Verificar estado actual
    if check_current_env():
        print("\n🔍 Probando conexión actual...")
        if test_connection_with_current_config():
            print("\n🎉 ¡Todo está funcionando correctamente!")
            return
    
    # Mostrar instrucciones
    show_supabase_instructions()
    
    print("\n" + "=" * 50)
    print("📋 RESUMEN DE ACCIONES:")
    print("1. Ve a Supabase Dashboard")
    print("2. Obtén la contraseña de Database Settings")
    print("3. Edita backend/config/.env")
    print("4. Reemplaza 'TU_CONTRASEÑA_AQUI' con la contraseña real")
    print("5. Ejecuta: python test_security.py")
    
    print("\n❓ ¿Necesitas ayuda?")
    print("- Verifica que estés en el proyecto correcto de Supabase")
    print("- Asegúrate de copiar solo la contraseña, no toda la URL")
    print("- La contraseña suele ser una cadena alfanumérica larga")

if __name__ == "__main__":
    main() 