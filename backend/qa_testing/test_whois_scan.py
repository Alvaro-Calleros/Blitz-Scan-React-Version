import requests
import json
import time

API_BACKEND = 'http://localhost:3001'
API_SCANNER = 'http://localhost:5000'
USER_ID = 2
TEST_DOMAIN = 'https://upsin.edu.mx'

# 1. Hacer un escaneo WHOIS directamente al backend del escáner
print('--- WHOIS SCAN DIRECTO AL BACKEND DEL ESCÁNER ---')
whois_res = requests.post(f'{API_SCANNER}/whois', json={'objetivo': TEST_DOMAIN})
print('Status:', whois_res.status_code)
print('Raw response:', whois_res.text)
try:
    whois_json = whois_res.json()
    print('Parsed JSON:', json.dumps(whois_json, indent=2, ensure_ascii=False))
    if isinstance(whois_json.get('resultado'), dict):
        print('✅ El backend del escáner devuelve un objeto JSON plano')
    else:
        print('❌ El backend del escáner NO devuelve un objeto JSON plano')
except Exception as e:
    print('❌ Error al parsear JSON:', e)
    exit(1)

# 2. Guardar el escaneo en la base de datos usando el API principal
print('\n--- GUARDANDO ESCANEO EN LA BASE DE DATOS ---')
extra_result = whois_json.get('resultado')
detalles = {
    'results': [],
    'scan_type': 'whois',
    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'extraResult': extra_result
}
save_res = requests.post(f'{API_BACKEND}/api/save-scan', json={
    'userId': USER_ID,
    'url': TEST_DOMAIN,
    'scanType': 'whois',
    'results': [],
    'extraResult': detalles,
    'timestamp': detalles['timestamp']
})
print('Status:', save_res.status_code)
print('Response:', save_res.text)

# 3. Recuperar el escaneo desde la base de datos
print('\n--- RECUPERANDO ESCANEOS DESDE LA BASE DE DATOS ---')
get_res = requests.get(f'{API_BACKEND}/api/get-scans/{USER_ID}')
print('Status:', get_res.status_code)
try:
    scans_json = get_res.json()
    print('Parsed JSON:', json.dumps(scans_json, indent=2, ensure_ascii=False))
    whois_scans = [s for s in scans_json.get('scans', []) if s.get('scan_type') == 'whois']
    if whois_scans:
        print(f'✅ Se recuperó {len(whois_scans)} escaneo(s) WHOIS. Ejemplo:')
        last_scan = whois_scans[-1]
        print(json.dumps(last_scan, indent=2, ensure_ascii=False))
        # Validar campos críticos
        detalles_db = last_scan.get('extraResult') or last_scan.get('detalles', {})
        whois_db = detalles_db.get('extraResult') if isinstance(detalles_db, dict) else None
        if not whois_db:
            print('❌ No se encontró el objeto WHOIS en la base de datos')
        else:
            print('\n--- VALIDANDO CAMPOS CRÍTICOS ---')
            backend_fields = set(extra_result.keys())
            db_fields = set(whois_db.keys())
            missing = backend_fields - db_fields
            extra = db_fields - backend_fields
            if missing:
                print(f'❌ FALTAN CAMPOS en la base de datos: {missing}')
            else:
                print('✅ Todos los campos críticos están presentes en la base de datos')
            if extra:
                print(f'⚠️ CAMPOS EXTRA en la base de datos: {extra}')
            # Validar valores de ejemplo
            for field in backend_fields:
                if whois_db.get(field) != extra_result.get(field):
                    print(f'⚠️ Diferencia en campo {field}: BD={whois_db.get(field)} vs Backend={extra_result.get(field)}')
    else:
        print('❌ No se recuperó ningún escaneo WHOIS')
except Exception as e:
    print('❌ Error al parsear JSON de la base de datos:', e) 