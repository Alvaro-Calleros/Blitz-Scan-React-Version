import sys
import os
import json
from datetime import datetime

# Agregar el directorio padre al path para importar módulos del backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_config import db

def test_db_connection():
    """Verifica la conexión con Supabase"""
    try:
        with db.get_connection() as conn:
            with db.get_cursor(conn) as cur:
                cur.execute('SELECT NOW()')
                result = cur.fetchone()
                print("✅ Conexión a Supabase exitosa")
                print(f"   Timestamp del servidor: {result['now']}")
                return True
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {str(e)}")
        return False

def test_table_structure():
    """Verifica la estructura de las tablas principales"""
    tables = ['usuarios', 'escaneos', 'reportes']
    try:
        with db.get_connection() as conn:
            with db.get_cursor(conn) as cur:
                for table in tables:
                    # Obtener información de columnas
                    cur.execute(f"""
                        SELECT column_name, data_type, is_nullable
                        FROM information_schema.columns
                        WHERE table_name = '{table}'
                        ORDER BY ordinal_position;
                    """)
                    columns = cur.fetchall()
                    
                    if columns:
                        print(f"\n✅ Tabla '{table}' existe")
                        print("   Columnas:")
                        for col in columns:
                            print(f"   - {col['column_name']}: {col['data_type']} (Nullable: {col['is_nullable']})")
                    else:
                        print(f"\n❌ Tabla '{table}' no encontrada")
                        
                    # Verificar índices
                    cur.execute(f"""
                        SELECT indexname, indexdef
                        FROM pg_indexes
                        WHERE tablename = '{table}';
                    """)
                    indexes = cur.fetchall()
                    if indexes:
                        print("   Índices:")
                        for idx in indexes:
                            print(f"   - {idx['indexname']}")
                return True
    except Exception as e:
        print(f"❌ Error verificando estructura: {str(e)}")
        return False

def test_scan_data():
    """Verifica los datos de escaneos existentes"""
    try:
        with db.get_connection() as conn:
            with db.get_cursor(conn) as cur:
                # Contar escaneos por tipo
                cur.execute("""
                    SELECT tipo_escaneo, COUNT(*) as total,
                           COUNT(*) FILTER (WHERE eliminado = FALSE) as activos,
                           COUNT(*) FILTER (WHERE eliminado = TRUE) as ocultos
                    FROM escaneos
                    GROUP BY tipo_escaneo;
                """)
                stats = cur.fetchall()
                
                print("\n📊 Estadísticas de escaneos:")
                for stat in stats:
                    print(f"\n   Tipo: {stat['tipo_escaneo']}")
                    print(f"   - Total: {stat['total']}")
                    print(f"   - Activos: {stat['activos']}")
                    print(f"   - Ocultos: {stat['ocultos']}")
                
                # Verificar estructura de detalles JSONB
                cur.execute("""
                    SELECT id, tipo_escaneo, detalles
                    FROM escaneos
                    WHERE detalles IS NOT NULL
                    LIMIT 1;
                """)
                sample = cur.fetchone()
                
                if sample:
                    print("\n📋 Ejemplo de estructura JSONB:")
                    print(f"   Escaneo ID: {sample['id']}")
                    print(f"   Tipo: {sample['tipo_escaneo']}")
                    print(f"   Detalles: {json.dumps(sample['detalles'], indent=2)}")
                
                return True
    except Exception as e:
        print(f"❌ Error verificando datos: {str(e)}")
        return False

def run_all_tests():
    """Ejecuta todas las pruebas de base de datos"""
    print("\n🔍 Iniciando pruebas de base de datos...\n")
    
    # Probar conexión
    if not test_db_connection():
        print("\n❌ Pruebas canceladas: No se pudo conectar a la base de datos")
        return
    
    # Verificar estructura
    print("\n📚 Verificando estructura de la base de datos...")
    test_table_structure()
    
    # Verificar datos
    print("\n🔍 Verificando datos de escaneos...")
    test_scan_data()
    
    print("\n✨ Pruebas de base de datos completadas!")

if __name__ == "__main__":
    run_all_tests() 