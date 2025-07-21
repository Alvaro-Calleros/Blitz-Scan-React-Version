-- Script para migrar de MySQL a PostgreSQL/Supabase
-- Ejecuta este script en tu base de datos de Supabase

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    organizacion VARCHAR(255) DEFAULT '',
    profile_image VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- Insertar usuario de prueba (opcional)
-- INSERT INTO usuarios (first_name, last_name, email, password_hash, role, organizacion) 
-- VALUES ('Admin', 'User', 'admin@blitzscan.com', 'sha256_hash_here', 'admin', 'BlitzScan');

-- Comentarios sobre las diferencias con MySQL:
-- 1. SERIAL es equivalente a AUTO_INCREMENT en MySQL
-- 2. TIMESTAMP DEFAULT CURRENT_TIMESTAMP es similar en ambos
-- 3. VARCHAR funciona igual en ambos
-- 4. UNIQUE funciona igual en ambos 