import os
import json
import subprocess
import platform
from urllib.parse import urlparse
import glob
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
import whois
import requests

app = Flask(__name__)
CORS(app)

IS_WINDOWS = platform.system() == 'Windows'
WHOIS_CMD = 'whois64' if IS_WINDOWS else 'whois'

# Rutas de las herramientas instaladas
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DIRSEARCH_PATH = os.path.join(PROJECT_ROOT, 'dirsearch', 'dirsearch.py')
PARAMSPIDER_PATH = os.path.join(PROJECT_ROOT, 'ParamSpider')
WHATWEB_PATH = os.path.join(PROJECT_ROOT, 'WhatWeb')
THEHARVESTER_PATH = os.path.join(PROJECT_ROOT, 'theHarvester')

def limpiar_objetivo(url):
    print(f"Original URL: {url}")
    
    url = url.strip()
    
    if url.startswith('http://') or url.startswith('https://') or url.startswith('htttps://'):
        try:
            if url.startswith('htttps://'):
                url = url.replace('htttps://', 'https://')
            
            parsed_url = urlparse(url)
            domain = parsed_url.hostname
            print(f"Extracted domain: {domain}")
            return domain or url
        except Exception as e:
            print(f"Error parsing URL: {e}")
            return url
    
    domain = url.strip('/')
    print(f"Final domain: {domain}")
    return domain

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
    lineas = salida.splitlines()
    dominios_vivos = [l.strip() for l in lineas if l.strip() and not l.startswith('[')]
    if not dominios_vivos:
        return '🔍 No se encontraron dominios vivos.'
    salida_limpia = [f"🌐 Dominios vivos encontrados: {len(dominios_vivos)}"]
    salida_limpia += [f"✅ {d}" for d in dominios_vivos]
    return '\n'.join(salida_limpia)

def embellecer_nuclei(salida):
    lineas = salida.splitlines()
    vulnerabilidades = [l.strip() for l in lineas if l.strip() and not l.startswith('[')]
    if not vulnerabilidades:
        return '🔍 No se encontraron vulnerabilidades.'
    salida_limpia = [f"🚨 Vulnerabilidades encontradas: {len(vulnerabilidades)}"]
    salida_limpia += [f"⚠️ {v}" for v in vulnerabilidades]
    return '\n'.join(salida_limpia)

def embellecer_whatweb(salida):
    if isinstance(salida, list):
        techs = salida
    else:
        # Parsear la salida para extraer tecnologías y versiones
        import re
        m = re.search(r'\[\d{3} [A-Z]+\] (.+)', salida)
        techs = []
        if m:
            techs_raw = m.group(1)
            for t in techs_raw.split(','):
                t = t.strip()
                if not t:
                    continue
                # Extraer nombre y versión si existe
                name_ver = re.match(r'([\w\-\s]+)(\[(.*?)\])?', t)
                if name_ver:
                    name = name_ver.group(1).strip()
                    version = name_ver.group(3) if name_ver.group(3) else ''
                    techs.append({'name': name, 'version': version})
    
    if not techs:
        return '🔍 No se detectaron tecnologías.'
    
    # Agrupar por tipo básico usando keywords
    categories = {
        'CMS': ['WordPress', 'Drupal', 'Joomla'],
        'Web Server': ['Apache', 'Nginx', 'LiteSpeed', 'HTTPServer'],
        'Programming Language': ['PHP', 'Python', 'Django'],
        'JS Framework': ['jQuery', 'React', 'Angular', 'Vue.js', 'Express.js'],
        'CSS Framework': ['Bootstrap'],
        'Analytics': ['Google Analytics'],
        'CDN': ['Cloudflare'],
        'Other': []
    }
    
    techs_by_cat = {}
    for cat, keywords in categories.items():
        techs_by_cat[cat] = []
        for tech in techs:
            if any(keyword.lower() in tech['name'].lower() for keyword in keywords):
                techs_by_cat[cat].append(tech)
    
    # Agrupar el resto en "Other"
    for tech in techs:
        if not any(tech in cat_techs for cat_techs in techs_by_cat.values()):
            techs_by_cat['Other'].append(tech)
    
    # Limpiar categorías vacías
    techs_by_cat = {k: v for k, v in techs_by_cat.items() if v}
    
    return techs_by_cat

