import os
import json
import subprocess
import platform
from urllib.parse import urlparse

from flask import Flask, request, jsonify
from flask_cors import CORS
import whois

app = Flask(__name__)
CORS(app)

# Detectar si estamos en Windows
IS_WINDOWS = platform.system() == 'Windows'
WHOIS_CMD = 'whois64' if IS_WINDOWS else 'whois'

# 🔧 Utilidad para limpiar dominios o IPs
def limpiar_objetivo(url):
    print(f"Original URL: {url}")
    
    # Limpiar la URL de espacios y caracteres extra
    url = url.strip()
    
    # Remover protocolo si existe (incluyendo errores tipográficos)
    if url.startswith('http://') or url.startswith('https://') or url.startswith('htttps://'):
        try:
            # Corregir errores tipográficos comunes
            if url.startswith('htttps://'):
                url = url.replace('htttps://', 'https://')
            
            parsed_url = urlparse(url)
            domain = parsed_url.hostname
            print(f"Extracted domain: {domain}")
            return domain or url
        except Exception as e:
            print(f"Error parsing URL: {e}")
            return url
    
    # Si es solo un dominio o IP, devolverlo tal como está
    domain = url.strip('/')
    print(f"Final domain: {domain}")
    return domain

# 🎨 Embellecedor de resultados DIRSEARCH
def embellecer_dirsearch(salida):
    salida_limpia = ["📁 Objetivo escaneado"]
    for linea in salida.splitlines():
        if not linea.strip().startswith('['):
            continue

        partes = linea.split()
        if len(partes) < 4:
            continue

        codigo = partes[1]
        tam = partes[3] if partes[2] != '-' else ''
        url = partes[-1]
        redireccion = ' -> ' + partes[-3] if '->' in linea else ''

        simbolo = '✅' if codigo.startswith('2') else '➡️' if codigo.startswith('3') else '⚠️'

        ruta = url.replace('https://', '').replace('http://', '')
        ruta = '/' + '/'.join(ruta.split('/')[1:])

        salida_limpia.append(f"{simbolo} [{codigo}] {ruta:<30} {redireccion} ({tam})")

    return '\n'.join(salida_limpia) or '🔍 No se encontraron rutas visibles.'

# 🎨 Embellecedor de resultados NMAP
def embellecer_nmap(salida):
    lineas = salida.splitlines()
    utiles = [l for l in lineas if 'open' in l]
    if not utiles:
        return "🔍 No se encontraron puertos abiertos."

    salida_limpia = ["📡 Puertos abiertos detectados:\n"]
    for l in utiles:
        salida_limpia.append(f"✅ {l.strip()}")
    return '\n'.join(salida_limpia)

# 🛰 Escaneo con Nmap
@app.route('/escanear', methods=['POST'])
def escanear_nmap():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))

    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400

    try:
        resultado = subprocess.check_output(['nmap', '-F', objetivo], text=True)
        salida = embellecer_nmap(resultado)
    except subprocess.CalledProcessError as e:
        salida = f"❌ Error al ejecutar Nmap:\n{e.output}"
    except Exception as e:
        salida = f"❌ Error inesperado:\n{str(e)}"

    return jsonify({'resultado': salida})


# 📂 Escaneo de directorios con Dirsearch
@app.route('/dir', methods=['POST'])
def escanear_directorios():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))

    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400

    try:
        resultado = subprocess.check_output([
            r'C:\Users\santi\AppData\Local\Programs\Python\Python313\python.exe',
            r'C:\Users\santi\dirsearch\dirsearch.py',
            '-u', f'https://{objetivo}',
            '-e', 'php,html,txt',
            '-x', '403,404,520',
            '--quiet',
            '--no-color',
            '--threads', '20'  # más velocidad
        ], text=True, stderr=subprocess.STDOUT)

        salida = embellecer_dirsearch(resultado)

    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en Dirsearch:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500

    return jsonify({'resultado': salida})


