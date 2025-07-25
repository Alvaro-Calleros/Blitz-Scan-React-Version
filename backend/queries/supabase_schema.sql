CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    organizacion VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_image VARCHAR(255)
);

CREATE TABLE escaneos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    tipo_escaneo VARCHAR(100) NOT NULL, -- 'whois', 'nmap', 'fuzzing'
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'completado',
    eliminado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_escaneos_usuario ON escaneos(id_usuario);
CREATE INDEX idx_escaneos_tipo ON escaneos(tipo_escaneo);
CREATE INDEX idx_escaneos_eliminado ON escaneos(eliminado);

CREATE TABLE whois_scans (
    id SERIAL PRIMARY KEY,
    id_escaneo INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    whois_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_whois_scans_escaneo ON whois_scans(id_escaneo);

CREATE TABLE nmap_scans (
    id SERIAL PRIMARY KEY,
    id_escaneo INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    nmap_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_nmap_scans_escaneo ON nmap_scans(id_escaneo);

CREATE TABLE fuzzing_scans (
    id SERIAL PRIMARY KEY,
    id_escaneo INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    fuzzing_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_fuzzing_scans_escaneo ON fuzzing_scans(id_escaneo);


-- ==============================================
-- TABLA DE REPORTES DE IA
-- ==============================================
CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    reporte_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_reportes_escaneos ON reportes(id_escaneos);


-- ==============================================
-- SCRIPT DE ACTUALIZACIÓN INCREMENTAL
-- Cambio de id_escaneo a id_escaneos SIN eliminar datos
-- ==============================================

-- ==============================================
-- 1. ACTUALIZACIÓN DE TABLA whois_scans
-- ==============================================

-- Eliminar constraint de foreign key existente
ALTER TABLE whois_scans 
DROP CONSTRAINT IF EXISTS whois_scans_id_escaneo_fkey;

-- Eliminar índice existente
DROP INDEX IF EXISTS idx_whois_scans_escaneo;

-- Renombrar la columna
ALTER TABLE whois_scans 
RENAME COLUMN id_escaneo TO id_escaneos;

-- Recrear la foreign key constraint
ALTER TABLE whois_scans 
ADD CONSTRAINT whois_scans_id_escaneos_fkey 
FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE;

-- Recrear el índice con el nuevo nombre de columna
CREATE INDEX idx_whois_scans_escaneo ON whois_scans(id_escaneos);

-- ==============================================
-- 2. ACTUALIZACIÓN DE TABLA nmap_scans
-- ==============================================

-- Eliminar constraint de foreign key existente
ALTER TABLE nmap_scans 
DROP CONSTRAINT IF EXISTS nmap_scans_id_escaneo_fkey;

-- Eliminar índice existente
DROP INDEX IF EXISTS idx_nmap_scans_escaneo;

-- Renombrar la columna
ALTER TABLE nmap_scans 
RENAME COLUMN id_escaneo TO id_escaneos;

-- Recrear la foreign key constraint
ALTER TABLE nmap_scans 
ADD CONSTRAINT nmap_scans_id_escaneos_fkey 
FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE;

-- Recrear el índice con el nuevo nombre de columna
CREATE INDEX idx_nmap_scans_escaneo ON nmap_scans(id_escaneos);

-- ==============================================
-- 3. ACTUALIZACIÓN DE TABLA fuzzing_scans
-- ==============================================

-- Eliminar constraint de foreign key existente
ALTER TABLE fuzzing_scans 
DROP CONSTRAINT IF EXISTS fuzzing_scans_id_escaneo_fkey;

-- Eliminar índice existente
DROP INDEX IF EXISTS idx_fuzzing_scans_escaneo;

-- Renombrar la columna
ALTER TABLE fuzzing_scans 
RENAME COLUMN id_escaneo TO id_escaneos;

-- Recrear la foreign key constraint
ALTER TABLE fuzzing_scans 
ADD CONSTRAINT fuzzing_scans_id_escaneos_fkey 
FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE;

-- Recrear el índice con el nuevo nombre de columna
CREATE INDEX idx_fuzzing_scans_escaneo ON fuzzing_scans(id_escaneos);

-- ==============================================
-- 4. VERIFICACIÓN DE LOS CAMBIOS
-- ==============================================

-- Verificar que las columnas fueron renombradas correctamente
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('whois_scans', 'nmap_scans', 'fuzzing_scans')
    AND column_name LIKE '%escaneo%'
ORDER BY table_name, column_name;

-- Verificar las foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('whois_scans', 'nmap_scans', 'fuzzing_scans')
ORDER BY tc.table_name;

-- Verificar que los índices fueron recreados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('whois_scans', 'nmap_scans', 'fuzzing_scans')
    AND indexname LIKE '%escaneo%'
ORDER BY tablename;

-- ==============================================
-- 5. VERIFICACIÓN DE INTEGRIDAD DE DATOS
-- ==============================================

-- Contar registros en cada tabla para asegurar que no se perdieron datos
SELECT 
    'whois_scans' as tabla, 
    COUNT(*) as total_registros 
FROM whois_scans
UNION ALL
SELECT 
    'nmap_scans' as tabla, 
    COUNT(*) as total_registros 
FROM nmap_scans
UNION ALL
SELECT 
    'fuzzing_scans' as tabla, 
    COUNT(*) as total_registros 
FROM fuzzing_scans;

-- ==============================================
-- NOTAS IMPORTANTES
-- ==============================================

/*
CAMBIOS REALIZADOS:

1. COLUMNAS RENOMBRADAS:
   ✅ whois_scans.id_escaneo → whois_scans.id_escaneos
   ✅ nmap_scans.id_escaneo → nmap_scans.id_escaneos  
   ✅ fuzzing_scans.id_escaneo → fuzzing_scans.id_escaneos

2. CONSTRAINTS ACTUALIZADAS:
   ✅ Se eliminaron las FK constraints antiguas
   ✅ Se crearon nuevas FK constraints con CASCADE
   ✅ Se mantiene la integridad referencial

3. ÍNDICES ACTUALIZADOS:
   ✅ Se eliminaron índices antiguos
   ✅ Se crearon nuevos índices en las columnas renombradas

4. DATOS PRESERVADOS:
   ✅ Todos los datos existentes se mantienen intactos
   ✅ No hay pérdida de información
   ✅ Las relaciones siguen funcionando correctamente

VENTAJAS DE ESTE ENFOQUE:
- No hay tiempo de inactividad significativo
- Se preservan todos los datos existentes
- Las aplicaciones pueden seguir funcionando (con actualizaciones menores en el código)
- Rollback fácil si es necesario

DESPUÉS DE EJECUTAR ESTE SCRIPT:
- Actualiza tu código de aplicación para usar 'id_escaneos' en lugar de 'id_escaneo'
- Verifica que todas las consultas sigan funcionando correctamente
*/