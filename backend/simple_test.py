#!/usr/bin/env python3
"""
Script de prueba simple para endpoints de ocultación
"""

import requests
import json

def simple_test():
    """Prueba simple de los endpoints"""
    print("🧪 Prueba simple de endpoints de ocultación...")
    print("=" * 40)
    
    base_url = "http://localhost:3001"
    
    # 1. Obtener escaneos
    print("1️⃣ Obteniendo escaneos...")
    try:
        response = requests.get(f'{base_url}/api/get-scans/1')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            scans = data.get('scans', [])
            print(f"   Escaneos encontrados: {len(scans)}")
            
            if len(scans) > 0:
                test_scan = scans[0]
                print(f"   Escaneo de prueba: ID {test_scan.get('id')}")
                
                # 2. Probar ocultación
                print("\n2️⃣ Probando ocultación...")
                payload = {
                    'scanId': test_scan.get('id'),
                    'userId': 1
                }
                
                response = requests.post(
                    f'{base_url}/api/hide-scan',
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                )
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   Respuesta: {data}")
                    
                    if data.get('success'):
                        print("✅ ¡Ocultación exitosa!")
                        
                        # 3. Verificar que se ocultó
                        print("\n3️⃣ Verificando que se ocultó...")
                        response = requests.get(f'{base_url}/api/get-scans/1')
                        
                        if response.status_code == 200:
                            data = response.json()
                            remaining_scans = data.get('scans', [])
                            print(f"   Escaneos restantes: {len(remaining_scans)}")
                            
                            # Verificar que el escaneo no está en la lista
                            scan_found = any(scan.get('id') == test_scan.get('id') for scan in remaining_scans)
                            if not scan_found:
                                print("✅ ¡El escaneo se ocultó correctamente!")
                            else:
                                print("❌ El escaneo aún aparece en la lista")
                        else:
                            print(f"❌ Error verificando: {response.status_code}")
                    else:
                        print(f"❌ Error en respuesta: {data.get('message')}")
                else:
                    print(f"❌ Error HTTP: {response.status_code}")
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Error text: {response.text}")
            else:
                print("❌ No hay escaneos para probar")
        else:
            print(f"❌ Error obteniendo escaneos: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error en prueba: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    simple_test() 