# 🌐 Consulta WHOIS
@app.route('/whois', methods=['POST'])
def escanear_whois():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))

    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún dominio.'}), 400

    try:
        print(f"Executing {WHOIS_CMD} command for: {objetivo}")
        
        # Primero intentar con el comando whois del sistema
        try:
            resultado = subprocess.check_output([WHOIS_CMD, objetivo], text=True, stderr=subprocess.STDOUT, timeout=30)
            
            # Debug temporal - mostrar resultado raw
            print(f"WHOIS RAW RESULT FOR {objetivo}:")
            print("=" * 50)
            print(resultado)
            print("=" * 50)
            
            # Procesar el resultado del comando whois
            salida = procesar_whois_resultado(resultado, objetivo)
            
            # Si no se encontró información útil, devolver el resultado raw
            if 'No disponible' in salida and len(resultado.strip()) > 100:
                print("No se pudo procesar la información, devolviendo resultado raw")
                return jsonify({'resultado': f"🌐 Información WHOIS Raw\n\n{resultado}"})
                
        except FileNotFoundError:
            print(f"Comando {WHOIS_CMD} no encontrado, usando librería python-whois")
            # Fallback a la librería python-whois
            info = whois.whois(objetivo)
            
            # Extraer información adicional de otros campos
            registrant_name = 'No disponible'
            registrant_country = 'No disponible'
            
            # Buscar información del registrante en diferentes campos
            if info.name:
                registrant_name = str(info.name)
            elif info.org:
                registrant_name = str(info.org)
            elif hasattr(info, 'registrant_name') and info.registrant_name:
                registrant_name = str(info.registrant_name)
            
            if info.country:
                registrant_country = str(info.country)
            elif hasattr(info, 'registrant_country') and info.registrant_country:
                registrant_country = str(info.registrant_country)
            
            # Buscar información de contactos administrativos
            admin_name = 'No disponible'
            if hasattr(info, 'admin_name') and info.admin_name:
                admin_name = str(info.admin_name)
            elif hasattr(info, 'admin_organization') and info.admin_organization:
                admin_name = str(info.admin_organization)
            
            # Buscar información de contactos técnicos
            tech_name = 'No disponible'
            if hasattr(info, 'tech_name') and info.tech_name:
                tech_name = str(info.tech_name)
            elif hasattr(info, 'tech_organization') and info.tech_organization:
                tech_name = str(info.tech_organization)
            
            # Crear estructura similar a la del comando whois
            whois_data = {
                'domain_name': objetivo,
                'registrar': str(info.registrar) if info.registrar else 'No disponible',
                'creation_date': str(info.creation_date) if info.creation_date else 'No disponible',
                'expiration_date': str(info.expiration_date) if info.expiration_date else 'No disponible',
                'updated_date': str(info.updated_date) if info.updated_date else 'No disponible',
                'registrant': {
                    'name': registrant_name,
                    'city': str(info.city) if info.city else 'No disponible',
                    'state': str(info.state) if info.state else 'No disponible',
                    'country': registrant_country
                },
                'admin_contact': {
                    'name': admin_name,
                    'city': str(info.admin_city) if hasattr(info, 'admin_city') and info.admin_city else 'No disponible',
                    'state': str(info.admin_state) if hasattr(info, 'admin_state') and info.admin_state else 'No disponible',
                    'country': str(info.admin_country) if hasattr(info, 'admin_country') and info.admin_country else 'No disponible'
                },
                'tech_contact': {
                    'name': tech_name,
                    'city': str(info.tech_city) if hasattr(info, 'tech_city') and info.tech_city else 'No disponible',
                    'state': str(info.tech_state) if hasattr(info, 'tech_state') and info.tech_state else 'No disponible',
                    'country': str(info.tech_country) if hasattr(info, 'tech_country') and info.tech_country else 'No disponible'
                },
                'billing_contact': {
                    'name': str(info.billing_name) if hasattr(info, 'billing_name') and info.billing_name else 'No disponible',
                    'city': str(info.billing_city) if hasattr(info, 'billing_city') and info.billing_city else 'No disponible',
                    'state': str(info.billing_state) if hasattr(info, 'billing_state') and info.billing_state else 'No disponible',
                    'country': str(info.billing_country) if hasattr(info, 'billing_country') and info.billing_country else 'No disponible'
                },
                'name_servers': info.name_servers if info.name_servers else []
            }
            
            # Debug: mostrar todos los campos disponibles
            print("Campos disponibles en python-whois:")
            for field in dir(info):
                if not field.startswith('_') and not callable(getattr(info, field)):
                    value = getattr(info, field)
                    if value:
                        print(f"  {field}: {value}")
            
            salida = f"🌐 Información WHOIS (via python-whois)\n{json.dumps(whois_data, indent=2, ensure_ascii=False)}"
            
        except subprocess.CalledProcessError as e:
            print(f"WHOIS command failed: {e}")
            # Intentar con python-whois como fallback
            info = whois.whois(objetivo)
            whois_data = {
                'domain_name': objetivo,
                'registrar': str(info.registrar) if info.registrar else 'No disponible',
                'creation_date': str(info.creation_date) if info.creation_date else 'No disponible',
                'expiration_date': str(info.expiration_date) if info.expiration_date else 'No disponible',
                'updated_date': str(info.updated_date) if info.updated_date else 'No disponible',
                'registrant': {
                    'name': str(info.name) if info.name else 'No disponible',
                    'city': 'No disponible',
                    'state': 'No disponible',
                    'country': str(info.country) if info.country else 'No disponible'
                },
                'admin_contact': {
                    'name': 'No disponible',
                    'city': 'No disponible',
                    'state': 'No disponible',
                    'country': 'No disponible'
                },
                'tech_contact': {
                    'name': 'No disponible',
                    'city': 'No disponible',
                    'state': 'No disponible',
                    'country': 'No disponible'
                },
                'billing_contact': {
                    'name': 'No disponible',
                    'city': 'No disponible',
                    'state': 'No disponible',
                    'country': 'No disponible'
                },
                'name_servers': info.name_servers if info.name_servers else []
            }
            
            salida = f"🌐 Información WHOIS (fallback)\n{json.dumps(whois_data, indent=2, ensure_ascii=False)}"

    except Exception as e:
        print(f"Unexpected error in WHOIS: {e}")
        salida = f'❌ Error inesperado:\n{str(e)}'

    return jsonify({'resultado': salida})

