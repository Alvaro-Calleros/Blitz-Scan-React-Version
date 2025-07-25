#!/usr/bin/env python3
"""
Script para verificar escaneos en la base de datos
"""

from supabase_config import db

def check_scans():
    """Verifica los escaneos existentes en la base de datos"""
    print("🔍 Verificando escaneos en la base de datos...")
    
    try:
        # Obtener todos los escaneos
        scans = db.execute_query('SELECT id, id_usuario, url, tipo_escaneo, estado FROM escaneos ORDER BY id')
        
        if scans:
            print(f"✅ Se encontraron {len(scans)} escaneos:")
            for scan in scans:
                print(f"  ID: {scan['id']}, Usuario: {scan['id_usuario']}, URL: {scan['url']}, Tipo: {scan['tipo_escaneo']}, Estado: {scan['estado']}")
        else:
            print("❌ No se encontraron escaneos")
            
        return scans
        
    except Exception as e:
        print(f"❌ Error verificando escaneos: {e}")
        return []

if __name__ == '__main__':
    check_scans() 