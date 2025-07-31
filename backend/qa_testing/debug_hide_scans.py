#!/usr/bin/env python3
"""
Script de diagnóstico para problemas con ocultación de escaneos
"""

import requests
import json
import time

def debug_hide_scans():
    """Diagnostica problemas con la ocultación de escaneos"""
    print("🔍 Diagnóstico de problemas con ocultación de escaneos...")
    print("=" * 60)
    
    base_url = "http://localhost:3001"
    
    # 1. Verificar que el servidor está funcionando
    print("1️⃣ Verificando servidor...")
    try:
        response = requests.get(f'{base_url}/', timeout=5)
        print(f"✅ Servidor respondiendo: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")
        return False
    
    # 2. Verificar estructura de la base de datos
    print("\n2️⃣ Verificando estructura de BD...")
    try:
        from backend.config.supabase_config import db
        
        # Verificar si existe la columna eliminado
        result = db.execute_one("""
            SELECT column_name, data_type, column_default, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'escaneos' AND column_name = 'eliminado'
        """)
        
        if result:
            print("✅ Columna 'eliminado' existe en tabla escaneos")
            print(f"   Tipo: {result['data_type']}")
            print(f"   Default: {result['column_default']}")
            print(f"   Nullable: {result['is_nullable']}")
        else:
            print("❌ Columna 'eliminado' NO existe en tabla escaneos")
            print("   Necesitas ejecutar el script apply_soft_delete.sql")
            return False
        
        # Contar escaneos activos
        active_count = db.execute_one("SELECT COUNT(*) as count FROM escaneos WHERE eliminado = FALSE")
        if active_count:
            print(f"✅ Escaneos activos: {active_count['count']}")
        
        # Contar escaneos ocultados
        hidden_count = db.execute_one("SELECT COUNT(*) as count FROM escaneos WHERE eliminado = TRUE")
        if hidden_count:
            print(f"✅ Escaneos ocultados: {hidden_count['count']}")
        
    except Exception as e:
        print(f"❌ Error verificando BD: {e}")
        return False
    
    # 3. Obtener escaneos para probar
    print("\n3️⃣ Obteniendo escaneos para prueba...")
    try:
        response = requests.get(
            f'{base_url}/api/get-scans/1',
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            scans = data.get('scans', [])
            print(f"✅ Encontrados {len(scans)} escaneos activos")
            
            if len(scans) == 0:
                print("❌ No hay escaneos para probar")
                return False
            
            # Mostrar detalles de los primeros 3 escaneos
            for i, scan in enumerate(scans[:3]):
                print(f"   📋 Escaneo {i+1}:")
                print(f"      ID: {scan.get('id')}")
                print(f"      URL: {scan.get('url')}")
                print(f"      Tipo: {scan.get('scan_type')}")
                print(f"      Estado: {scan.get('status')}")
            
            # 4. Probar ocultación individual
            test_scan = scans[0]
            print(f"\n4️⃣ Probando ocultación individual del escaneo {test_scan.get('id')}...")
            
            payload = {
                'scanId': test_scan.get('id'),
                'userId': 1
            }
            
            print(f"   📤 Enviando payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                f'{base_url}/api/hide-scan',
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   📥 Respuesta HTTP: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   📋 Respuesta JSON: {json.dumps(data, indent=2)}")
                
                if data.get('success'):
                    print("✅ Ocultación individual exitosa")
                else:
                    print(f"❌ Error en respuesta: {data.get('message')}")
                    return False
            else:
                print(f"❌ Error HTTP: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   📋 Error JSON: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   📋 Error text: {response.text}")
                return False
            
            # 5. Verificar que el escaneo se ocultó
            print("\n5️⃣ Verificando que el escaneo se ocultó...")
            time.sleep(1)
            
            response = requests.get(
                f'{base_url}/api/get-scans/1',
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                remaining_scans = data.get('scans', [])
                print(f"✅ Quedan {len(remaining_scans)} escaneos activos")
                
                # Verificar que el escaneo ocultado no está en la lista
                hidden_scan_found = any(scan.get('id') == test_scan.get('id') for scan in remaining_scans)
                if not hidden_scan_found:
                    print("✅ El escaneo ocultado no aparece en la lista (correcto)")
                else:
                    print("❌ El escaneo ocultado aún aparece en la lista")
                    return False
            
            # 6. Probar ocultación múltiple si hay suficientes escaneos
            if len(remaining_scans) >= 2:
                print(f"\n6️⃣ Probando ocultación múltiple...")
                
                scan_ids = [scan.get('id') for scan in remaining_scans[:2]]
                payload = {
                    'scanIds': scan_ids,
                    'userId': 1
                }
                
                print(f"   📤 Enviando payload: {json.dumps(payload, indent=2)}")
                
                response = requests.post(
                    f'{base_url}/api/hide-scans',
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                )
                
                print(f"   📥 Respuesta HTTP: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   📋 Respuesta JSON: {json.dumps(data, indent=2)}")
                    
                    if data.get('success'):
                        print(f"✅ Ocultación múltiple exitosa")
                    else:
                        print(f"❌ Error en respuesta: {data.get('message')}")
                        return False
                else:
                    print(f"❌ Error HTTP: {response.status_code}")
                    try:
                        error_data = response.json()
                        print(f"   📋 Error JSON: {json.dumps(error_data, indent=2)}")
                    except:
                        print(f"   📋 Error text: {response.text}")
                    return False
                
                # Verificar resultado final
                time.sleep(1)
                response = requests.get(
                    f'{base_url}/api/get-scans/1',
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    final_scans = data.get('scans', [])
                    print(f"✅ Quedan {len(final_scans)} escaneos activos después de ocultación múltiple")
        
        else:
            print(f"❌ Error obteniendo escaneos: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   📋 Error JSON: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   📋 Error text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en prueba: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ¡Diagnóstico completado!")
    print("✅ Si llegaste hasta aquí, la funcionalidad está funcionando correctamente")
    print("❌ Si hubo errores, revisa los mensajes anteriores")
    
    return True

if __name__ == '__main__':
    # Esperar un poco para que el servidor esté listo
    print("⏳ Esperando que el servidor esté listo...")
    time.sleep(3)
    
    debug_hide_scans() 