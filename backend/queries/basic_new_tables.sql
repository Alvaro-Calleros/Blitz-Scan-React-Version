-- =====================================================
-- QUERIES BÁSICOS PARA NUEVAS TABLAS DE ESCANEOS
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