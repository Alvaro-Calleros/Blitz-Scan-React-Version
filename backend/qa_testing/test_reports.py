#!/usr/bin/env python3
"""
Script para probar la generación de reportes con diferentes tipos de escaneo
"""

import json
import requests

API_BASE = 'http://localhost:3001'
USER_ID = 4
SCAN_ID = 1
SCAN_TYPE = 'nmap'

def test_report_generation():
    """Prueba la generación de reportes con diferentes tipos de escaneo"""
    print("🧪 Probando generación de reportes...")
    print("=" * 50)
    
    # Datos de prueba para diferentes tipos de escaneo
    test_scans = [
        {
            "name": "Fuzzing Test",
            "scan": {
                "id": "test_fuzzing_1",
                "url": "https://example.com",
                "scan_type": "fuzzing",
                "timestamp": "2024-01-15T12:00:00Z",
                "status": "completed",
                "results": [
                    {
                        "id_fuzz_result": 1,
                        "id_scan": "test_1",
                        "path_found": "/admin",
                        "http_status": 200,
                        "response_size": 1024,
                        "response_time": 0.5,
                        "headers": "Content-Type: text/html; Server: Apache/2.4.41",
                        "is_redirect": False
                    },
                    {
                        "id_fuzz_result": 2,
                        "id_scan": "test_1",
                        "path_found": "/backup",
                        "http_status": 403,
                        "response_size": 512,
                        "response_time": 0.3,
                        "headers": "Content-Type: text/html; Server: Apache/2.4.41",
                        "is_redirect": False
                    },
                    {
                        "id_fuzz_result": 3,
                        "id_scan": "test_1",
                        "path_found": "/login",
                        "http_status": 302,
                        "response_size": 256,
                        "response_time": 0.2,
                        "headers": "Content-Type: text/html; Location: /dashboard",
                        "is_redirect": True
                    }
                ],
                "extraResult": None
            }
        },
        {
            "name": "Nmap Test",
            "scan": {
                "id": "test_nmap_1",
                "url": "https://upsin.edu.mx",
                "scan_type": "nmap",
                "timestamp": "2024-01-15T12:00:00Z",
                "status": "completed",
                "results": [],
                "extraResult": "📡 Puertos abiertos detectados:\n\n✅ 22/tcp open ssh OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)\n✅ 80/tcp open http nginx 1.18.0 (Ubuntu)\n✅ 443/tcp open https nginx 1.18.0 (Ubuntu)\n✅ 3306/tcp open mysql MySQL 8.0.32-0ubuntu0.20.04.2\n\n🔍 Resumen:\n• Total de puertos escaneados: 100\n• Puertos abiertos: 4\n• Servicios detectados: SSH, HTTP, HTTPS, MySQL"
            }
        },
        {
            "name": "WHOIS Test",
            "scan": {
                "id": "test_whois_1",
                "url": "https://upsin.edu.mx",
                "scan_type": "whois",
                "timestamp": "2024-01-15T12:00:00Z",
                "status": "completed",
                "results": [],
                "extraResult": {
                    "domain_name": "upsin.edu.mx",
                    "registrar": "NIC Mexico",
                    "creation_date": "1997-01-15",
                    "expiration_date": "2025-01-15",
                    "updated_date": "2024-01-15",
                    "registrant": {
                        "name": "Universidad Politécnica de Sinaloa",
                        "city": "Mazatlán",
                        "state": "Sinaloa",
                        "country": "México"
                    },
                    "name_servers": [
                        "ns1.upsin.edu.mx",
                        "ns2.upsin.edu.mx"
                    ]
                }
            }
        }
    ]
    
    # Probar cada tipo de escaneo
    for test in test_scans:
        print(f"\n📋 Probando: {test['name']}")
        print("-" * 30)
        
        scan = test['scan']
        
        # Simular la función de generación de reporte
        try:
            # Crear el contenido del reporte
            report_content = generate_test_report(scan)
            
            # Guardar el reporte como archivo
            filename = f"test_report_{scan['scan_type']}_{scan['id']}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report_content)
            
            print(f"✅ Reporte generado: {filename}")
            print(f"📏 Tamaño: {len(report_content)} caracteres")
            
            # Mostrar una vista previa
            lines = report_content.split('\n')
            print("📄 Vista previa (primeras 10 líneas):")
            for i, line in enumerate(lines[:10]):
                print(f"   {i+1:2d}: {line}")
            if len(lines) > 10:
                print(f"   ... y {len(lines) - 10} líneas más")
                
        except Exception as e:
            print(f"❌ Error generando reporte: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Pruebas de reportes completadas!")
    print("📁 Los archivos de prueba se han guardado en el directorio actual")