def procesar_whois_resultado(whois_output, dominio):
    """Procesa el resultado del comando whois y extrae información relevante"""
    
    lines = whois_output.split('\n')
    info = {
        'domain_name': dominio,
        'registrar': 'No disponible',
        'creation_date': 'No disponible',
        'expiration_date': 'No disponible',
        'updated_date': 'No disponible',
        'registrant': {
            'name': 'No disponible',
            'city': 'No disponible',
            'state': 'No disponible',
            'country': 'No disponible'
        },
        'admin_contact': {
            'name': 'No disponible',
            'city': 'No disponible',
            'state': 'No disponible',
            'country': 'No disponible'
        },
        'tech_contact': {
            'name': 'No disponible',
            'city': 'No disponible',
            'state': 'No disponible',
            'country': 'No disponible'
        },
        'billing_contact': {
            'name': 'No disponible',
            'city': 'No disponible',
            'state': 'No disponible',
            'country': 'No disponible'
        },
        'name_servers': []
    }
    
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('%') or line.startswith('#'):
            continue
            
        # Detectar secciones
        if 'registrant:' in line.lower():
            current_section = 'registrant'
            continue
        elif 'administrative contact:' in line.lower():
            current_section = 'admin_contact'
            continue
        elif 'technical contact:' in line.lower():
            current_section = 'tech_contact'
            continue
        elif 'billing contact:' in line.lower():
            current_section = 'billing_contact'
            continue
        elif 'name servers:' in line.lower():
            current_section = 'name_servers'
            continue
            
        # Extraer información según la sección
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().lower()
            value = value.strip()
            
            if key == 'registrar':
                info['registrar'] = value
            elif key in ['created on', 'creation date']:
                info['creation_date'] = value
            elif key == 'expiration date':
                info['expiration_date'] = value
            elif key in ['last updated on', 'updated date']:
                info['updated_date'] = value
            elif key == 'name' and current_section and current_section in info:
                info[current_section]['name'] = value
            elif key == 'city' and current_section and current_section in info:
                info[current_section]['city'] = value
            elif key == 'state' and current_section and current_section in info:
                info[current_section]['state'] = value
            elif key == 'country' and current_section and current_section in info:
                info[current_section]['country'] = value
            elif key in ['dns', 'name server'] and current_section == 'name_servers':
                if value not in info['name_servers']:
                    info['name_servers'].append(value)
    
    # Si no se encontró información, intentar con un formato alternativo
    if info['registrar'] == 'No disponible':
        # Buscar información en formato alternativo
        for line in lines:
            line = line.strip()
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower()
                value = value.strip()
                
                if 'registrar' in key and value:
                    info['registrar'] = value
                elif 'created' in key and value:
                    info['creation_date'] = value
                elif 'expiration' in key and value:
                    info['expiration_date'] = value
                elif 'updated' in key and value:
                    info['updated_date'] = value
                elif 'name server' in key or 'dns' in key:
                    if value and value not in info['name_servers']:
                        info['name_servers'].append(value)
    
    # Crear salida formateada
    salida = f"🌐 Información WHOIS\n{json.dumps(info, indent=2, ensure_ascii=False)}"
    
    return salida

if __name__ == '__main__':
    app.run(debug=True)