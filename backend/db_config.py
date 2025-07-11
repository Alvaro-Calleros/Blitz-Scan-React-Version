# backend/db_config.py
from flask_mysqldb import MySQL

def init_mysql(app):
    app.config['MYSQL_HOST'] = '127.0.0.1'
    app.config['MYSQL_USER'] = 'root'
    app.config['MYSQL_PASSWORD'] = '123456'
    app.config['MYSQL_DB'] = 'blitz_scan'
    app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
    return MySQL(app)