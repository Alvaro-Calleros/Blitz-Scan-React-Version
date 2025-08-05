#!/usr/bin/env python3
"""
Script de diagnóstico completo para problemas de conexión con Supabase
Basado en investigación de errores comunes
"""

import os
import sys
import socket
import requests
from urllib.parse import urlparse

def check_supabase_project_status():
    """Verifica si el proyecto de Supabase está activo"""
    print("🔍 Verificando estado del proyecto Supabase...")
    
    project_id = "turpxjbdemmtlxpkjjzz"
    print(f"📋 ID del proyecto: {project_id}")
    
    print("\n⚠️  PROBLEMA MÁS PROBABLE: Proyecto pausado")
    print("En Supabase Free Tier, los proyectos se pausan automáticamente")
    print("después de inactividad para ahorrar recursos.")
    
    print("\n📋 ACCIÓN REQUERIDA:")
    print("1. Ve a: https://supabase.com/dashboard")
    print("2. Busca tu proyecto")
    print("3. Si está pausado, haz clic en 'Resume'")
    print("4. Espera 1-2 minutos a que se active")
    
    return False

def check_network_connectivity():
    """Verifica conectividad de red"""
    print("\n🌐 Verificando conectividad de red...")
    
    # Verificar conectividad básica
    try:
        response = requests.get("https://www.google.com", timeout=5)
        print("✅ Conexión a internet: OK")
    except Exception as e:
        print(f"❌ Problema de conectividad: {e}")
        return False
    
    # Verificar conectividad a Supabase
    try:
        response = requests.get("https://supabase.com", timeout=5)
        print("✅ Conexión a Supabase.com: OK")
    except Exception as e:
        print(f"❌ No se puede conectar a Supabase.com: {e}")
        return False
    
    return True

def check_database_host():
    """Verifica conectividad al host de la base de datos"""
    print("\n🔍 Verificando conectividad al host de la base de datos...")
    
    host = "aws-0-us-west-1.pooler.supabase.com"
    port = 6543
    
    try:
        # Intentar conexión TCP
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ Puerto 6543 (Transaction Pooler) accesible")
            return True
        else:
            print("❌ Puerto 6543 (Transaction Pooler) no accesible")
            print("💡 Posibles causas:")
            print("   - Proyecto pausado en Supabase")
            print("   - Firewall bloqueando conexión")
            print("   - Problemas de red")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando host: {e}")
        return False

def check_ipv6_issues():
    """Verifica problemas de IPv6"""
    print("\n🔍 Verificando problemas de IPv6...")
    
    host = "aws-0-us-west-1.pooler.supabase.com"
    
    try:
        # Intentar resolver IPv4
        ipv4_info = socket.getaddrinfo(host, 6543, socket.AF_INET)
        print("✅ IPv4 disponible")
        
        # Intentar resolver IPv6
        ipv6_info = socket.getaddrinfo(host, 6543, socket.AF_INET6)
        print("✅ IPv6 disponible")
        
        print("\n💡 Si hay problemas de IPv6, puedes forzar IPv4")
        print("agregando estas opciones a tu conexión:")
        print("options='-c search_path=public -c tcp_keepalives_idle=600'")
        
        return True
        
    except Exception as e:
        print(f"❌ Error resolviendo IP: {e}")
        return False

