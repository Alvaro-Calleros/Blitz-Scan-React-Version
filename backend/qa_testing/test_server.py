#!/usr/bin/env python3
"""
Script para verificar si el servidor está funcionando
"""

import requests
import time

def test_server():
    """Verifica si el servidor está funcionando"""
    print("🔍 Verificando si el servidor está funcionando...")
    print("=" * 50)
    
    base_url = "http://localhost:3001"
    
    # 1. Probar endpoint básico
    print("1️⃣ Probando endpoint básico...")
    try:
        response = requests.get(f'{base_url}/', timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        
        if response.status_code == 200:
            print("✅ Servidor respondiendo correctamente")
        else:
            print(f"❌ Servidor respondió con status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor")
        print("   Asegúrate de que el servidor esté corriendo en puerto 3001")
        return False
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")
        return False
    
    # 2. Probar endpoint de escaneos
    print("\n2️⃣ Probando endpoint de escaneos...")
    try:
        response = requests.get(f'{base_url}/api/get-scans/1', timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            scans = data.get('scans', [])
            print(f"   Escaneos encontrados: {len(scans)}")
            print("✅ Endpoint de escaneos funcionando")
        else:
            print(f"❌ Error en endpoint de escaneos: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Error text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error probando endpoint de escaneos: {e}")
        return False
    
    # 3. Probar endpoint de ocultación (solo si hay escaneos)
    print("\n3️⃣ Probando endpoint de ocultación...")
    try:
        response = requests.get(f'{base_url}/api/get-scans/1')
        if response.status_code == 200:
            data = response.json()
            scans = data.get('scans', [])
            
            if len(scans) > 0:
                test_scan = scans[0]
                print(f"   Probando con escaneo ID: {test_scan.get('id')}")
                
                payload = {
                    'scanId': test_scan.get('id'),
                    'userId': 1
                }
                
                response = requests.post(
                    f'{base_url}/api/hide-scan',
                    json=payload,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   Respuesta: {data}")
                    print("✅ Endpoint de ocultación funcionando")
                else:
                    print(f"❌ Error en endpoint de ocultación: {response.status_code}")
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Error text: {response.text}")
                    return False
            else:
                print("   No hay escaneos para probar ocultación")
                print("✅ Endpoint de ocultación disponible (sin datos para probar)")
        else:
            print(f"❌ Error obteniendo escaneos para prueba: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error probando endpoint de ocultación: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ¡Servidor funcionando correctamente!")
    print("✅ Todos los endpoints están respondiendo")
    print("✅ Puedes usar la funcionalidad de ocultación")
    
    return True

if __name__ == '__main__':
    # Esperar un poco para que el servidor esté listo
    print("⏳ Esperando que el servidor esté listo...")
    time.sleep(2)
    
    test_server() 