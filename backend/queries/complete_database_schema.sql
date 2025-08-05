-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS BLITZSCAN
-- =====================================================
-- Este archivo contiene todas las tablas necesarias para la aplicación
-- Ejecutar en Supabase SQL Editor para crear la base de datos completa

-- =====================================================
-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
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

-- =====================================================
-- 2. TABLA PRINCIPAL DE ESCANEOS
-- =====================================================
CREATE TABLE IF NOT EXISTS escaneos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    tipo_escaneo VARCHAR(100) NOT NULL, -- 'whois', 'nmap', 'fuzzing', 'theharvester', 'whatweb', 'paramspider', 'subfinder'
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'completado',
    eliminado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas en escaneos
CREATE INDEX IF NOT EXISTS idx_escaneos_usuario ON escaneos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_escaneos_tipo ON escaneos(tipo_escaneo);
CREATE INDEX IF NOT EXISTS idx_escaneos_eliminado ON escaneos(eliminado);
CREATE INDEX IF NOT EXISTS idx_escaneos_fecha ON escaneos(fecha);

-- =====================================================
-- 3. TABLAS DE ESCANEOS ESPECÍFICOS
-- =====================================================

-- Tabla para escaneos WHOIS
CREATE TABLE IF NOT EXISTS whois_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    whois_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whois_scans_escaneo ON whois_scans(id_escaneos);

-- Tabla para escaneos NMAP
CREATE TABLE IF NOT EXISTS nmap_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    nmap_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_nmap_scans_escaneo ON nmap_scans(id_escaneos);

-- Tabla para escaneos FUZZING
CREATE TABLE IF NOT EXISTS fuzzing_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    fuzzing_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fuzzing_scans_escaneo ON fuzzing_scans(id_escaneos);

-- Tabla para escaneos THEHARVESTER
CREATE TABLE IF NOT EXISTS theharvester_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    theharvester_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_theharvester_scans_escaneo ON theharvester_scans(id_escaneos);

-- Tabla para escaneos WHATWEB
CREATE TABLE IF NOT EXISTS whatweb_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    whatweb_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whatweb_scans_escaneo ON whatweb_scans(id_escaneos);

-- Tabla para escaneos PARAMSPIDER
CREATE TABLE IF NOT EXISTS paramspider_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    paramspider_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_paramspider_scans_escaneo ON paramspider_scans(id_escaneos);

-- Tabla para escaneos SUBFINDER
CREATE TABLE IF NOT EXISTS subfinder_scans (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    subfinder_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subfinder_scans_escaneo ON subfinder_scans(id_escaneos);

-- =====================================================
-- 4. TABLA DE REPORTES DE IA
-- =====================================================
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    id_escaneos INTEGER NOT NULL REFERENCES escaneos(id) ON DELETE CASCADE,
    reporte_data JSONB NOT NULL,
    eliminado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reportes_escaneos ON reportes(id_escaneos);
CREATE INDEX IF NOT EXISTS idx_reportes_eliminado ON reportes(eliminado);

-- =====================================================
-- 5. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE escaneos IS 'Tabla principal que registra todos los escaneos realizados';
COMMENT ON TABLE whois_scans IS 'Almacena resultados de escaneos WHOIS (información de dominio)';
COMMENT ON TABLE nmap_scans IS 'Almacena resultados de escaneos NMAP (puertos y servicios)';
COMMENT ON TABLE fuzzing_scans IS 'Almacena resultados de escaneos FUZZING (directorios y archivos)';
COMMENT ON TABLE theharvester_scans IS 'Almacena resultados de escaneos TheHarvester (emails, hosts, ASNs)';
COMMENT ON TABLE whatweb_scans IS 'Almacena resultados de escaneos WhatWeb (tecnologías web detectadas)';
COMMENT ON TABLE paramspider_scans IS 'Almacena resultados de escaneos ParamSpider (parámetros URL encontrados)';
COMMENT ON TABLE subfinder_scans IS 'Almacena resultados de escaneos Subfinder (subdominios encontrados)';
COMMENT ON TABLE reportes IS 'Almacena reportes generados por IA para cada escaneo';

-- Comentarios de columnas importantes
COMMENT ON COLUMN escaneos.tipo_escaneo IS 'Tipos válidos: whois, nmap, fuzzing, theharvester, whatweb, paramspider, subfinder';
COMMENT ON COLUMN escaneos.eliminado IS 'Soft delete - registros marcados como eliminados pero preservados en BD';
COMMENT ON COLUMN escaneos.estado IS 'Estados: completado, en_proceso, error, cancelado';

-- =====================================================
-- 6. NOTAS IMPORTANTES PARA EL DESARROLLO
-- =====================================================

/*
ESTRUCTURA DE DATOS EN API.PY:

1. REGISTRO DE USUARIO:
   - Frontend envía: firstName, lastName, email, password, organization
   - Backend guarda: first_name, last_name, email, password_hash, organizacion, role='user'

2. LOGIN:
   - Frontend envía: email, password
   - Backend devuelve: user object con todos los campos

3. GUARDAR ESCANEO:
   - Frontend envía: userId, url, scanType, [tipoData] (whoisData, nmapData, etc.)
   - Backend: 
     a) Inserta en tabla 'escaneos'
     b) Inserta en tabla específica según scanType
     c) Devuelve scan_id

4. OBTENER ESCANEOS:
   - Frontend envía: user_id
   - Backend devuelve: lista de escaneos con filtro eliminado=FALSE

5. OCULTAR ESCANEO (SOFT DELETE):
   - Frontend envía: scanId, userId
   - Backend actualiza: eliminado=TRUE

6. REPORTES DE IA:
   - Frontend envía: userId, scanId, reportText
   - Backend guarda en tabla 'reportes'

TIPOS DE ESCANEO SOPORTADOS:
- whois: Información de dominio y registrante
- nmap: Escaneo de puertos y servicios
- fuzzing: Búsqueda de directorios y archivos
- theharvester: Recolección de emails y hosts
- whatweb: Fingerprinting de tecnologías web
- paramspider: Extracción de parámetros URL
- subfinder: Enumeración de subdominios

CAMPOS JSONB EN TABLAS ESPECÍFICAS:
- whois_data: Información completa del WHOIS
- nmap_data: Resultados del escaneo NMAP
- fuzzing_data: Lista de rutas encontradas
- theharvester_data: Emails, hosts, ASNs encontrados
- whatweb_data: Tecnologías y versiones detectadas
- paramspider_data: Parámetros URL encontrados
- subfinder_data: Subdominios enumerados
- reporte_data: Reporte generado por IA

SOFT DELETE:
- Todos los registros marcados como eliminado=TRUE se ocultan del frontend
- Los datos se preservan para auditoría legal
- Se pueden recuperar si es necesario

ÍNDICES OPTIMIZADOS:
- Búsquedas por usuario (id_usuario)
- Filtros por tipo de escaneo
- Filtros por eliminado
- Búsquedas por fecha
- Relaciones entre tablas (id_escaneos)
*/ 