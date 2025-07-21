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

# Detectar si estamos en Windows o donde esta instalado el whois
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

# 🎯 Embellecedor de resultados SUBFINDER

def embellecer_subfinder(salida):
    dominios = [l.strip() for l in salida.splitlines() if l.strip() and not l.startswith('[-]')]
    if not dominios:
        return '🔍 No se encontraron subdominios.'
    salida_limpia = [f"🔎 Subdominios encontrados: {len(dominios)}"]
    salida_limpia += [f"✅ {d}" for d in dominios]
    return '\n'.join(salida_limpia)

# 🎯 Embellecedor de resultados HTTPX

def embellecer_httpx(salida):
    lines = [l.strip() for l in salida.splitlines() if l.strip()]
    if not lines:
        return '🔍 No se encontraron hosts vivos.'
    salida_limpia = [f"🌐 Hosts vivos detectados: {len(lines)}"]
    salida_limpia += [f"✅ {l}" for l in lines]
    return '\n'.join(salida_limpia)

# 🎯 Embellecedor de resultados NUCLEI

def embellecer_nuclei(salida):
    lines = [l.strip() for l in salida.splitlines() if l.strip()]
    if not lines:
        return '🔍 No se detectaron vulnerabilidades.'
    salida_limpia = [f"🚨 Vulnerabilidades detectadas: {len(lines)}"]
    salida_limpia += [f"⚠️ {l}" for l in lines]
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

    print(f"WHOIS request for domain: {objetivo}")
    
    # Intentar primero con python-whois
    try:
        print("Trying python-whois library...")
        info = whois.whois(objetivo)
        
        # Extraer información de manera más robusta
        registrar = 'No disponible'
        if info.registrar:
            registrar = str(info.registrar)
        elif hasattr(info, 'registrar_name') and info.registrar_name:
            registrar = str(info.registrar_name)
        
        creation_date = 'No disponible'
        if info.creation_date:
            if isinstance(info.creation_date, list):
                creation_date = str(info.creation_date[0])
            else:
                creation_date = str(info.creation_date)
        
        expiration_date = 'No disponible'
        if info.expiration_date:
            if isinstance(info.expiration_date, list):
                expiration_date = str(info.expiration_date[0])
            else:
                expiration_date = str(info.expiration_date)
        
        updated_date = 'No disponible'
        if info.updated_date:
            if isinstance(info.updated_date, list):
                updated_date = str(info.updated_date[0])
            else:
                updated_date = str(info.updated_date)
        
        # Buscar información del registrante
        registrant_name = 'No disponible'
        if info.name:
            registrant_name = str(info.name)
        elif info.org:
            registrant_name = str(info.org)
        elif hasattr(info, 'registrant_name') and info.registrant_name:
            registrant_name = str(info.registrant_name)
        elif hasattr(info, 'registrant_organization') and info.registrant_organization:
            registrant_name = str(info.registrant_organization)
        
        registrant_country = 'No disponible'
        if info.country:
            registrant_country = str(info.country)
        elif hasattr(info, 'registrant_country') and info.registrant_country:
            registrant_country = str(info.registrant_country)
        
        # Buscar información de contactos
        admin_name = 'No disponible'
        if hasattr(info, 'admin_name') and info.admin_name:
            admin_name = str(info.admin_name)
        elif hasattr(info, 'admin_organization') and info.admin_organization:
            admin_name = str(info.admin_organization)
        elif hasattr(info, 'admin_email') and info.admin_email:
            admin_name = str(info.admin_email)
        
        tech_name = 'No disponible'
        if hasattr(info, 'tech_name') and info.tech_name:
            tech_name = str(info.tech_name)
        elif hasattr(info, 'tech_organization') and info.tech_organization:
            tech_name = str(info.tech_organization)
        elif hasattr(info, 'tech_email') and info.tech_email:
            tech_name = str(info.tech_email)
        
        # Procesar name servers
        name_servers = []
        if info.name_servers:
            if isinstance(info.name_servers, list):
                name_servers = [str(ns) for ns in info.name_servers]
            else:
                name_servers = [str(info.name_servers)]
        
        # Crear estructura de datos
        whois_data = {
            'domain_name': objetivo,
            'registrar': registrar,
            'creation_date': creation_date,
            'expiration_date': expiration_date,
            'updated_date': updated_date,
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
            'name_servers': name_servers
        }
        
        # Verificar si tenemos información útil
        has_useful_info = (
            registrar != 'No disponible' or
            creation_date != 'No disponible' or
            expiration_date != 'No disponible' or
            registrant_name != 'No disponible' or
            len(name_servers) > 0
        )
        
        if has_useful_info:
            salida = f"🌐 Información WHOIS\n{json.dumps(whois_data, indent=2, ensure_ascii=False)}"
            return jsonify({'resultado': salida})
        
        # Si no tenemos información útil, continuar con el comando del sistema
        print("No useful info from python-whois, trying system command...")
        
    except Exception as e:
        print(f"python-whois failed: {e}")
        # Continuar con el comando del sistema
    
    # Intentar con el comando whois del sistema como fallback
    try:
        print(f"Trying system {WHOIS_CMD} command...")
        resultado = subprocess.check_output([WHOIS_CMD, objetivo], text=True, stderr=subprocess.STDOUT, timeout=30)
        
        print(f"WHOIS RAW RESULT FOR {objetivo}:")
        print("=" * 50)
        print(resultado)
        print("=" * 50)
        
        # Procesar el resultado del comando whois
        salida = procesar_whois_resultado(resultado, objetivo)
        
        # Si no se encontró información útil en el procesamiento, devolver el resultado raw
        if 'No disponible' in salida and len(resultado.strip()) > 50:
            print("No se pudo procesar la información, devolviendo resultado raw")
            return jsonify({'resultado': f"🌐 Información WHOIS\n\n{resultado}"})
        
        return jsonify({'resultado': salida})
        
    except FileNotFoundError:
        print(f"Comando {WHOIS_CMD} no encontrado")
        return jsonify({'resultado': f"❌ Error: No se pudo obtener información WHOIS para {objetivo}\n\nComando {WHOIS_CMD} no encontrado en el sistema."}), 500
    except subprocess.CalledProcessError as e:
        print(f"WHOIS command failed: {e}")
        return jsonify({'resultado': f"❌ Error al ejecutar comando WHOIS:\n{e.output}"}), 500
    except Exception as e:
        print(f"Unexpected error in WHOIS: {e}")
        return jsonify({'resultado': f"❌ Error inesperado:\n{str(e)}"}), 500

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
            
            # Información general del dominio
            if key == 'registrar':
                info['registrar'] = value
            elif key in ['created on', 'creation date', 'created']:
                info['creation_date'] = value
            elif key in ['expiration date', 'expires', 'expires on']:
                info['expiration_date'] = value
            elif key in ['last updated on', 'updated date', 'updated', 'last modified']:
                info['updated_date'] = value
            elif key in ['dns', 'name server', 'nameservers', 'name servers']:
                if value and value not in info['name_servers']:
                    info['name_servers'].append(value)
            
            # Información de contactos según la sección actual
            elif current_section and current_section in info:
                if key == 'name':
                    info[current_section]['name'] = value
                elif key == 'city':
                    info[current_section]['city'] = value
                elif key == 'state':
                    info[current_section]['state'] = value
                elif key == 'country':
                    info[current_section]['country'] = value
                elif key == 'organization' and info[current_section]['name'] == 'No disponible':
                    info[current_section]['name'] = value
                elif key == 'email' and info[current_section]['name'] == 'No disponible':
                    info[current_section]['name'] = value
    
    # Si no se encontró información en el formato estructurado, buscar en formato libre
    if info['registrar'] == 'No disponible':
        for line in lines:
            line = line.strip()
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower()
                value = value.strip()
                
                # Buscar registrar con diferentes variaciones
                if any(term in key for term in ['registrar', 'sponsoring registrar', 'registrar name']):
                    if value and value != 'No disponible':
                        info['registrar'] = value
                
                # Buscar fechas con diferentes variaciones
                elif any(term in key for term in ['created', 'creation', 'registered']):
                    if value and value != 'No disponible':
                        info['creation_date'] = value
                elif any(term in key for term in ['expiration', 'expires', 'expiry']):
                    if value and value != 'No disponible':
                        info['expiration_date'] = value
                elif any(term in key for term in ['updated', 'modified', 'last modified']):
                    if value and value != 'No disponible':
                        info['updated_date'] = value
                
                # Buscar name servers con diferentes variaciones
                elif any(term in key for term in ['name server', 'nameserver', 'dns', 'nserver']):
                    if value and value not in info['name_servers']:
                        info['name_servers'].append(value)
    
    # Verificar si tenemos información útil
    has_useful_info = (
        info['registrar'] != 'No disponible' or
        info['creation_date'] != 'No disponible' or
        info['expiration_date'] != 'No disponible' or
        info['updated_date'] != 'No disponible' or
        len(info['name_servers']) > 0 or
        any(contact['name'] != 'No disponible' for contact in [info['registrant'], info['admin_contact'], info['tech_contact'], info['billing_contact']])
    )
    
    if has_useful_info:
        salida = f"🌐 Información WHOIS\n{json.dumps(info, indent=2, ensure_ascii=False)}"
    else:
        # Si no se pudo extraer información estructurada, devolver el resultado raw
        salida = f"🌐 Información WHOIS (Resultado Raw)\n\n{whois_output}"
    
    return salida

