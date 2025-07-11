from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'
app.config['MYSQL_DB'] = 'blitz_scan'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

# Registro de usuario
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    if not (first_name and last_name and email and password):
        return jsonify({'error': 'Faltan datos'}), 400
    password_hash = generate_password_hash(password)
    try:
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO usuarios (first_name, last_name, email, password_hash) VALUES (%s, %s, %s, %s)",
                    (first_name, last_name, email, password_hash))
        mysql.connection.commit()
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Login de usuario
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not (email and password):
        return jsonify({'error': 'Faltan datos'}), 400
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    user = cur.fetchone()
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            'id': user['id'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'email': user['email'],
            'role': user['role']
        })
    else:
        return jsonify({'error': 'Credenciales incorrectas'}), 401

@app.route('/')
def home():
    return 'API BlitzScan funcionando'

if __name__ == '__main__':
    app.run(port=3001, debug=True)