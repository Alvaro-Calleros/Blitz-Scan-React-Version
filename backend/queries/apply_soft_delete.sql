-- Script para aplicar soft delete a las tablas escaneos y reportes
-- Ejecutar este script en Supabase SQL Editor

-- 1. Agregar columna eliminado a tabla escaneos
ALTER TABLE escaneos 
ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna eliminado a tabla reportes
ALTER TABLE reportes 
ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_escaneos_eliminado ON escaneos(eliminado) WHERE eliminado = FALSE;
CREATE INDEX IF NOT EXISTS idx_reportes_eliminado ON reportes(eliminado) WHERE eliminado = FALSE;

-- 4. Verificar que las columnas se agregaron correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('escaneos', 'reportes') 
AND column_name = 'eliminado'
ORDER BY table_name;

-- 5. Mostrar algunos registros de ejemplo
SELECT 
    id, 
    id_usuario, 
    url, 
    tipo_escaneo, 
    eliminado, 
    created_at, 
    updated_at
FROM escaneos 
ORDER BY created_at DESC 
LIMIT 5;

-- Comentario: Los registros marcados como eliminado = TRUE permanecen en la BD
-- pero no se muestran en las consultas normales del frontend
-- Esto permite auditoría legal y recuperación si es necesario 