# 🕵️‍♂️ Subfinder
@app.route('/subfinder', methods=['POST'])
def escanear_subfinder():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))
    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400
    try:
        resultado = subprocess.check_output([
            r'C:\Users\santi\go\bin\subfinder.exe',
            '-d', objetivo,
            '-silent'
        ], text=True, stderr=subprocess.STDOUT)
        salida = embellecer_subfinder(resultado)
    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en Subfinder:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500
    return jsonify({'resultado': salida})

# 🌐 Httpx
@app.route('/httpx', methods=['POST'])
def escanear_httpx():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))
    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400
    try:
        # Se espera que el usuario pase una lista de dominios (uno por línea)
        dominios = request.get_json().get('dominios', None)
        if not dominios:
            dominios = [objetivo]
        if isinstance(dominios, str):
            dominios = [dominios]
        # Escribir dominios a un archivo temporal
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, mode='w', encoding='utf-8') as f:
            for d in dominios:
                f.write(d + '\n')
            temp_path = f.name
        resultado = subprocess.check_output([
            r'C:\Users\santi\go\bin\httpx.exe',
            '-l', temp_path,
            '-silent'
        ], text=True, stderr=subprocess.STDOUT)
        os.unlink(temp_path)
        salida = embellecer_httpx(resultado)
    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en Httpx:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500
    return jsonify({'resultado': salida})

if __name__ == '__main__':
    app.run(debug=True)
