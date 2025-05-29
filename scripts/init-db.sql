-- Script de inicialización para la base de datos Vallmere
-- Este script se ejecuta automáticamente cuando se crea la base de datos

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'UTC';

-- Crear esquemas si no existen
CREATE SCHEMA IF NOT EXISTS public;

-- Configurar permisos por defecto
GRANT ALL ON SCHEMA public TO vallmere_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO vallmere_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO vallmere_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO vallmere_user;

-- Establecer permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vallmere_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vallmere_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO vallmere_user;

-- Configuraciones de rendimiento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Configurar logging para mejor debugging
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Recargar configuración
SELECT pg_reload_conf(); 