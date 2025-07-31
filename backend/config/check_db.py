from backend.config.supabase_config import db
import json

def check_scans():
    try:
        print("\n🔍 Verificando escaneos en la base de datos...")
        scans = db.execute_query('SELECT * FROM escaneos WHERE id_usuario = %s', (2,))
        
        if not scans:
            print("❌ No se encontraron escaneos para el usuario 2")
            return
        
        print(f"\n✅ Se encontraron {len(scans)} escaneos:")
        for scan in scans:
            print(f"\n📋 Escaneo ID: {scan['id']}")
            print(f"   URL: {scan['url']}")
            print(f"   Tipo: {scan['tipo_escaneo']}")
            print(f"   Estado: {scan['estado']}")
            print(f"   Eliminado: {scan['eliminado']}")
            print(f"   Fecha: {scan['fecha']}")
            
            if scan['detalles']:
                try:
                    detalles = scan['detalles'] if isinstance(scan['detalles'], dict) else json.loads(scan['detalles'])
                    print("\n   Detalles:")
                    print(f"   {json.dumps(detalles, indent=2)}")
                except Exception as e:
                    print(f"   Error parseando detalles: {e}")
    
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_scans() 