import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3001"

def test_server_status():
    """Verifica si el servidor está en funcionamiento"""
    try:
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        print("✅ Servidor en funcionamiento")
        return True
    except Exception as e:
        print(f"❌ Error conectando al servidor: {str(e)}")
        return False

def test_login():
    """Prueba el endpoint de login y retorna el token/datos de usuario"""
    try:
        payload = {
            "email": "test@example.com",
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/api/login", json=payload)
        assert response.status_code in [200, 401]  # 401 es aceptable si las credenciales son incorrectas
        data = response.json()
        print(f"✅ Login endpoint funcionando: {data.get('message', '')}")
        return data if data.get('success') else None
    except Exception as e:
        print(f"❌ Error en login: {str(e)}")
        return None

def test_get_scans(user_id):
    """Prueba la obtención de escaneos para un usuario"""
    try:
        response = requests.get(f"{BASE_URL}/api/get-scans/{user_id}")
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Get scans endpoint funcionando")
        print(f"   Escaneos encontrados: {len(data.get('scans', []))}")
        
        # Verificar estructura de los escaneos
        if data.get('scans'):
            scan = data['scans'][0]
            required_fields = ['id', 'url', 'tipo_escaneo', 'fecha', 'detalles', 'estado']
            missing_fields = [field for field in required_fields if field not in scan]
            if missing_fields:
                print(f"⚠️  Advertencia: Campos faltantes en escaneo: {missing_fields}")
            else:
                print("✅ Estructura de escaneo correcta")
                print(f"   Ejemplo de escaneo: {json.dumps(scan, indent=2)}")
        return data.get('scans', [])
    except Exception as e:
        print(f"❌ Error obteniendo escaneos: {str(e)}")
        return []

def test_get_specific_scan(scan_id):
    """Prueba la obtención de un escaneo específico"""
    try:
        response = requests.get(f"{BASE_URL}/api/get-scan/{scan_id}")
        assert response.status_code in [200, 404]
        data = response.json()
        if data.get('success'):
            print(f"✅ Get specific scan endpoint funcionando")
            print(f"   Detalles del escaneo: {json.dumps(data.get('scan'), indent=2)}")
        else:
            print(f"ℹ️ Escaneo no encontrado: {data.get('message')}")
        return data.get('scan')
    except Exception as e:
        print(f"❌ Error obteniendo escaneo específico: {str(e)}")
        return None

def test_hide_scan(scan_id, user_id):
    """Prueba la funcionalidad de ocultar un escaneo"""
    try:
        payload = {
            "scanId": scan_id,
            "userId": user_id
        }
        response = requests.post(f"{BASE_URL}/api/hide-scan", json=payload)
        assert response.status_code in [200, 404]
        data = response.json()
        print(f"✅ Hide scan endpoint funcionando: {data.get('message', '')}")
        return data.get('success', False)
    except Exception as e:
        print(f"❌ Error ocultando escaneo: {str(e)}")
        return False

def test_save_scan(user_id):
    """Prueba guardar un nuevo escaneo"""
    try:
        # Crear un escaneo de prueba
        test_scan = {
            "userId": user_id,
            "url": "https://test.example.com",
            "scanType": "nmap",
            "results": [],
            "extraResult": {
                "raw": "📡 Puertos abiertos detectados:\n\n✅ 80/tcp   open   http\n✅ 443/tcp  open   https",
                "openPorts": [
                    {"port": "80/tcp", "service": "http", "version": ""},
                    {"port": "443/tcp", "service": "https", "version": ""}
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/api/save-scan", json=test_scan)
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Save scan endpoint funcionando: {data.get('message', '')}")
        return data.get('success', False)
    except Exception as e:
        print(f"❌ Error guardando escaneo: {str(e)}")
        return False

def run_all_tests():
    """Ejecuta todas las pruebas en secuencia"""
    print("\n🔍 Iniciando pruebas del backend...\n")
    
    # Verificar servidor
    if not test_server_status():
        print("\n❌ Pruebas canceladas: Servidor no disponible")
        return
    
    print("\n📝 Probando autenticación...")
    user_data = test_login()
    if not user_data or not user_data.get('success'):
        print("\n⚠️ Advertencia: Continuando pruebas sin autenticación")
        test_user_id = 2  # ID de usuario de prueba
    else:
        test_user_id = user_data['user']['id']
    
    print("\n📊 Probando obtención de escaneos...")
    scans = test_get_scans(test_user_id)
    
    if scans:
        print("\n🔍 Probando obtención de escaneo específico...")
        test_get_specific_scan(scans[0]['id'])
        
        print("\n🗑️ Probando ocultar escaneo...")
        test_hide_scan(scans[0]['id'], test_user_id)
    
    print("\n💾 Probando guardar nuevo escaneo...")
    test_save_scan(test_user_id)
    
    print("\n✨ Pruebas completadas!")

if __name__ == "__main__":
    run_all_tests() 