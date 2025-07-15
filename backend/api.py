from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'
app.config['MYSQL_DB'] = 'blitz_scan'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['MYSQL_PORT'] = 3306

mysql = MySQL(app)

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
                'creado_en': user['creado_en']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Credenciales incorrectas'}), 401

@app.route('/')
def home():
    return 'API BlitzScan funcionando'

if __name__ == '__main__':
    app.run(port=3001, debug=True)