def embellecer_paramspider(salida):
    parametros = [l.strip() for l in salida.splitlines() if l.strip() and not l.startswith('[-]')]
    if not parametros:
        return '🔍 No se encontraron parámetros.'
    salida_limpia = [f"🕷️ Parámetros encontrados: {len(parametros)}"]
    salida_limpia += [f"✅ {p}" for p in parametros]
    return '\n'.join(salida_limpia)

def embellecer_theharvester(salida):
    emails = [l.strip() for l in salida.splitlines() if '@' in l and not l.startswith('[-]')]
    hosts = [l.strip() for l in salida.splitlines() if '.' in l and '@' not in l and not l.startswith('[-]')]
    if not emails and not hosts:
        return '🔍 No se encontraron emails ni hosts.'
    salida_limpia = []
    if emails:
        salida_limpia.append(f"📧 Emails encontrados: {len(emails)}")
        salida_limpia += [f"✅ {e}" for e in emails]
    if hosts:
        salida_limpia.append(f"🌐 Hosts encontrados: {len(hosts)}")
        salida_limpia += [f"✅ {h}" for h in hosts]
    return '\n'.join(salida_limpia)

@app.route('/escanear', methods=['POST'])
def escanear_nmap():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))
    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400
    try:
        resultado = subprocess.check_output([
            'nmap',
            '-sS',
            '-sV',
            '-O',
            '-p-',
            objetivo
        ], text=True, stderr=subprocess.STDOUT)
        salida = embellecer_nmap(resultado)
    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en Nmap:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500
    return jsonify({'resultado': salida})

@app.route('/dir', methods=['POST'])
def escanear_directorios():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))

    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400

    try:
        resultado = subprocess.check_output([
            'py', DIRSEARCH_PATH,
            '-u', f'https://{objetivo}',
            '-e', 'php,html,txt',
            '-x', '403,404,520',
            '--quiet',
            '--no-color',
            '--threads', '20'  
        ], text=True, stderr=subprocess.STDOUT)

        salida = embellecer_dirsearch(resultado)

    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en Dirsearch:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500

    return jsonify({'resultado': salida})


@app.route('/whois', methods=['POST'])
def escanear_whois():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))

    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún dominio.'}), 400

    print(f"WHOIS request for domain: {objetivo}")
    try:
        info = whois.whois(objetivo)

        # Procesar name servers
        name_servers = []
        if info.name_servers:
            if isinstance(info.name_servers, list):
                name_servers = [str(ns) for ns in info.name_servers]
            else:
                name_servers = [str(info.name_servers)]
        # Extraer información
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
        return jsonify({'resultado': whois_data})
    except Exception as e:
        print(f"Unexpected error in WHOIS: {e}")
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'})

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
            'subfinder',
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
            'httpx',
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

