-- =====================================================
-- QUERIES PARA AGREGAR NUEVAS TABLAS DE ESCANEOS
-- =====================================================

-- 1. Tabla para escaneos TheHarvester
CREATE TABLE IF NOT EXISTS theharvester_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL,
    theharvester_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE
);

-- 2. Tabla para escaneos WhatWeb
CREATE TABLE IF NOT EXISTS whatweb_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL,
    whatweb_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE
);

-- 3. Tabla para escaneos ParamSpider
CREATE TABLE IF NOT EXISTS paramspider_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL,
    paramspider_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE
);

-- 4. Tabla para escaneos Subfinder
CREATE TABLE IF NOT EXISTS subfinder_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL,
    subfinder_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (id_escaneos) REFERENCES escaneos(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índices para búsquedas rápidas por id_escaneos
CREATE INDEX IF NOT EXISTS idx_theharvester_scans_escaneo ON theharvester_scans(id_escaneos);
CREATE INDEX IF NOT EXISTS idx_whatweb_scans_escaneo ON whatweb_scans(id_escaneos);
CREATE INDEX IF NOT EXISTS idx_paramspider_scans_escaneo ON paramspider_scans(id_escaneos);
CREATE INDEX IF NOT EXISTS idx_subfinder_scans_escaneo ON subfinder_scans(id_escaneos);

-- Índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_theharvester_scans_created ON theharvester_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_whatweb_scans_created ON whatweb_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_paramspider_scans_created ON paramspider_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_subfinder_scans_created ON subfinder_scans(created_at);

-- =====================================================
-- COMENTARIOS SOBRE LAS TABLAS
-- =====================================================

COMMENT ON TABLE theharvester_scans IS 'Almacena resultados de escaneos TheHarvester (emails, hosts, ASNs)';
COMMENT ON TABLE whatweb_scans IS 'Almacena resultados de escaneos WhatWeb (tecnologías web detectadas)';
COMMENT ON TABLE paramspider_scans IS 'Almacena resultados de escaneos ParamSpider (parámetros URL encontrados)';
COMMENT ON TABLE subfinder_scans IS 'Almacena resultados de escaneos Subfinder (subdominios encontrados)';

COMMENT ON COLUMN theharvester_scans.theharvester_data IS 'JSON con emails, hosts, ASNs y URLs encontradas';
COMMENT ON COLUMN whatweb_scans.whatweb_data IS 'JSON con tecnologías web detectadas y versiones';
COMMENT ON COLUMN paramspider_scans.paramspider_data IS 'JSON con parámetros URL encontrados';
COMMENT ON COLUMN subfinder_scans.subfinder_data IS 'JSON con subdominios encontrados';

-- =====================================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- =====================================================

-- Query para verificar que todas las tablas se crearon correctamente
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