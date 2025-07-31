#!/usr/bin/env python3
"""
Script para migrar datos de MySQL local a Supabase PostgreSQL
Ejecuta este script solo una vez para migrar datos existentes
"""

import hashlib
from backend.config.supabase_config import db
import json

def migrate_users():
    """Migra usuarios existentes de MySQL a Supabase"""
    print("Iniciando migración de usuarios...")
    
    # Aquí puedes agregar la lógica para leer datos de MySQL si los tienes
    # Por ahora, creamos un usuario de ejemplo
    
    # Usuario de ejemplo (cambia los datos según necesites)
    sample_users = [
        {
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@blitzscan.com',
            'password': 'admin123',  # Cambia esto por una contraseña segura
            'role': 'admin',
            'organizacion': 'BlitzScan'
        }
    ]
    
    for user_data in sample_users:
        # Verificar si el usuario ya existe
        existing_user = db.execute_one('SELECT * FROM usuarios WHERE email = %s', (user_data['email'],))
        
        if not existing_user:
            # Crear hash de la contraseña
            password_hash = hashlib.sha256(user_data['password'].encode()).hexdigest()
            
            # Insertar usuario
            db.execute_query(
                'INSERT INTO usuarios (first_name, last_name, email, password_hash, role, organizacion) VALUES (%s, %s, %s, %s, %s, %s)',
                (user_data['first_name'], user_data['last_name'], user_data['email'], 
                 password_hash, user_data['role'], user_data['organizacion'])
            )
            print(f"Usuario {user_data['email']} migrado correctamente")
        else:
            print(f"Usuario {user_data['email']} ya existe, saltando...")
    
    print("Migración completada!")

def migrate_scan_details():
    print("Iniciando migración de detalles de escaneos...")
    # Buscar escaneos con posibles detalles antiguos
    scans = db.execute_query('SELECT id, tipo_escaneo, detalles FROM escaneos WHERE detalles IS NOT NULL')
    for scan in scans:
        scan_id = scan['id']
        tipo = scan['tipo_escaneo']
        detalles = scan['detalles']
        try:
            detalles_obj = json.loads(detalles) if isinstance(detalles, str) else detalles
        except Exception as e:
            print(f"Error parseando detalles para escaneo {scan_id}: {e}")
            continue
        if tipo == 'whois' and detalles_obj.get('extraResult'):
            db.execute_query(
                'INSERT INTO whois_scans (id_escaneo, whois_data) VALUES (%s, %s) ON CONFLICT DO NOTHING',
                (scan_id, json.dumps(detalles_obj['extraResult']))
            )
            print(f"Migrado WHOIS para escaneo {scan_id}")
        elif tipo == 'nmap' and detalles_obj.get('extraResult'):
            db.execute_query(
                'INSERT INTO nmap_scans (id_escaneo, nmap_data) VALUES (%s, %s) ON CONFLICT DO NOTHING',
                (scan_id, json.dumps(detalles_obj['extraResult']))
            )
            print(f"Migrado NMAP para escaneo {scan_id}")
        elif tipo == 'fuzzing' and detalles_obj.get('results'):
            db.execute_query(
                'INSERT INTO fuzzing_scans (id_escaneo, fuzzing_data) VALUES (%s, %s) ON CONFLICT DO NOTHING',
                (scan_id, json.dumps(detalles_obj['results']))
            )
            print(f"Migrado FUZZING para escaneo {scan_id}")
    print("Migración de detalles completada!")

if __name__ == '__main__':
    try:
        migrate_users()
        migrate_scan_details()
    except Exception as e:
        print(f"Error durante la migración: {e}")
        print("Asegúrate de que:")
        print("1. Tu archivo .env está configurado correctamente")
        print("2. Las tablas existen en Supabase")
        print("3. Tienes conexión a internet") 