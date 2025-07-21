import os
import sys
import time
from datetime import datetime

# Agregar el directorio de pruebas al path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Importar los módulos de prueba
import test_db_connection
import test_backend_connection

def generate_report(results):
    """Genera un reporte HTML con los resultados de las pruebas"""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_file = os.path.join(current_dir, f"test_report_{timestamp}.html")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reporte de Pruebas - BlitzScan</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ background: #4f8cff; color: white; padding: 20px; border-radius: 10px; }}
            .section {{ margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
            .success {{ color: #22c55e; }}
            .warning {{ color: #eab308; }}
            .error {{ color: #ef4444; }}
            pre {{ background: #f1f5f9; padding: 10px; border-radius: 5px; overflow-x: auto; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>BlitzScan - Reporte de Pruebas</h1>
            <p>Generado el: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
        </div>
        
        <div class="section">
            <h2>Resumen</h2>
            <p>Total de pruebas: {results['total_tests']}</p>
            <p class="success">✅ Exitosas: {results['successful_tests']}</p>
            <p class="warning">⚠️ Advertencias: {results['warnings']}</p>
            <p class="error">❌ Errores: {results['failed_tests']}</p>
        </div>
        
        <div class="section">
            <h2>Detalles</h2>
            <pre>{results['details']}</pre>
        </div>
    </body>
    </html>
    """
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n📄 Reporte generado: {report_file}")

def run_all_tests():
    """Ejecuta todas las pruebas y genera un reporte"""
    results = {
        'total_tests': 0,
        'successful_tests': 0,
        'failed_tests': 0,
        'warnings': 0,
        'details': ''
    }
    
    # Capturar la salida de las pruebas
    from io import StringIO
    import sys
    output = StringIO()
    sys.stdout = output
    
    try:
        print("🚀 Iniciando suite de pruebas completa...\n")
        print("=" * 50)
        
        # Pruebas de base de datos
        print("\n📦 PRUEBAS DE BASE DE DATOS")
        test_db_connection.run_all_tests()
        print("\n" + "=" * 50)
        
        # Pruebas de backend
        print("\n🔌 PRUEBAS DE BACKEND")
        test_backend_connection.run_all_tests()
        print("\n" + "=" * 50)
        
    finally:
        # Restaurar la salida estándar
        sys.stdout = sys.__stdout__
        results['details'] = output.getvalue()
        
        # Contar resultados basados en la salida
        output_lines = results['details'].split('\n')
        for line in output_lines:
            if '✅' in line:
                results['successful_tests'] += 1
            elif '❌' in line:
                results['failed_tests'] += 1
            elif '⚠️' in line:
                results['warnings'] += 1
        
        results['total_tests'] = results['successful_tests'] + results['failed_tests']
        
        # Generar reporte
        generate_report(results)
        
        # Imprimir resumen
        print("\n📊 RESUMEN DE PRUEBAS")
        print(f"Total de pruebas: {results['total_tests']}")
        print(f"✅ Exitosas: {results['successful_tests']}")
        print(f"⚠️ Advertencias: {results['warnings']}")
        print(f"❌ Errores: {results['failed_tests']}")

if __name__ == "__main__":
    run_all_tests() 