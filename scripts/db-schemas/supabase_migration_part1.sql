-- ============================================================
-- NexusSalud — Migración Parte 1: Núcleo de Identidad y Roles
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Limpieza del esquema anterior (Eliminación en cascada segura)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.horarios_bloqueados CASCADE;
DROP TABLE IF EXISTS public.expedientes CASCADE;
DROP TABLE IF EXISTS public.citas CASCADE;
DROP TABLE IF EXISTS public.doctores CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;

DROP TABLE IF EXISTS public.administradores CASCADE;
DROP TABLE IF EXISTS public.secretarias CASCADE;
DROP TABLE IF EXISTS public.pacientes CASCADE;
DROP TABLE IF EXISTS public.sucursales CASCADE;
DROP TABLE IF EXISTS public.especialidades CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: especialidades
-- ============================================================
CREATE TABLE public.especialidades (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: usuarios (Reemplaza a perfiles)
-- ============================================================
CREATE TABLE public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  telefono TEXT,
  correo TEXT NOT NULL UNIQUE,
  usuario TEXT NOT NULL UNIQUE, -- Username para Login
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'doctor', 'secretaria', 'paciente')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: sucursales
-- ============================================================
CREATE TABLE public.sucursales (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  direccion TEXT,
  id_administrador UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUB-TABLAS DE ROLES
-- ============================================================

-- Tabla: administradores
CREATE TABLE public.administradores (
  id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: secretarias
CREATE TABLE public.secretarias (
  id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE PRIMARY KEY,
  sucursal_id INT REFERENCES public.sucursales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: doctores
CREATE TABLE public.doctores (
  id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE PRIMARY KEY,
  precio_consulta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  especialidad_id INT REFERENCES public.especialidades(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: pacientes
CREATE TABLE public.pacientes (
  id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE PRIMARY KEY,
  fecha_nacimiento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas para Especialidades: Lectura pública, escritura solo admins
CREATE POLICY "especialidades_lectura_publica" ON public.especialidades FOR SELECT USING (true);
CREATE POLICY "especialidades_escritura_admin" ON public.especialidades FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- Políticas para Sucursales: Lectura pública, escritura solo admins
CREATE POLICY "sucursales_lectura_publica" ON public.sucursales FOR SELECT USING (true);
CREATE POLICY "sucursales_escritura_admin" ON public.sucursales FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- Políticas para Usuarios: Cada uno ve el suyo, admins/secretarias ven todos
CREATE POLICY "usuarios_ver_propio" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_admin_sec_ver_todos" ON public.usuarios FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin', 'secretaria'))
);
CREATE POLICY "usuarios_insertar_propio" ON public.usuarios FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "usuarios_actualizar_propio" ON public.usuarios FOR UPDATE USING (auth.uid() = id);

-- Políticas para Pacientes: Ver propio, admins/secretarias/doctores ven todos
CREATE POLICY "pacientes_ver_propio" ON public.pacientes FOR SELECT USING (auth.uid() = id);
CREATE POLICY "pacientes_personal_ver_todos" ON public.pacientes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin', 'secretaria', 'doctor'))
);
CREATE POLICY "pacientes_insertar_propio" ON public.pacientes FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "pacientes_actualizar_propio" ON public.pacientes FOR UPDATE USING (auth.uid() = id);

-- Políticas para Doctores: Lectura pública, actualización propia
CREATE POLICY "doctores_lectura_publica" ON public.doctores FOR SELECT USING (true);
CREATE POLICY "doctores_actualizar_propio" ON public.doctores FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- DISPARADOR (TRIGGER) POSTGRESQL INTELIGENTE
-- Auto-pobla usuarios y roles al registrarse en Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol TEXT;
  v_username TEXT;
  v_nombre TEXT;
  v_apellidos TEXT;
  v_telefono TEXT;
  v_especialidad_id INT;
  v_sucursal_id INT;
  v_precio_consulta DECIMAL(10,2);
  v_fecha_nacimiento DATE;
BEGIN
  -- Obtener metadatos de registro con valores por defecto
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente');
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario');
  v_apellidos := COALESCE(NEW.raw_user_meta_data->>'apellidos', '');
  v_telefono := NEW.raw_user_meta_data->>'telefono';

  -- 1. Insertar en la tabla public.usuarios
  INSERT INTO public.usuarios (id, nombre, apellidos, telefono, correo, usuario, rol)
  VALUES (
    NEW.id,
    v_nombre,
    v_apellidos,
    v_telefono,
    NEW.email,
    v_username,
    v_rol
  );

  -- 2. Insertar en la tabla de rol correspondiente
  IF v_rol = 'paciente' THEN
    IF NEW.raw_user_meta_data->>'fecha_nacimiento' IS NOT NULL THEN
      v_fecha_nacimiento := (NEW.raw_user_meta_data->>'fecha_nacimiento')::DATE;
    ELSE
      v_fecha_nacimiento := NULL;
    END IF;
    
    INSERT INTO public.pacientes (id, fecha_nacimiento)
    VALUES (NEW.id, v_fecha_nacimiento);

  ELSIF v_rol = 'doctor' THEN
    IF NEW.raw_user_meta_data->>'especialidad_id' IS NOT NULL THEN
      v_especialidad_id := (NEW.raw_user_meta_data->>'especialidad_id')::INT;
    ELSE
      v_especialidad_id := NULL;
    END IF;
    
    IF NEW.raw_user_meta_data->>'precio_consulta' IS NOT NULL THEN
      v_precio_consulta := (NEW.raw_user_meta_data->>'precio_consulta')::DECIMAL(10,2);
    ELSE
      v_precio_consulta := 0.00;
    END IF;

    INSERT INTO public.doctores (id, precio_consulta, especialidad_id)
    VALUES (NEW.id, v_precio_consulta, v_especialidad_id);

  ELSIF v_rol = 'secretaria' THEN
    IF NEW.raw_user_meta_data->>'sucursal_id' IS NOT NULL THEN
      v_sucursal_id := (NEW.raw_user_meta_data->>'sucursal_id')::INT;
    ELSE
      v_sucursal_id := NULL;
    END IF;

    INSERT INTO public.secretarias (id, sucursal_id)
    VALUES (NEW.id, v_sucursal_id);

  ELSIF v_rol = 'admin' THEN
    INSERT INTO public.administradores (id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el Trigger asociado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INSERCIÓN DE DATOS SEMILLA (Seed Data)
-- ============================================================
INSERT INTO public.especialidades (nombre) VALUES
  ('Odontología General'),
  ('Ortodoncia'),
  ('Pediatría'),
  ('Ginecología'),
  ('Dermatología')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.sucursales (nombre, direccion) VALUES
  ('Sede Norte - Centro Médico', 'Av. Universidad #104, Col. Centro'),
  ('Sede Sur - Plaza Médica', 'Blvd. Diaz Ordaz #4502, Col. Jardines')
ON CONFLICT (nombre) DO NOTHING;