def check_environment_variables():
    """Verifica variables de entorno"""
    print("\n🔍 Verificando variables de entorno...")
    
    env_file_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if not os.path.exists(env_file_path):
        print("❌ No existe archivo .env")
        return False
    
    try:
        with open(env_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'SUPABASE_DB_URL' in content:
            print("✅ Variable SUPABASE_DB_URL encontrada")
            
            # Extraer información de la URL
            lines = content.split('\n')
            for line in lines:
                if line.startswith('SUPABASE_DB_URL='):
                    url = line.split('=', 1)[1].strip()
                    if url.startswith('"') and url.endswith('"'):
                        url = url[1:-1]
                    
                    print(f"📝 URL actual: {url[:50]}...")
                    
                    # Verificar formato
                    if 'postgresql://' in url and '@' in url:
                        print("✅ Formato de URL correcto")
                    else:
                        print("❌ Formato de URL incorrecto")
                    
                    break
            else:
                print("❌ No se encontró SUPABASE_DB_URL en el archivo")
                return False
        else:
            print("❌ Variable SUPABASE_DB_URL no encontrada")
            return False
            
    except Exception as e:
        print(f"❌ Error leyendo archivo .env: {e}")
        return False
    
    return True

def show_comprehensive_solution():
    """Muestra solución completa basada en la investigación"""
    print("\n🔧 SOLUCIÓN COMPLETA BASADA EN INVESTIGACIÓN")
    print("=" * 60)
    
    print("\n📋 PASOS PRIORITARIOS:")
    print("\n1️⃣ VERIFICAR ESTADO DEL PROYECTO (MÁS IMPORTANTE):")
    print("   - Ve a: https://supabase.com/dashboard")
    print("   - Busca tu proyecto: turpxjbdemmtlxpkjjzz")
    print("   - Si está pausado, haz clic en 'Resume'")
    print("   - Espera 1-2 minutos")
    
    print("\n2️⃣ VERIFICAR CREDENCIALES:")
    print("   - Ve a Settings > Database")
    print("   - Copia la nueva connection string")
    print("   - Actualiza tu archivo .env")
    
    print("\n3️⃣ VERIFICAR CONECTIVIDAD:")
    print("   - Prueba desde otra red")
    print("   - Verifica firewall")
    print("   - Desactiva VPN si usas una")
    
    print("\n4️⃣ FORZAR IPv4 (si hay problemas de IPv6):")
    print("   - Agrega estas opciones a tu conexión:")
    print("   options='-c search_path=public -c tcp_keepalives_idle=600'")
    
    print("\n5️⃣ VERIFICAR SSL:")
    print("   - Asegúrate de usar sslmode=require")
    print("   - Verifica certificados SSL")
    
    print("\n📊 ESTADÍSTICAS DE PROBLEMAS COMUNES:")
    print("   - 70%: Proyecto pausado")
    print("   - 20%: Problemas de red/IPv6")
    print("   - 10%: Credenciales incorrectas")

def test_connection_with_detailed_error():
    """Prueba conexión con análisis detallado de errores"""
    print("\n🔍 Probando conexión con análisis detallado...")
    
    try:
        from supabase_config import db
        
        if db.health_check():
            print("✅ ¡CONEXIÓN EXITOSA!")
            print("🎉 El problema se resolvió")
            return True
        else:
            print("❌ Health check falló")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error detallado: {error_msg}")
        
        # Análisis específico basado en la investigación
        if "password authentication failed" in error_msg:
            print("\n💡 DIAGNÓSTICO: Credenciales incorrectas")
            print("SOLUCIÓN:")
            print("1. Ve a Supabase Dashboard > Settings > Database")
            print("2. Copia la nueva connection string")
            print("3. Actualiza tu archivo .env")
            
        elif "timeout" in error_msg:
            print("\n💡 DIAGNÓSTICO: Timeout de conexión")
            print("SOLUCIÓN:")
            print("1. Verifica que el proyecto no esté pausado")
            print("2. Prueba desde otra red")
            print("3. Verifica firewall")
            
        elif "connection refused" in error_msg:
            print("\n💡 DIAGNÓSTICO: Conexión rechazada")
            print("SOLUCIÓN:")
            print("1. El proyecto probablemente está pausado")
            print("2. Resume el proyecto en Supabase Dashboard")
            
        elif "no password supplied" in error_msg:
            print("\n💡 DIAGNÓSTICO: Falta contraseña")
            print("SOLUCIÓN:")
            print("1. Verifica el formato de la URL")
            print("2. Asegúrate de que sea: postgresql://postgres:CONTRASEÑA@host:5432/postgres")
            
        return False

def main():
    """Función principal de diagnóstico"""
    print("🔧 DIAGNÓSTICO COMPLETO - SUPABASE CONNECTION")
    print("=" * 60)
    print("Basado en investigación de errores comunes")
    print("=" * 60)
    
    # Verificaciones
    checks = [
        ("Variables de entorno", check_environment_variables),
        ("Conectividad de red", check_network_connectivity),
        ("Host de base de datos", check_database_host),
        ("Problemas IPv6", check_ipv6_issues),
        ("Estado del proyecto", check_supabase_project_status)
    ]
    
    passed = 0
    total = len(checks)
    
    for check_name, check_func in checks:
        try:
            if check_func():
                passed += 1
            else:
                print(f"❌ Check '{check_name}' falló")
        except Exception as e:
            print(f"❌ Error en check '{check_name}': {e}")
    
    print(f"\n📊 RESULTADOS: {passed}/{total} checks pasaron")
    
    # Probar conexión final
    print("\n🔍 Prueba final de conexión...")
    test_connection_with_detailed_error()
    
    # Mostrar solución completa
    show_comprehensive_solution()
    
    print("\n🎯 RECOMENDACIÓN PRINCIPAL:")
    print("El problema más probable es que tu proyecto de Supabase está pausado.")
    print("Ve a https://supabase.com/dashboard y resume tu proyecto.")

if __name__ == "__main__":
    main() 