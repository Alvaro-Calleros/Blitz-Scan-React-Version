import requests
import json
import time

API_BACKEND = 'http://localhost:3001'
USER_ID = 2
TEST_DOMAIN = 'https://upsin.edu.mx'

print('--- TESTING FLUJO WHOIS ---')
whois_data = {
    "domain_name": "upsin.edu.mx",
    "registrar": "AKKY ONLINE SOLUTIONS, S.A. DE C.V.",
    "creation_date": "2004-11-11 00:00:00",
    "expiration_date": "2025-11-10 00:00:00",
    "updated_date": "2025-06-02 00:00:00",
    "registrant": {"name": "Ernesto Ca?edo Garcia", "city": "No disponible", "state": "No disponible", "country": "Mexico"},
    "admin_contact": {"name": "No disponible", "city": "Mazatlan", "state": "Sinaloa", "country": "Mexico"},
    "tech_contact": {"name": "UNIVERSIDAD POLITECNICA DE SINALOA", "city": "Mazatlan", "state": "Sinaloa", "country": "Mexico"},
    "billing_contact": {"name": "UNIVERSIDAD POLITECNICA DE SINALOA", "city": "Mazatlan", "state": "Sinaloa", "country": "Mexico"},
    "name_servers": ["lilyana.ns.cloudflare.com", "tim.ns.cloudflare.com"]
}
res = requests.post(f'{API_BACKEND}/api/save-whois-scan', json={
    'userId': USER_ID,
    'url': TEST_DOMAIN,
    'whoisData': whois_data,
    'estado': 'completado'
})
print('Guardar WHOIS:', res.status_code, res.text)
res = requests.get(f'{API_BACKEND}/api/get-whois-scans/{USER_ID}')
print('Historial WHOIS:', res.status_code)
print(json.dumps(res.json(), indent=2, ensure_ascii=False))

print('\n--- TESTING FLUJO NMAP ---')
nmap_data = {
    "openPorts": [
        {"port": "21/tcp", "service": "ftp", "version": ""},
        {"port": "80/tcp", "service": "http", "version": ""},
        {"port": "443/tcp", "service": "https", "version": ""},
        {"port": "3306/tcp", "service": "mysql", "version": ""}
    ],
    "raw": "📡 Puertos abiertos detectados:\n\n✅ 21/tcp   open   ftp\n✅ 80/tcp   open   http\n✅ 443/tcp  open   https\n✅ 3306/tcp open   mysql"
}
res = requests.post(f'{API_BACKEND}/api/save-nmap-scan', json={
    'userId': USER_ID,
    'url': TEST_DOMAIN,
    'nmapData': nmap_data,
    'estado': 'completado'
})
print('Guardar NMAP:', res.status_code, res.text)
res = requests.get(f'{API_BACKEND}/api/get-nmap-scans/{USER_ID}')
print('Historial NMAP:', res.status_code)
print(json.dumps(res.json(), indent=2, ensure_ascii=False))

print('\n--- TESTING FLUJO FUZZING ---')
fuzzing_data = [
    {"id_fuzz_result": 1, "id_scan": "scan1", "path_found": "/admin", "http_status": 200, "response_size": 4096, "response_time": 0.234, "headers": "Content-Type: text/html; Server: Apache/2.4.41", "is_redirect": False},
    {"id_fuzz_result": 2, "id_scan": "scan2", "path_found": "/login", "http_status": 403, "response_size": 1024, "response_time": 0.123, "headers": "Content-Type: text/html; Server: Nginx/1.18.0", "is_redirect": False}
]
res = requests.post(f'{API_BACKEND}/api/save-fuzzing-scan', json={
    'userId': USER_ID,
    'url': TEST_DOMAIN,
    'fuzzingData': fuzzing_data,
    'estado': 'completado'
})
print('Guardar FUZZING:', res.status_code, res.text)
res = requests.get(f'{API_BACKEND}/api/get-fuzzing-scans/{USER_ID}')
print('Historial FUZZING:', res.status_code)
print(json.dumps(res.json(), indent=2, ensure_ascii=False)) 