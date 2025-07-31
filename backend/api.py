from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import hashlib
import os
import json
from werkzeug.utils import secure_filename
from backend.config.supabase_config import db
import traceback
import requests
import openai

OPENAI_API_KEY = "" # Aqui va Tu API Key de OpenAI

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:8080"}})

UPLOAD_FOLDER = 'uploads'  # Carpeta donde guardarás las imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Crear carpeta uploads si no existe
def ensure_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
ensure_upload_folder()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Registro de usuario
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    organizacion = data.get('organization', '')
    role = 'user'  # Por defecto

    if not all([first_name, last_name, email, password, organizacion]):
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    # Verificar si el usuario ya existe
    existing_user = db.execute_one('SELECT * FROM usuarios WHERE email = %s', (email,))
    if existing_user:
        return jsonify({'success': False, 'message': 'El usuario ya existe'}), 409

    password_hash = hashlib.sha256(password.encode()).hexdigest()
    db.execute_query(
        'INSERT INTO usuarios (first_name, last_name, email, password_hash, role, organizacion) VALUES (%s, %s, %s, %s, %s, %s)',
        (first_name, last_name, email, password_hash, role, organizacion)
    )
    return jsonify({'success': True, 'message': 'Usuario registrado correctamente'})

# Login de usuario
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    user = db.execute_one('SELECT * FROM usuarios WHERE email = %s', (email,))

    if user and user['password_hash'] == hashlib.sha256(password.encode()).hexdigest():
        return jsonify({
            'success': True,
            'message': 'Login exitoso',
            'user': {
                'id': user['id'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'email': user['email'],
                'role': user['role'],
                'organizacion': user['organizacion'],
                'creado_en': user['creado_en'].isoformat() if user['creado_en'] else None,
                'profileImage': user['profile_image']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Credenciales incorrectas'}), 401

# Guardar escaneo en la base de datos
@app.route('/api/save-scan', methods=['POST'])
def save_scan():
    data = request.json
    user_id = data.get('userId')
    url = data.get('url')
    scan_type = data.get('scanType')
    # results y extra_result ya no se guardan en escaneos
    if not all([user_id, url, scan_type]):
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400
    try:
        # Insertar en escaneos y obtener el id
        result = db.execute_query(
            'INSERT INTO escaneos (id_usuario, url, tipo_escaneo, estado) VALUES (%s, %s, %s, %s) RETURNING id',
            (user_id, url, scan_type, 'completado')
        )
        if isinstance(result, dict) and 'id' in result:
            escaneo_id = result['id']
        else:
            raise Exception('No se pudo obtener el id del escaneo')

        # Guardar en la tabla de detalles según el tipo
        if scan_type == 'whois':
            whois_data = data.get('whoisData') or data.get('extraResult')
            if whois_data:
                db.execute_query(
                    'INSERT INTO whois_scans (id_escaneos, whois_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(whois_data))
                )
        elif scan_type == 'nmap':
            nmap_data = data.get('nmapData') or data.get('extraResult')
            if nmap_data:
                db.execute_query(
                    'INSERT INTO nmap_scans (id_escaneos, nmap_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(nmap_data))
                )
        elif scan_type == 'fuzzing':
            fuzzing_data = data.get('fuzzingData') or data.get('results') or data.get('extraResult')
            if fuzzing_data:
                db.execute_query(
                    'INSERT INTO fuzzing_scans (id_escaneos, fuzzing_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(fuzzing_data))
                )
        elif scan_type == 'theharvester':
            theharvester_data = data.get('theHarvesterData') or data.get('extraResult')
            if theharvester_data:
                db.execute_query(
                    'INSERT INTO theharvester_scans (id_escaneos, theharvester_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(theharvester_data))
                )
        elif scan_type == 'whatweb':
            whatweb_data = data.get('whatwebData') or data.get('extraResult')
            if whatweb_data:
                db.execute_query(
                    'INSERT INTO whatweb_scans (id_escaneos, whatweb_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(whatweb_data))
                )
        elif scan_type == 'paramspider':
            paramspider_data = data.get('paramspiderData') or data.get('extraResult')
            if paramspider_data:
                db.execute_query(
                    'INSERT INTO paramspider_scans (id_escaneos, paramspider_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(paramspider_data))
                )
        elif scan_type == 'subfinder':
            subfinder_data = data.get('subfinderData') or data.get('extraResult')
            if subfinder_data:
                db.execute_query(
                    'INSERT INTO subfinder_scans (id_escaneos, subfinder_data) VALUES (%s, %s)',
                    (escaneo_id, json.dumps(subfinder_data))
                )

        return jsonify({
            'success': True,
            'message': 'Escaneo guardado exitosamente',
            'scan_id': escaneo_id
        })
    except Exception as e:
        print(f"Error guardando escaneo: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al guardar el escaneo: {str(e)}'}), 500

# Obtener escaneos de un usuario (solo los no eliminados)
@app.route('/api/get-scans/<int:user_id>', methods=['GET'])
def get_user_scans(user_id):
    try:
        print(f"\n🔍 DEBUG: Obteniendo escaneos para usuario {user_id}")
        query = """
            SELECT id, url, tipo_escaneo, fecha, estado, created_at, eliminado
            FROM escaneos 
            WHERE id_usuario = %s AND eliminado = FALSE 
            ORDER BY fecha DESC
        """
        scans = db.execute_query(query, (user_id,))
        print(f"📊 DEBUG: Encontrados {len(scans) if scans else 0} escaneos")
        processed_scans = []
        for scan in scans:
            try:
                processed_scan = {
                    'id': str(scan.get('id', '')),
                    'url': scan.get('url', ''),
                    'scan_type': scan.get('tipo_escaneo', ''),
                    'timestamp': scan.get('fecha', ''),
                    'status': scan.get('estado', ''),
                    'created_at': scan.get('created_at', '')
                }
                processed_scans.append(processed_scan)
            except Exception as scan_error:
                print(f"❌ DEBUG: Error procesando escaneo {scan.get('id', 'unknown')}: {str(scan_error)}")
                import traceback
                traceback.print_exc()
                continue
        response_data = {
            'success': True,
            'scans': processed_scans
        }
        return jsonify(response_data)
    except Exception as e:
        print(f"❌ DEBUG: Error general: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error al obtener escaneos: {str(e)}'
        }), 500

# Obtener un escaneo específico (solo si no está eliminado)
@app.route('/api/get-scan/<int:scan_id>', methods=['GET'])
def get_scan(scan_id):
    try:
        scan = db.execute_one('SELECT * FROM escaneos WHERE id = %s AND eliminado = FALSE', (scan_id,))
        if not scan:
            return jsonify({'success': False, 'message': 'Escaneo no encontrado'}), 404
        # Manejar fechas de forma segura
        timestamp = None
        if scan['fecha']:
            if hasattr(scan['fecha'], 'isoformat'):
                timestamp = scan['fecha'].isoformat()
            else:
                timestamp = str(scan['fecha'])
        created_at = None
        if scan['created_at']:
            if hasattr(scan['created_at'], 'isoformat'):
                created_at = scan['created_at'].isoformat()
            else:
                created_at = str(scan['created_at'])
        # Buscar datos secundarios según tipo de escaneo
        details = None
        if scan['tipo_escaneo'] == 'whois':
            whois = db.execute_one('SELECT whois_data FROM whois_scans WHERE id_escaneos = %s', (scan_id,))
            details = whois['whois_data'] if whois else None
        elif scan['tipo_escaneo'] == 'nmap':
            nmap = db.execute_one('SELECT nmap_data FROM nmap_scans WHERE id_escaneos = %s', (scan_id,))
            details = nmap['nmap_data'] if nmap else None
        elif scan['tipo_escaneo'] == 'fuzzing':
            fuzzing = db.execute_one('SELECT fuzzing_data FROM fuzzing_scans WHERE id_escaneos = %s', (scan_id,))
            details = fuzzing['fuzzing_data'] if fuzzing else None
        elif scan['tipo_escaneo'] == 'theharvester':
            theharvester = db.execute_one('SELECT theharvester_data FROM theharvester_scans WHERE id_escaneos = %s', (scan_id,))
            details = theharvester['theharvester_data'] if theharvester else None
        elif scan['tipo_escaneo'] == 'whatweb':
            whatweb = db.execute_one('SELECT whatweb_data FROM whatweb_scans WHERE id_escaneos = %s', (scan_id,))
            details = whatweb['whatweb_data'] if whatweb else None
        elif scan['tipo_escaneo'] == 'paramspider':
            paramspider = db.execute_one('SELECT paramspider_data FROM paramspider_scans WHERE id_escaneos = %s', (scan_id,))
            details = paramspider['paramspider_data'] if paramspider else None
        elif scan['tipo_escaneo'] == 'subfinder':
            subfinder = db.execute_one('SELECT subfinder_data FROM subfinder_scans WHERE id_escaneos = %s', (scan_id,))
            details = subfinder['subfinder_data'] if subfinder else None
        # Construir respuesta: los metadatos + el JSON completo de la tabla secundaria
        response = {
            'id': scan['id'],
            'url': scan['url'],
            'scan_type': scan['tipo_escaneo'],
            'timestamp': timestamp,
            'status': scan['estado'],
            'created_at': created_at,
            'details': details
        }
        return jsonify({'success': True, 'scan': response})
    except Exception as e:
        print(f"Error obteniendo escaneo: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Error al obtener escaneo'}), 500

@app.route('/')
def home():
    return 'API BlitzScan funcionando con Supabase'

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/api/update-profile', methods=['POST', 'OPTIONS'])
def update_profile():
    # Si viene como FormData (con archivo)
    if 'profileImage' in request.files:
        user_id = request.form.get('id')
        file = request.files['profileImage']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"user_{user_id}_" + file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_url = f"/uploads/{filename}"

            db.execute_query('UPDATE usuarios SET profile_image=%s WHERE id=%s', (image_url, user_id))
            return jsonify({'success': True, 'message': 'Foto actualizada', 'profileImage': image_url})
        else:
            return jsonify({'success': False, 'message': 'Formato de imagen no permitido'}), 400

    # Si viene como JSON para otros datos (opcional, si quieres mantenerlo)
    data = request.json
    if data:
        user_id = data.get('id')
        # ... resto de lógica para actualizar otros campos ...
        return jsonify({'success': True, 'message': 'Perfil actualizado correctamente'})

    return jsonify({'success': False, 'message': 'No se envió información válida'}), 400

# Ocultar escaneo (soft delete)
@app.route('/api/hide-scan', methods=['POST'])
def hide_scan():
    data = request.json
    print("DEBUG POST /api/hide-scan:", data)  # <-- LOG DE DEPURACIÓN
    scan_id = data.get('scanId')
    user_id = data.get('userId')
    
    if not all([scan_id, user_id]):
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400
    
    try:
        scan_id = int(scan_id)
        user_id = int(user_id)
        # Verificar que el escaneo pertenece al usuario
        scan = db.execute_one(
            'SELECT * FROM escaneos WHERE id = %s AND id_usuario = %s AND eliminado = FALSE',
            (scan_id, user_id)
        )
        
        if not scan:
            return jsonify({'success': False, 'message': 'Escaneo no encontrado o no autorizado'}), 404
        
        # Marcar como eliminado (soft delete)
        db.execute_query(
            'UPDATE escaneos SET eliminado = TRUE, updated_at = NOW() WHERE id = %s',
            (scan_id,)
        )
        
        return jsonify({
            'success': True, 
            'message': 'Escaneo ocultado correctamente'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error ocultando escaneo: {e}")
        return jsonify({'success': False, 'message': f'Error al ocultar el escaneo: {str(e)}'}), 500

# Ocultar múltiples escaneos (soft delete)
@app.route('/api/hide-scans', methods=['POST'])
def hide_multiple_scans():
    data = request.json
    print("DEBUG POST /api/hide-scans:", data)  # <-- LOG DE DEPURACIÓN
    scan_ids = data.get('scanIds', [])
    user_id = data.get('userId')
    
    if not scan_ids or not user_id:
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400
    
    try:
        user_id = int(user_id)
        scan_ids_int = [int(sid) for sid in scan_ids]
        placeholders = ','.join(['%s'] * len(scan_ids_int))
        scans = db.execute_query(
            f'SELECT id FROM escaneos WHERE id IN ({placeholders}) AND id_usuario = %s AND eliminado = FALSE',
            (*scan_ids_int, user_id)
        )
        
        if len(scans) != len(scan_ids_int):
            return jsonify({'success': False, 'message': 'Algunos escaneos no encontrados o no autorizados'}), 404
        
        # Marcar como eliminados (soft delete)
        db.execute_query(
            f'UPDATE escaneos SET eliminado = TRUE, updated_at = NOW() WHERE id IN ({placeholders})',
            scan_ids_int
        )
        
        return jsonify({
            'success': True, 
            'message': f'{len(scan_ids_int)} escaneos ocultados correctamente'
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error ocultando escaneos: {e}")
        return jsonify({'success': False, 'message': f'Error al ocultar los escaneos: {str(e)}'}), 500

@app.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.json
    user_id = data.get('id')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not all([user_id, old_password, new_password]):
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    user = db.execute_one('SELECT password_hash FROM usuarios WHERE id = %s', (user_id,))
    if not user or user['password_hash'] != hashlib.sha256(old_password.encode()).hexdigest():
        return jsonify({'success': False, 'message': 'Contraseña actual incorrecta'}), 401

    new_hash = hashlib.sha256(new_password.encode()).hexdigest()
    db.execute_query('UPDATE usuarios SET password_hash=%s WHERE id=%s', (new_hash, user_id))
    return jsonify({'success': True, 'message': 'Contraseña actualizada correctamente'})

# --- ENDPOINTS PARA ESCANEOS WHOIS ---
@app.route('/api/save-whois-scan', methods=['POST'])
def save_whois_scan():
    data = request.json
    user_id = data.get('userId')
    url = data.get('url')
    whois_data = data.get('whoisData')
    estado = data.get('estado', 'completado')

    print('DEBUG WHOIS:', {'user_id': user_id, 'url': url, 'whois_data': whois_data, 'estado': estado})

    if not all([user_id, url, whois_data]):
        print('ERROR: Faltan datos requeridos')
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400

    try:
        result = db.execute_query(
            'INSERT INTO escaneos (id_usuario, url, tipo_escaneo, estado) VALUES (%s, %s, %s, %s) RETURNING id',
            (user_id, url, 'whois', estado)
        )
        if isinstance(result, dict) and 'id' in result:
            escaneo_id = result['id']
        else:
            raise Exception('No se pudo obtener el id del escaneo')
        db.execute_query(
            'INSERT INTO whois_scans (id_escaneos, whois_data) VALUES (%s, %s)',
            (escaneo_id, json.dumps(whois_data))
        )
        return jsonify({'success': True, 'message': 'Escaneo WHOIS guardado exitosamente', 'scan_id': escaneo_id})
    except Exception as e:
        print(f"Error guardando escaneo WHOIS: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al guardar el escaneo WHOIS: {str(e)}'}), 500

@app.route('/api/get-whois-scans/<int:user_id>', methods=['GET'])
def get_whois_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, w.whois_data
            FROM escaneos e
            JOIN whois_scans w ON e.id = w.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'whois' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos WHOIS: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos WHOIS'}), 500

# --- ENDPOINTS PARA ESCANEOS NMAP ---
@app.route('/api/save-nmap-scan', methods=['POST'])
def save_nmap_scan():
    data = request.json
    user_id = data.get('userId')
    url = data.get('url')
    nmap_data = data.get('nmapData')
    estado = data.get('estado', 'completado')

    print('DEBUG NMAP:', {'user_id': user_id, 'url': url, 'nmap_data': nmap_data, 'estado': estado})

    if not all([user_id, url, nmap_data]):
        print('ERROR: Faltan datos requeridos')
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400

    try:
        result = db.execute_query(
            'INSERT INTO escaneos (id_usuario, url, tipo_escaneo, estado) VALUES (%s, %s, %s, %s) RETURNING id',
            (user_id, url, 'nmap', estado)
        )
        if isinstance(result, dict) and 'id' in result:
            escaneo_id = result['id']
        else:
            raise Exception('No se pudo obtener el id del escaneo')
        db.execute_query(
            'INSERT INTO nmap_scans (id_escaneos, nmap_data) VALUES (%s, %s)',
            (escaneo_id, json.dumps(nmap_data))
        )
        return jsonify({'success': True, 'message': 'Escaneo NMAP guardado exitosamente', 'scan_id': escaneo_id})
    except Exception as e:
        print(f"Error guardando escaneo NMAP: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al guardar el escaneo NMAP: {str(e)}'}), 500

@app.route('/api/get-nmap-scans/<int:user_id>', methods=['GET'])
def get_nmap_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, n.nmap_data
            FROM escaneos e
            JOIN nmap_scans n ON e.id = n.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'nmap' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos NMAP: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos NMAP'}), 500

# --- ENDPOINTS PARA ESCANEOS FUZZING ---
@app.route('/api/save-fuzzing-scan', methods=['POST'])
def save_fuzzing_scan():
    data = request.json
    user_id = data.get('userId')
    url = data.get('url')
    fuzzing_data = data.get('fuzzingData')
    estado = data.get('estado', 'completado')

    print('DEBUG FUZZING:', {'user_id': user_id, 'url': url, 'fuzzing_data': fuzzing_data, 'estado': estado})

    if not all([user_id, url, fuzzing_data]):
        print('ERROR: Faltan datos requeridos')
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400

    try:
        result = db.execute_query(
            'INSERT INTO escaneos (id_usuario, url, tipo_escaneo, estado) VALUES (%s, %s, %s, %s) RETURNING id',
            (user_id, url, 'fuzzing', estado)
        )
        if isinstance(result, dict) and 'id' in result:
            escaneo_id = result['id']
        else:
            raise Exception('No se pudo obtener el id del escaneo')
        db.execute_query(
            'INSERT INTO fuzzing_scans (id_escaneos, fuzzing_data) VALUES (%s, %s)',
            (escaneo_id, json.dumps(fuzzing_data))
        )
        return jsonify({'success': True, 'message': 'Escaneo FUZZING guardado exitosamente', 'scan_id': escaneo_id})
    except Exception as e:
        print(f"Error guardando escaneo FUZZING: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al guardar el escaneo FUZZING: {str(e)}'}), 500

@app.route('/api/get-fuzzing-scans/<int:user_id>', methods=['GET'])
def get_fuzzing_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, f.fuzzing_data
            FROM escaneos e
            JOIN fuzzing_scans f ON e.id = f.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'fuzzing' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos FUZZING: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos FUZZING'}), 500

# --- ENDPOINTS PARA ESCANEOS SUBFINDER ---
@app.route('/api/get-subfinder-scans/<int:user_id>', methods=['GET'])
def get_subfinder_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, s.subfinder_data
            FROM escaneos e
            JOIN subfinder_scans s ON e.id = s.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'subfinder' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos SUBFINDER: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos SUBFINDER'}), 500

# --- ENDPOINTS PARA ESCANEOS PARAMSPIDER ---
@app.route('/api/get-paramspider-scans/<int:user_id>', methods=['GET'])
def get_paramspider_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, p.paramspider_data
            FROM escaneos e
            JOIN paramspider_scans p ON e.id = p.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'paramspider' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos PARAMSPIDER: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos PARAMSPIDER'}), 500

# --- ENDPOINTS PARA ESCANEOS WHATWEB ---
@app.route('/api/get-whatweb-scans/<int:user_id>', methods=['GET'])
def get_whatweb_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, w.whatweb_data
            FROM escaneos e
            JOIN whatweb_scans w ON e.id = w.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'whatweb' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos WHATWEB: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos WHATWEB'}), 500

# --- ENDPOINTS PARA ESCANEOS THEHARVESTER ---
@app.route('/api/get-theharvester-scans/<int:user_id>', methods=['GET'])
def get_theharvester_scans(user_id):
    try:
        scans = db.execute_query(
            '''
            SELECT e.id, e.url, e.fecha, e.estado, t.theharvester_data
            FROM escaneos e
            JOIN theharvester_scans t ON e.id = t.id_escaneos
            WHERE e.id_usuario = %s AND e.tipo_escaneo = 'theharvester' AND e.eliminado = FALSE
            ORDER BY e.fecha DESC
            ''',
            (user_id,)
        )
        return jsonify({'success': True, 'scans': scans})
    except Exception as e:
        print(f"Error obteniendo escaneos THEHARVESTER: {e}")
        return jsonify({'success': False, 'message': 'Error al obtener escaneos THEHARVESTER'}), 500


# IA para generar reportes, LLM local con ollama
@app.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.get_json()
    scan_type = data.get('scan_type')
    scan_data = data.get('scan_data')
    conversation_context = data.get('context', {})  # Contexto de la conversación

    if not scan_type or not scan_data:
        return jsonify({'error': 'Missing scan_type or scan_data'}), 400

    # Determinar el tipo de consulta
    is_general_chat = scan_type == 'chat'
    
    if is_general_chat:
        # Chat general - prompt más conversacional con contexto
        context_info = ""
        if conversation_context.get('currentScan'):
            scan = conversation_context['currentScan']
            context_info = f"\nCONTEXTO DEL ESCANEO ACTUAL: {scan.get('type', 'N/A')} en {scan.get('url', 'N/A')}"
        
        history_info = ""
        if conversation_context.get('conversationHistory'):
            history = conversation_context['conversationHistory']
            if len(history) > 0:
                recent_messages = history[-3:]  # Últimos 3 mensajes
                history_info = "\nHISTORIAL RECIENTE:\n" + "\n".join([f"{msg['sender']}: {msg['text']}" for msg in recent_messages])
        
        prompt = f"""
Eres BlitzScanIA, un asistente de ciberseguridad amigable y experto.

INSTRUCCIONES:
- Responde de forma clara y accesible
- Proporciona información práctica y útil
- SOLO recomienda herramientas que están disponibles en BlitzScan
- Mantén un tono conversacional pero profesional
- NO generes reportes estructurados para preguntas simples
- Usa markdown para formatear cuando sea apropiado
- Considera el contexto de la conversación previa
- Si hay un escaneo activo, referencia sus resultados cuando sea relevante
- NO menciones herramientas externas como Nessus, OpenVAS, OWASP ZAP, etc.

HERRAMIENTAS DISPONIBLES EN BLITZSCAN:
- Fuzzing Web: Búsqueda de directorios y archivos ocultos
- Nmap Scan: Escaneo de puertos y servicios  
- WHOIS Lookup: Información del dominio y registrante
- Subfinder: Enumeración de subdominios
- ParamSpider: Extracción de parámetros vulnerables
- WhatWeb: Fingerprinting de tecnologías web
- theHarvester: Recolección de correos y hosts públicos

PREGUNTA DEL USUARIO: {scan_data}
{context_info}
{history_info}

Responde de manera natural y útil, recomendando SOLO las herramientas de BlitzScan.
"""
    else:
        # Reporte de seguridad estructurado
        context_info = ""
        if conversation_context.get('currentScan'):
            scan = conversation_context['currentScan']
            context_info = f"\nCONTEXTO DEL ESCANEO: {scan.get('type', 'N/A')} en {scan.get('url', 'N/A')} - {scan.get('timestamp', 'N/A')}"
        
        prompt = f"""
Eres BlitzScanIA, un experto asistente de ciberseguridad especializado en análisis de seguridad web.

TAREA: Generar un reporte de seguridad profesional y estructurado.

INSTRUCCIONES:
- Analiza los datos del escaneo proporcionados
- Identifica vulnerabilidades y riesgos específicos
- Proporciona recomendaciones prácticas y priorizadas
- Usa un tono profesional pero accesible
- Estructura la respuesta con secciones claras usando markdown
- Considera el contexto del escaneo actual
- Incluye métricas de riesgo cuando sea posible
- SOLO recomienda herramientas de BlitzScan para análisis adicionales
- NO menciones herramientas externas como Nessus, OpenVAS, OWASP ZAP, etc.

HERRAMIENTAS DISPONIBLES EN BLITZSCAN PARA ANÁLISIS ADICIONALES:
- Fuzzing Web: Para encontrar rutas sensibles y archivos ocultos
- Nmap Scan: Para análisis completo de puertos y servicios
- WHOIS Lookup: Para información del dominio y registrante
- Subfinder: Para enumeración de subdominios
- ParamSpider: Para detectar parámetros vulnerables
- WhatWeb: Para fingerprinting de tecnologías
- theHarvester: Para recolección de información de la organización

FORMATO DEL REPORTE:
## 🔍 Resumen Ejecutivo
[Breve resumen de los hallazgos principales]

## 🚨 Vulnerabilidades Detectadas
[Lista de vulnerabilidades encontradas con nivel de riesgo]

## 📊 Análisis de Riesgo
[Evaluación del impacto y probabilidad]

## 🛡️ Recomendaciones Prioritarias
[Acciones específicas para mitigar riesgos]

## 📈 Medidas Preventivas
[Estrategias para prevenir futuros incidentes]

## 🔧 Análisis Adicional Recomendado
[Herramientas de BlitzScan para análisis complementarios]

TIPO DE ESCANEO: {scan_type}
DATOS DEL ESCANEO:
{scan_data}
{context_info}

Genera el reporte siguiendo el formato especificado con markdown.
"""

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres BlitzScanIA, un asistente de ciberseguridad experto y profesional."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        report = response.choices[0].message.content
        return jsonify({"report": report})
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Siempre devolver un campo 'report' para el frontend
        return jsonify({"report": f"Error al generar el reporte con IA: {str(e)}"}), 200

# --- ENDPOINT PARA GUARDAR REPORTE DE IA ---
@app.route('/api/save-report', methods=['POST'])
def save_report():
    data = request.json
    user_id = data.get('userId')
    scan_id = data.get('scanId')
    report_text = data.get('reportText')
    if not all([user_id, scan_id, report_text]):
        return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400
    try:
        # Verificar que el escaneo pertenece al usuario
        scan = db.execute_one('SELECT * FROM escaneos WHERE id = %s AND id_usuario = %s', (scan_id, user_id))
        if not scan:
            return jsonify({'success': False, 'message': 'Escaneo no encontrado o no autorizado'}), 404
        # Guardar el reporte como JSONB (puede ser solo texto plano)
        db.execute_query(
            'INSERT INTO reportes (id_escaneos, reporte_data) VALUES (%s, %s)',
            (scan_id, json.dumps({'reporte': report_text}))
        )
        return jsonify({'success': True, 'message': 'Reporte guardado exitosamente'})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al guardar el reporte: {str(e)}'}), 500

# --- ENDPOINT PARA OBTENER REPORTE DE IA DE UN ESCANEO ---
@app.route('/api/get-report/<int:scan_id>', methods=['GET'])
def get_report(scan_id):
    try:
        reporte = db.execute_one('SELECT * FROM reportes WHERE id_escaneos = %s ORDER BY created_at DESC LIMIT 1', (scan_id,))
        if not reporte:
            return jsonify({'success': False, 'message': 'No se encontró reporte para este escaneo'}), 404
        return jsonify({'success': True, 'reporte': reporte['reporte_data'], 'created_at': reporte['created_at']})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error al obtener el reporte: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(port=3001, debug=True)
