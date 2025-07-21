#!/usr/bin/env python3
"""
Script para probar la funcionalidad de actualización de foto de perfil
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_profile_image_update():
    """Prueba la actualización de foto de perfil"""
    print("🧪 Probando actualización de foto de perfil...")
    
    # URL del servidor
    base_url = "http://localhost:3001"
    
    # Datos de prueba
    test_user_id = 1  # Cambia esto por un ID de usuario real
    
    # Crear un archivo de imagen de prueba
    test_image_path = "test_image.jpg"
    test_image_content = b"fake_image_content"
    
    with open(test_image_path, "wb") as f:
        f.write(test_image_content)
    
    try:
        # Probar la actualización de foto
        with open(test_image_path, "rb") as f:
            files = {'profileImage': ('test.jpg', f, 'image/jpeg')}
            data = {'id': test_user_id}
            
            response = requests.post(
                f"{base_url}/api/update-profile",
                files=files,
                data=data
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Actualización de foto exitosa")
            
            # Verificar que se guardó en la base de datos
            from supabase_config import db
            user = db.execute_one('SELECT profile_image FROM usuarios WHERE id = %s', (test_user_id,))
            if user and user['profile_image']:
                print(f"✅ Foto guardada en BD: {user['profile_image']}")
            else:
                print("❌ Foto no encontrada en la base de datos")
        else:
            print("❌ Error en la actualización")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        # Limpiar archivo de prueba
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def test_upload_folder():
    """Verifica que la carpeta uploads existe"""
    print("📁 Verificando carpeta uploads...")
    
    upload_folder = "uploads"
    if os.path.exists(upload_folder):
        print(f"✅ Carpeta {upload_folder} existe")
        files = os.listdir(upload_folder)
        print(f"📄 Archivos en uploads: {files}")
    else:
        print(f"❌ Carpeta {upload_folder} no existe")

def test_database_column():
    """Verifica que la columna profile_image existe"""
    print("🗄️ Verificando columna profile_image...")
    
    try:
        from supabase_config import db
        
        # Verificar si la columna existe
        result = db.execute_one("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'usuarios' 
            AND column_name = 'profile_image'
        """)
        
        if result:
            print("✅ Columna profile_image existe en la tabla usuarios")
        else:
            print("❌ Columna profile_image NO existe")
            print("💡 Ejecuta el script update_profile_image_column.sql en Supabase")
            
    except Exception as e:
        print(f"❌ Error verificando columna: {e}")

if __name__ == '__main__':
    print("🚀 Iniciando pruebas de foto de perfil")
    print("=" * 50)
    
    test_upload_folder()
    test_database_column()
    test_profile_image_update()
    
    print("\n" + "=" * 50)
    print("📝 Para probar completamente:")
    print("1. Ejecuta el script SQL en Supabase")
    print("2. Inicia el servidor: python api.py")
    print("3. Ejecuta este script: python test_profile_image.py") 