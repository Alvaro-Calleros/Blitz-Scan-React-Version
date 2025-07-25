#!/usr/bin/env python3
"""
Script para verificar y aplicar cambios en la base de datos
"""

def check_and_fix_database():
    """Verifica y aplica cambios necesarios en la BD"""
    print("🔍 Verificando estado de la base de datos...")
    print("=" * 50)
    
    try:
        from supabase_config import db
        
        # 1. Verificar si existe la columna eliminado en escaneos
        print("1️⃣ Verificando columna 'eliminado' en tabla escaneos...")
        result = db.execute_one("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'escaneos' AND column_name = 'eliminado'
        """)
        
        if result:
            print("✅ Columna 'eliminado' ya existe en tabla escaneos")
        else:
            print("❌ Columna 'eliminado' NO existe en tabla escaneos")
            print("   Aplicando cambios...")
            
            # Agregar la columna
            db.execute_query("ALTER TABLE escaneos ADD COLUMN eliminado BOOLEAN DEFAULT FALSE")
            print("✅ Columna 'eliminado' agregada a tabla escaneos")
        
        # 2. Verificar si existe la columna eliminado en reportes
        print("\n2️⃣ Verificando columna 'eliminado' en tabla reportes...")
        result = db.execute_one("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'reportes' AND column_name = 'eliminado'
        """)
        
        if result:
            print("✅ Columna 'eliminado' ya existe en tabla reportes")
        else:
            print("❌ Columna 'eliminado' NO existe en tabla reportes")
            print("   Aplicando cambios...")
            
            # Agregar la columna
            db.execute_query("ALTER TABLE reportes ADD COLUMN eliminado BOOLEAN DEFAULT FALSE")
            print("✅ Columna 'eliminado' agregada a tabla reportes")
        
        # 3. Crear índices si no existen
        print("\n3️⃣ Verificando índices...")
        try:
            db.execute_query("CREATE INDEX IF NOT EXISTS idx_escaneos_eliminado ON escaneos(eliminado) WHERE eliminado = FALSE")
            print("✅ Índice para escaneos creado/verificado")
        except Exception as e:
            print(f"⚠️  Error creando índice de escaneos: {e}")
        
        try:
            db.execute_query("CREATE INDEX IF NOT EXISTS idx_reportes_eliminado ON reportes(eliminado) WHERE eliminado = FALSE")
            print("✅ Índice para reportes creado/verificado")
        except Exception as e:
            print(f"⚠️  Error creando índice de reportes: {e}")
        
        # 4. Verificar datos existentes
        print("\n4️⃣ Verificando datos existentes...")
        
        # Contar escaneos totales
        total_scans = db.execute_one("SELECT COUNT(*) as count FROM escaneos")
        if total_scans:
            print(f"📊 Total de escaneos: {total_scans['count']}")
        
        # Contar escaneos activos
        active_scans = db.execute_one("SELECT COUNT(*) as count FROM escaneos WHERE eliminado = FALSE")
        if active_scans:
            print(f"📊 Escaneos activos: {active_scans['count']}")
        
        # Contar escaneos ocultados
        hidden_scans = db.execute_one("SELECT COUNT(*) as count FROM escaneos WHERE eliminado = TRUE")
        if hidden_scans:
            print(f"📊 Escaneos ocultados: {hidden_scans['count']}")
        
        # 5. Mostrar algunos escaneos de ejemplo
        print("\n5️⃣ Mostrando algunos escaneos de ejemplo...")
        example_scans = db.execute_query("""
            SELECT id, id_usuario, url, tipo_escaneo, eliminado, created_at 
            FROM escaneos 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        
        if example_scans:
            for i, scan in enumerate(example_scans, 1):
                status = "🟢 Activo" if not scan['eliminado'] else "🔴 Oculto"
                print(f"   {i}. ID {scan['id']}: {scan['url']} ({scan['tipo_escaneo']}) - {status}")
        else:
            print("   No hay escaneos en la base de datos")
        
        print("\n" + "=" * 50)
        print("🎉 ¡Verificación completada!")
        print("✅ La base de datos está lista para usar soft delete")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando BD: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    check_and_fix_database() 