# 🕵️‍♂️ WhatWeb (Python-based)
@app.route('/whatweb', methods=['POST'])
def escanear_whatweb():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))
    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400
    try:
        import requests
        from bs4 import BeautifulSoup
        import re
        
        url = f'https://{objetivo}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')
        
        techs = []
        
        # Detectar tecnologías basadas en headers
        server = response.headers.get('Server', '')
        if server:
            techs.append({'name': server, 'version': ''})
        
        # Detectar tecnologías basadas en HTML
        # WordPress
        if 'wp-content' in html_content or 'wp-includes' in html_content:
            techs.append({'name': 'WordPress', 'version': ''})
        
        # jQuery
        jquery_match = re.search(r'jquery[.-](\d+\.\d+\.\d+)', html_content.lower())
        if jquery_match:
            techs.append({'name': 'jQuery', 'version': jquery_match.group(1)})
        elif 'jquery' in html_content.lower():
            techs.append({'name': 'jQuery', 'version': ''})
        
        # Bootstrap
        bootstrap_match = re.search(r'bootstrap[.-](\d+\.\d+\.\d+)', html_content.lower())
        if bootstrap_match:
            techs.append({'name': 'Bootstrap', 'version': bootstrap_match.group(1)})
        elif 'bootstrap' in html_content.lower():
            techs.append({'name': 'Bootstrap', 'version': ''})
        
        # React
        if 'react' in html_content.lower() or 'reactjs' in html_content.lower():
            techs.append({'name': 'React', 'version': ''})
        
        # Angular
        if 'ng-' in html_content or 'angular' in html_content.lower():
            techs.append({'name': 'Angular', 'version': ''})
        
        # Vue.js
        if 'vue' in html_content.lower():
            techs.append({'name': 'Vue.js', 'version': ''})
        
        # PHP
        if 'php' in html_content.lower() or '.php' in html_content:
            techs.append({'name': 'PHP', 'version': ''})
        
        # Python/Django
        if 'django' in html_content.lower() or 'csrfmiddlewaretoken' in html_content:
            techs.append({'name': 'Django', 'version': ''})
        
        # Node.js/Express
        if 'express' in html_content.lower():
            techs.append({'name': 'Express.js', 'version': ''})
        
        # Google Analytics
        if 'google-analytics' in html_content.lower() or 'gtag' in html_content.lower():
            techs.append({'name': 'Google Analytics', 'version': ''})
        
        # Cloudflare
        if 'cloudflare' in html_content.lower():
            techs.append({'name': 'Cloudflare', 'version': ''})
        
        # Meta tags
        meta_tags = soup.find_all('meta')
        for tag in meta_tags:
            name = tag.get('name', '').lower()
            content = tag.get('content', '').lower()
            
            if 'generator' in name:
                techs.append({'name': content.title(), 'version': ''})
            elif 'framework' in name:
                techs.append({'name': content.title(), 'version': ''})
        
        # Agrupar por tipo básico usando keywords
        categories = {
            'CMS': ['WordPress', 'Drupal', 'Joomla'],
            'Web Server': ['Apache', 'Nginx', 'LiteSpeed', 'HTTPServer'],
            'Programming Language': ['PHP', 'Python', 'Django'],
            'JS Framework': ['jQuery', 'React', 'Angular', 'Vue.js', 'Express.js'],
            'CSS Framework': ['Bootstrap'],
            'Analytics': ['Google Analytics'],
            'CDN': ['Cloudflare'],
            'Other': []
        }
        
        techs_by_cat = {}
        for cat, keywords in categories.items():
            techs_by_cat[cat] = []
            for tech in techs:
                if any(keyword.lower() in tech['name'].lower() for keyword in keywords):
                    techs_by_cat[cat].append(tech)
        
        # Agrupar el resto en "Other"
        for tech in techs:
            if not any(tech in cat_techs for cat_techs in techs_by_cat.values()):
                techs_by_cat['Other'].append(tech)
        
        # Limpiar categorías vacías
        techs_by_cat = {k: v for k, v in techs_by_cat.items() if v}
        
        return jsonify({'resultado': techs_by_cat})
        
    except requests.exceptions.RequestException as e:
        return jsonify({'resultado': f'❌ Error de conexión:\n{str(e)}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500

# 🕷️ ParamSpider
@app.route('/paramspider', methods=['POST'])
def escanear_paramspider():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))
    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400
    try:
        resultado = subprocess.check_output([
            'python', '-m', 'paramspider.main', '--domain', objetivo
        ], text=True, stderr=subprocess.STDOUT, cwd=r'C:\Users\alvar\Desktop\BLITZ_SCAN\Blitz-Scan-React-Version\ParamSpider')
        # Buscar el archivo de resultados generado
        results_dir = os.path.join(r'C:\Users\alvar\Desktop\BLITZ_SCAN\Blitz-Scan-React-Version\ParamSpider', 'results')
        if os.path.exists(results_dir):
            result_files = glob.glob(os.path.join(results_dir, f'*{objetivo}*.txt'))
            if result_files:
                with open(result_files[0], 'r') as f:
                    contenido = f.read()
                salida = embellecer_paramspider(contenido)
            else:
                salida = embellecer_paramspider(resultado)
        else:
            salida = embellecer_paramspider(resultado)
    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en ParamSpider:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500
    return jsonify({'resultado': salida})

# 🌾 theHarvester
@app.route('/theharvester', methods=['POST'])
def escanear_theharvester():
    objetivo = limpiar_objetivo(request.get_json().get('objetivo', ''))
    if not objetivo:
        return jsonify({'resultado': '❌ No se recibió ningún objetivo.'}), 400
    try:
        resultado = subprocess.check_output([
            'python', 'theHarvester.py', '-d', objetivo, '-b', 'all'
        ], text=True, stderr=subprocess.STDOUT, cwd=r'C:\Users\alvar\Desktop\BLITZ_SCAN\Blitz-Scan-React-Version\theHarvester')
        salida = embellecer_theharvester(resultado)
    except subprocess.CalledProcessError as e:
        return jsonify({'resultado': f'❌ Error en theHarvester:\n{e.output}'}), 500
    except Exception as e:
        return jsonify({'resultado': f'❌ Error inesperado:\n{str(e)}'}), 500
    return jsonify({'resultado': salida})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3001)
