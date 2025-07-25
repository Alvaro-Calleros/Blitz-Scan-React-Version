-- Agregar columna eliminado para soft delete en tabla escaneos
ALTER TABLE escaneos 
ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;

-- Agregar columna eliminado para soft delete en tabla reportes
ALTER TABLE reportes 
ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;

-- Crear índice simple para mejorar el rendimiento de consultas que filtran eliminados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_escaneos_eliminado' AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_escaneos_eliminado ON escaneos(eliminado);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_reportes_eliminado' AND n.nspname = 'public'
    ) THEN
        CREATE INDEX idx_reportes_eliminado ON reportes(eliminado);
    END IF;
END$$;

-- Comentario: Los registros marcados como eliminado = TRUE permanecen en la BD
-- pero no se muestran en las consultas normales del frontend
-- Esto permite auditoría legal y recuperación si es necesario 