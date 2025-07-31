#!/usr/bin/env python3
"""
Script para probar el guardado y obtención de escaneos en Supabase
"""

import json
import requests
from dotenv import load_dotenv

load_dotenv()

def test_save_scan():
    """Prueba guardar un escaneo en la base de datos"""
    print("🧪 Probando guardado de escaneo...")
    
    # Datos de prueba
    test_scan = {
        "userId": 1,  # Cambia por un ID de usuario real
        "url": "https://example.com",
        "scanType": "fuzzing",
        "results": [
            {
                "id_fuzz_result": 1,
                "id_scan": "test_scan_1",
                "path_found": "/admin",
                "http_status": 200,
                "response_size": 1024,
                "response_time": 0.5,
                "headers": "Content-Type: text/html",
                "is_redirect": False
            },
            {
                "id_fuzz_result": 2,
                "id_scan": "test_scan_1",
                "path_found": "/backup",
                "http_status": 403,
                "response_size": 512,
                "response_time": 0.3,
                "headers": "Content-Type: text/html",
                "is_redirect": False
            }
        ],
        "extraResult": None,
        "timestamp": "2024-01-15T10:30:00Z"
    }
    
    try:
        response = requests.post(
            'http://localhost:3001/api/save-scan',
            json=test_scan,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Escaneo guardado exitosamente")
            return True
        else:
            print("❌ Error guardando escaneo")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_get_scans():
    """Prueba obtener escaneos de un usuario"""
    print("\n📋 Probando obtención de escaneos...")
    
    user_id = 1  # Cambia por un ID de usuario real
    
    try:
        response = requests.get(
            f'http://localhost:3001/api/get-scans/{user_id}',
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            scans = data.get('scans', [])
            print(f"✅ Escaneos obtenidos: {len(scans)}")
            
            for i, scan in enumerate(scans[:3]):  # Mostrar solo los primeros 3
                print(f"  {i+1}. {scan.get('url')} - {scan.get('scan_type')} - {scan.get('status')}")
            
            return True
        else:
            print(f"❌ Error obteniendo escaneos: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_get_specific_scan():
    """Prueba obtener un escaneo específico"""
    print("\n🔍 Probando obtención de escaneo específico...")
    
    scan_id = 1  # ID real que existe en la base de datos
    
    try:
        response = requests.get(
            f'http://localhost:3001/api/get-scan/{scan_id}',
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            scan = data.get('scan')
            if scan:
                print(f"✅ Escaneo encontrado: {scan.get('url')} - {scan.get('scan_type')}")
                return True
            else:
                print("❌ Escaneo no encontrado")
                return False
        else:
            print(f"❌ Error obteniendo escaneo: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_database_connection():
    """Verifica la conexión a la base de datos"""
    print("🗄️ Verificando conexión a la base de datos...")
    
    try:
        from backend.config.supabase_config import db
        
        # Verificar que la tabla escaneos existe
        result = db.execute_one("""
            SELECT COUNT(*) as count 
            FROM escaneos
        """)
        
        if result:
            print(f"✅ Conexión a BD OK. Escaneos en la tabla: {result['count']}")
            return True
        else:
            print("❌ No se pudo conectar a la base de datos")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión a BD: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Iniciando pruebas de escaneos")
    print("=" * 50)
    
    # Verificar conexión a BD
    db_ok = test_database_connection()
    
    if db_ok:
        # Probar guardado
        save_ok = test_save_scan()
        
        if save_ok:
            # Probar obtención
            get_ok = test_get_scans()
            get_specific_ok = test_get_specific_scan()
            
            if get_ok and get_specific_ok:
                print("\n🎉 ¡Todas las pruebas pasaron!")
                print("✅ El sistema de escaneos está funcionando correctamente")
            else:
                print("\n⚠️ Algunas pruebas fallaron")
        else:
            print("\n❌ Error en el guardado de escaneos")
    else:
        print("\n❌ Error de conexión a la base de datos")
    
    print("\n" + "=" * 50)
    print("📝 Para probar completamente:")
    print("1. Asegúrate de que el servidor esté corriendo: python api.py")
    print("2. Verifica que las tablas existan en Supabase")
    print("3. Cambia los IDs de usuario por IDs reales") 