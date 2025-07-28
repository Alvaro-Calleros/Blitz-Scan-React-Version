#!/usr/bin/env python3
"""
Script para actualizar la base de datos con las nuevas tablas de escaneos
"""

import os
import sys
from supabase_config import db

def read_sql_file(filename):
    """Lee el archivo SQL y retorna su contenido"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {filename}")
        return None
    except Exception as e:
        print(f"❌ Error leyendo archivo {filename}: {e}")
        return None

def execute_sql_queries(sql_content):
    """Ejecuta los queries SQL"""
    if not sql_content:
        return False
    
    # Dividir el SQL en queries individuales
    queries = [q.strip() for q in sql_content.split(';') if q.strip()]
    
    success_count = 0
    total_queries = len(queries)
    
    print(f"🚀 Ejecutando {total_queries} queries...")
    
    for i, query in enumerate(queries, 1):
        if not query or query.startswith('--'):
            continue
            
        try:
            print(f"📝 Ejecutando query {i}/{total_queries}...")
            result = db.execute_query(query)
            success_count += 1
            print(f"✅ Query {i} ejecutado exitosamente")
            
        except Exception as e:
            print(f"❌ Error en query {i}: {e}")
            print(f"Query problemático: {query[:100]}...")
            continue
    
    print(f"\n📊 Resumen: {success_count}/{total_queries} queries ejecutados exitosamente")
    return success_count == total_queries

def verify_tables():
    """Verifica que las tablas se crearon correctamente"""
    print("\n🔍 Verificando tablas creadas...")
    
    verification_query = """
    SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
    FROM information_schema.columns 
    WHERE table_name IN (
        'theharvester_scans',
        'whatweb_scans', 
        'paramspider_scans',
        'subfinder_scans'
    )
    ORDER BY table_name, ordinal_position;
    """
    
    try:
        result = db.execute_query(verification_query)
        
        if result:
            print("✅ Tablas encontradas:")
            current_table = None
            for row in result:
                if row['table_name'] != current_table:
                    current_table = row['table_name']
                    print(f"\n📋 Tabla: {current_table}")
                print(f"  - {row['column_name']}: {row['data_type']} ({'NULL' if row['is_nullable'] == 'YES' else 'NOT NULL'})")
        else:
            print("❌ No se encontraron las tablas esperadas")
            return False
            
    except Exception as e:
        print(f"❌ Error verificando tablas: {e}")
        return False
    
    return True

def main():
    """Función principal"""
    print("🔄 Actualizando base de datos con nuevas tablas de escaneos...")
    print("=" * 60)
    
    # Ruta del archivo SQL
    sql_file = os.path.join(os.path.dirname(__file__), 'queries', 'add_new_scan_tables.sql')
    
    # Leer archivo SQL
    sql_content = read_sql_file(sql_file)
    if not sql_content:
        print("❌ No se pudo leer el archivo SQL")
        sys.exit(1)
    
    # Ejecutar queries
    success = execute_sql_queries(sql_content)
    
    if success:
        print("\n✅ Todos los queries se ejecutaron exitosamente")
        
        # Verificar tablas
        if verify_tables():
            print("\n🎉 ¡Base de datos actualizada correctamente!")
            print("\n📝 Nuevas tablas agregadas:")
            print("  - theharvester_scans")
            print("  - whatweb_scans") 
            print("  - paramspider_scans")
            print("  - subfinder_scans")
        else:
            print("\n⚠️  Los queries se ejecutaron pero hay problemas con las tablas")
    else:
        print("\n❌ Hubo errores durante la ejecución de los queries")
        sys.exit(1)

if __name__ == "__main__":
    main() 