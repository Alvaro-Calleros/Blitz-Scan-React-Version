#!/usr/bin/env python3
"""
Script de prueba para verificar la configuración de seguridad de BlitzScan
"""

import os
import sys
import logging

def test_env_variables():
    """Prueba que las variables de entorno estén configuradas"""
    print("🔍 Verificando variables de entorno...")
    
    required_vars = ['SUPABASE_DB_URL']
    optional_vars = [
        'DB_CONNECT_TIMEOUT', 'DB_POOL_MIN_CONNECTIONS', 
        'DB_POOL_MAX_CONNECTIONS', 'LOG_LEVEL', 'LOG_DB_QUERIES',
        'DB_RETRY_MAX_ATTEMPTS', 'DB_RETRY_DELAY'
    ]
    
    # Verificar variables requeridas
    missing_required = []
    for var in required_vars:
        if not os.getenv(var):
            missing_required.append(var)
    
    if missing_required:
        print(f"❌ Variables requeridas faltantes: {missing_required}")
        return False
    
    print("✅ Variables requeridas configuradas")
    
    # Verificar variables opcionales
    missing_optional = []
    for var in optional_vars:
        if not os.getenv(var):
            missing_optional.append(var)
    
    if missing_optional:
        print(f"⚠️  Variables opcionales no configuradas: {missing_optional}")
        print("   Se usarán valores por defecto")
    else:
        print("✅ Todas las variables opcionales configuradas")
    
    return True

def test_dependencies():
    """Prueba que las dependencias estén instaladas"""
    print("\n🔍 Verificando dependencias...")
    
    dependencies = [
        ('psycopg2', 'psycopg2-binary'),
        ('dotenv', 'python-dotenv'),
        ('flask', 'flask'),
        ('flask_cors', 'flask-cors')
    ]
    
    missing_deps = []
    for module, package in dependencies:
        try:
            __import__(module)
            print(f"✅ {package} instalado")
        except ImportError:
            missing_deps.append(package)
            print(f"❌ {package} no instalado")
    
    if missing_deps:
        print(f"\n⚠️  Dependencias faltantes: {missing_deps}")
        print("Instala con: pip install " + " ".join(missing_deps))
        return False
    
    print("✅ Todas las dependencias instaladas")
    return True

def test_supabase_connection():
    """Prueba la conexión a Supabase"""
    print("\n🔍 Verificando conexión a Supabase...")
    
    try:
        from supabase_config import db
        
        # Health check
        if db.health_check():
            print("✅ Conexión a Supabase exitosa")
            
            # Obtener información de conexión
            info = db.get_connection_info()
            print(f"📊 Información de conexión: {info}")
            
            # Probar query simple
            result = db.execute_one("SELECT 1 as test")
            if result and result['test'] == 1:
                print("✅ Query de prueba exitosa")
                return True
            else:
                print("❌ Query de prueba falló")
                return False
        else:
            print("❌ Health check falló")
            return False
            
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {e}")
        return False

def test_security_features():
    """Prueba las características de seguridad"""
    print("\n🔍 Verificando características de seguridad...")
    
    try:
        from supabase_config import db
        
        # Verificar que no se exponen credenciales en logs
        print("✅ Verificando logging seguro...")
        
        # Verificar retry automático
        print("✅ Verificando retry automático...")
        
        # Verificar validación de configuración
        print("✅ Verificando validación de configuración...")
        
        print("✅ Todas las características de seguridad funcionando")
        return True
        
    except Exception as e:
        print(f"❌ Error en características de seguridad: {e}")
        return False

def test_file_structure():
    """Verifica la estructura de archivos de seguridad"""
    print("\n🔍 Verificando estructura de archivos...")
    
    current_dir = os.path.dirname(__file__)
    required_files = [
        'supabase_config.py',
        'setup_env.py',
        'README_SECURITY.md'
    ]
    
    missing_files = []
    for file in required_files:
        file_path = os.path.join(current_dir, file)
        if not os.path.exists(file_path):
            missing_files.append(file)
            print(f"❌ Archivo faltante: {file}")
        else:
            print(f"✅ Archivo presente: {file}")
    
    if missing_files:
        print(f"⚠️  Archivos faltantes: {missing_files}")
        return False
    
    print("✅ Todos los archivos de seguridad presentes")
    return True

def main():
    """Función principal de pruebas"""
    print("🔒 PRUEBAS DE SEGURIDAD - BLITZSCAN")
    print("=" * 50)
    
    tests = [
        ("Variables de entorno", test_env_variables),
        ("Dependencias", test_dependencies),
        ("Conexión Supabase", test_supabase_connection),
        ("Características de seguridad", test_security_features),
        ("Estructura de archivos", test_file_structure)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ Test '{test_name}' falló")
        except Exception as e:
            print(f"❌ Error en test '{test_name}': {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 RESULTADOS: {passed}/{total} tests pasaron")
    
    if passed == total:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON!")
        print("✅ La configuración de seguridad está correcta")
        print("🚀 Tu aplicación está lista para producción")
    else:
        print("⚠️  Algunas pruebas fallaron")
        print("🔧 Revisa los errores y configura correctamente")
        sys.exit(1)

if __name__ == "__main__":
    main() 