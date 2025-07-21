-- =====================================================
-- ESQUEMA COMPLETO PARA SUPABASE - BLITZ SCAN
-- =====================================================

-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    organizacion VARCHAR(100) NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE ESCANEOS
-- =====================================================
CREATE TABLE IF NOT EXISTS escaneos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    tipo_escaneo VARCHAR(100) NOT NULL, -- 'nmap', 'fuzzing', 'whois', etc.
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB DEFAULT '{}', -- Almacena todos los resultados del escaneo
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'error')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE REPORTES
-- =====================================================
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    id_escaneo INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reporte_url VARCHAR(500) DEFAULT NULL, -- URL del PDF generado
    reporte_contenido TEXT DEFAULT NULL, -- Contenido del análisis de IA
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'generando', 'completado', 'error')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion ON usuarios(organizacion);

-- Índices para escaneos
CREATE INDEX IF NOT EXISTS idx_escaneos_usuario ON escaneos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_escaneos_fecha ON escaneos(fecha);
CREATE INDEX IF NOT EXISTS idx_escaneos_tipo ON escaneos(tipo_escaneo);
CREATE INDEX IF NOT EXISTS idx_escaneos_estado ON escaneos(estado);
CREATE INDEX IF NOT EXISTS idx_escaneos_url ON escaneos(url);

-- Índices para reportes
CREATE INDEX IF NOT EXISTS idx_reportes_escaneo ON reportes(id_escaneo);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);

-- =====================================================
-- FUNCIONES PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_escaneos_updated_at 
    BEFORE UPDATE ON escaneos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_updated_at 
    BEFORE UPDATE ON reportes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar usuario administrador de prueba
-- INSERT INTO usuarios (first_name, last_name, email, password_hash, role, organizacion) 
-- VALUES (
--     'Admin', 
--     'BlitzScan', 
--     'admin@blitzscan.com', 
--     'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hash de 'admin123'
--     'admin', 
--     'BlitzScan Security'
-- );

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'escaneos', 'reportes');

-- Verificar la estructura de las tablas
-- \d usuarios;
-- \d escaneos;
-- \d reportes; 