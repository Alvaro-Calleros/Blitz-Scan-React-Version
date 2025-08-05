#!/usr/bin/env python3
"""
Script para probar la conexión con Supabase Transaction Pooler
Soluciona problemas de IPv4 con conexión directa
"""

import os
import socket
import requests

def test_pooler_connection():
    """Prueba la conexión al Transaction Pooler"""
    print("🔍 Probando conexión al Transaction Pooler...")
    
    host = "aws-0-us-west-1.pooler.supabase.com"
    port = 6543
    
    try:
        # Intentar conexión TCP al pooler
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ Puerto 6543 (Transaction Pooler) accesible")
            return True
        else:
            print("❌ Puerto 6543 (Transaction Pooler) no accesible")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando pooler: {e}")
        return False

def test_database_connection():
    """Prueba la conexión completa a la base de datos"""
    print("\n🔍 Probando conexión completa a la base de datos...")
    
    try:
        from supabase_config import db
        
        if db.health_check():
            print("✅ ¡CONEXIÓN EXITOSA CON TRANSACTION POOLER!")
            print("🎉 El problema de IPv4 se resolvió")
            
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
            print("SOLUCIÓN: Verifica la contraseña en el pooler")
            
        elif "timeout" in error_msg:
            print("\n💡 PROBLEMA: Timeout de conexión")
            print("SOLUCIÓN: Verifica que el proyecto esté activo")
            
        elif "connection refused" in error_msg:
            print("\n💡 PROBLEMA: Conexión rechazada")
            print("SOLUCIÓN: Verifica que el pooler esté habilitado")
            
        return False

def show_pooler_benefits():
    """Muestra los beneficios del Transaction Pooler"""
    print("\n📊 BENEFICIOS DEL TRANSACTION POOLER:")
    print("=" * 50)
    print("✅ Compatible con IPv4")
    print("✅ Mejor rendimiento para conexiones cortas")
    print("✅ Manejo automático de conexiones")
    print("✅ Menor latencia")
    print("✅ Ideal para aplicaciones web")

def main():
    """Función principal"""
    print("🔧 PRUEBA DE CONEXIÓN - TRANSACTION POOLER")
    print("=" * 60)
    print("Solución para problemas de IPv4 con Supabase")
    print("=" * 60)
    
    # Probar conectividad al pooler
    if not test_pooler_connection():
        print("\n❌ No se puede conectar al Transaction Pooler")
        print("💡 Verifica que el pooler esté habilitado en Supabase Dashboard")
        return
    
    # Probar conexión completa
    if test_database_connection():
        print("\n🎉 ¡CONEXIÓN EXITOSA!")
        print("✅ Tu aplicación ahora usa el Transaction Pooler")
        print("✅ Los problemas de IPv4 se resolvieron")
        show_pooler_benefits()
    else:
        print("\n⚠️  La conexión aún tiene problemas")
        print("💡 Verifica la configuración del pooler")

if __name__ == "__main__":
    main() 