def generate_test_report(scan):
    """Genera un reporte de prueba similar al del frontend"""
    
    def format_scan_results(scan):
        if scan['scan_type'] == 'fuzzing' and scan['results']:
            results = '\n'.join([
                f"📁 Ruta: {result['path_found']}\n"
                f"   🔢 Estado HTTP: {result['http_status']}\n"
                f"   📏 Tamaño: {result['response_size']} bytes\n"
                f"   ⏱️  Tiempo: {result['response_time']:.3f}s\n"
                f"   🔄 Redirección: {'Sí' if result['is_redirect'] else 'No'}\n"
                f"   📋 Headers: {result['headers']}"
                for result in scan['results']
            ])
            
            summary = f"""
📊 RESUMEN DE FUZZING:
   • Total de rutas encontradas: {len(scan['results'])}
   • Rutas accesibles (200): {len([r for r in scan['results'] if r['http_status'] == 200])}
   • Redirecciones (3xx): {len([r for r in scan['results'] if r['is_redirect']])}
   • Errores 4xx: {len([r for r in scan['results'] if 400 <= r['http_status'] < 500])}
   • Errores 5xx: {len([r for r in scan['results'] if r['http_status'] >= 500])}"""
            
            return f"🔍 RESULTADOS DE FUZZING:\n{results}{summary}"
            
        elif scan['scan_type'] == 'nmap' and scan['extraResult']:
            return f"🌐 RESULTADOS DE NMAP:\n{scan['extraResult']}"
            
        elif scan['scan_type'] == 'whois' and scan['extraResult']:
            if isinstance(scan['extraResult'], dict):
                whois_data = scan['extraResult']
                formatted = "📋 RESULTADOS DE WHOIS:\n\n"
                
                if whois_data.get('domain_name'):
                    formatted += f"🌐 Dominio: {whois_data['domain_name']}\n"
                if whois_data.get('registrar'):
                    formatted += f"🏢 Registrador: {whois_data['registrar']}\n"
                if whois_data.get('creation_date'):
                    formatted += f"📅 Fecha de creación: {whois_data['creation_date']}\n"
                if whois_data.get('expiration_date'):
                    formatted += f"⏰ Fecha de expiración: {whois_data['expiration_date']}\n"
                if whois_data.get('updated_date'):
                    formatted += f"🔄 Última actualización: {whois_data['updated_date']}\n"
                
                if whois_data.get('registrant'):
                    formatted += "\n👤 REGISTRANTE:\n"
                    registrant = whois_data['registrant']
                    if registrant.get('name'):
                        formatted += f"   Nombre: {registrant['name']}\n"
                    if registrant.get('city'):
                        formatted += f"   Ciudad: {registrant['city']}\n"
                    if registrant.get('state'):
                        formatted += f"   Estado: {registrant['state']}\n"
                    if registrant.get('country'):
                        formatted += f"   País: {registrant['country']}\n"
                
                if whois_data.get('name_servers'):
                    formatted += "\n🖥️  NAME SERVERS:\n"
                    for i, ns in enumerate(whois_data['name_servers'], 1):
                        formatted += f"   {i}. {ns}\n"
                
                return formatted
            else:
                return f"📋 RESULTADOS DE WHOIS:\n{scan['extraResult']}"
        
        return "❌ No se encontraron resultados"
    
    results_section = format_scan_results(scan)
    
    report_content = f"""REPORTE DE ESCANEO - BLITZ SCAN
===========================================

📋 INFORMACIÓN DEL ESCANEO:
   • URL objetivo: {scan['url']}
   • Tipo de escaneo: {scan['scan_type'].upper()}
   • Fecha: {scan['timestamp']}
   • Estado: {scan['status']}
   • ID del escaneo: {scan['id']}

{results_section}

===========================================
🔒 RECOMENDACIONES DE SEGURIDAD:
   • Revisar rutas accesibles no autorizadas
   • Verificar configuración de redirecciones
   • Implementar controles de acceso apropiados
   • Ocultar información sensible en headers
   • Mantener servicios actualizados
   • Configurar firewalls apropiadamente
   • Monitorear logs de acceso regularmente
   • Realizar auditorías de seguridad periódicas

===========================================
📄 Generado por BlitzScan
🕐 Fecha: 2024-01-15 12:00:00
🌐 Herramienta de Ciberseguridad Profesional
"""
    
    return report_content

def test_generate_nmap_report():
    print('--- TEST: Flujo de generación de reporte IA para Nmap ---')
    # Paso 1: Obtener escaneos Nmap del usuario
    url_get = f'{API_BASE}/api/get-nmap-scans/{USER_ID}'
    resp = requests.get(url_get)
    if resp.status_code != 200:
        print(f'❌ Error al obtener escaneos Nmap: {resp.status_code}')
        return
    data = resp.json()
    if not data.get('success') or not data.get('scans'):
        print('❌ No se encontraron escaneos Nmap para el usuario.')
        return
    print(f'✅ Escaneos Nmap obtenidos: {len(data["scans"])}, usando el más reciente.')
    nmap_scan = data['scans'][0]
    nmap_data = nmap_scan.get('nmap_data')
    if not nmap_data:
        print('❌ El escaneo Nmap no tiene datos nmap_data.')
        return
    # Paso 2: Enviar a /generate_report
    url_report = f'{API_BASE}/generate_report'
    payload = {
        'scan_type': SCAN_TYPE,
        'scan_data': nmap_data if isinstance(nmap_data, str) else str(nmap_data)
    }
    resp2 = requests.post(url_report, json=payload)
    if resp2.status_code != 200:
        print(f'❌ Error al generar reporte IA: {resp2.status_code}')
        print(resp2.text)
        return
    data2 = resp2.json()
    if 'report' in data2:
        print('✅ Reporte IA generado correctamente:')
        print(data2['report'])
    else:
        print('❌ No se recibió reporte IA.')

if __name__ == '__main__':
    test_report_generation()
    test_generate_nmap_report() 