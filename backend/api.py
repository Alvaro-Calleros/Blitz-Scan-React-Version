from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS
import hashlib
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:8080"}})

# Configuración de la base de datos
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'
app.config['MYSQL_DB'] = 'blitz_scan'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['MYSQL_PORT'] = 3306

UPLOAD_FOLDER = 'uploads'  # Carpeta donde guardarás las imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Crear carpeta uploads si no existe
def ensure_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
ensure_upload_folder()

mysql = MySQL(app)

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

    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM usuarios WHERE email = %s', (email,))
    if cur.fetchone():
        cur.close()
        return jsonify({'success': False, 'message': 'El usuario ya existe'}), 409

    password_hash = hashlib.sha256(password.encode()).hexdigest()
    cur.execute(
        'INSERT INTO usuarios (first_name, last_name, email, password_hash, role, organizacion) VALUES (%s, %s, %s, %s, %s, %s)',
        (first_name, last_name, email, password_hash, role, organizacion)
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({'success': True, 'message': 'Usuario registrado correctamente'})

# Login de usuario
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM usuarios WHERE email = %s', (email,))
    user = cur.fetchone()
    cur.close()

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
                'creado_en': user['creado_en'],
                'profileImage': user['profile_image']  # <-- AGREGA ESTA LÍNEA
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Credenciales incorrectas'}), 401

@app.route('/')
def home():
    return 'API BlitzScan funcionando'

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

            cur = mysql.connection.cursor()
            cur.execute('UPDATE usuarios SET profile_image=%s WHERE id=%s', (image_url, user_id))
            mysql.connection.commit()
            cur.close()
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

@app.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.json
    user_id = data.get('id')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not all([user_id, old_password, new_password]):
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400

    cur = mysql.connection.cursor()
    cur.execute('SELECT password_hash FROM usuarios WHERE id = %s', (user_id,))
    user = cur.fetchone()
    if not user or user['password_hash'] != hashlib.sha256(old_password.encode()).hexdigest():
        cur.close()
        return jsonify({'success': False, 'message': 'Contraseña actual incorrecta'}), 401

    new_hash = hashlib.sha256(new_password.encode()).hexdigest()
    cur.execute('UPDATE usuarios SET password_hash=%s WHERE id=%s', (new_hash, user_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({'success': True, 'message': 'Contraseña actualizada correctamente'})

if __name__ == '__main__':
    app.run(port=3001, debug=True)
