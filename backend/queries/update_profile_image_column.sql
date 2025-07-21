-- Script para agregar la columna profile_image a la tabla usuarios
-- Ejecuta este script en el SQL Editor de Supabase

-- Verificar si la columna profile_image existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'profile_image'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE usuarios ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL;
        RAISE NOTICE 'Columna profile_image agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna profile_image ya existe';
    END IF;
END $$;

-- Verificar la estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position; 