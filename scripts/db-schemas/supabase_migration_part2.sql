-- ============================================================
-- NexusSalud — Migración Parte 2: Infraestructura y Disponibilidad
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Limpieza de tablas previas en caso de existir
DROP TABLE IF EXISTS public.doctor_consultorios CASCADE;
DROP TABLE IF EXISTS public.consultorios CASCADE;

-- ============================================================
-- TABLA: consultorios
-- ============================================================
CREATE TABLE public.consultorios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  sucursal_id INT REFERENCES public.sucursales(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nombre, sucursal_id) -- No duplicar nombres en la misma sucursal
);

-- ============================================================
-- TABLA: doctor_consultorios (Agenda/Disponibilidad Semanal)
-- ============================================================
CREATE TABLE public.doctor_consultorios (
  id SERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctores(id) ON DELETE CASCADE NOT NULL,
  consultorio_id INT REFERENCES public.consultorios(id) ON DELETE CASCADE NOT NULL,
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (hora_inicio < hora_fin)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.consultorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_consultorios ENABLE ROW LEVEL SECURITY;

-- Políticas para Consultorios: Lectura pública, escritura solo admins
CREATE POLICY "consultorios_lectura_publica" ON public.consultorios FOR SELECT USING (true);
CREATE POLICY "consultorios_escritura_admin" ON public.consultorios FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol = 'admin')
);

-- Políticas para Doctor_Consultorios: Lectura pública, escritura admins y el propio doctor
CREATE POLICY "doctor_consultorios_lectura_publica" ON public.doctor_consultorios FOR SELECT USING (true);
CREATE POLICY "doctor_consultorios_insert_admin_doctor" ON public.doctor_consultorios FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND (u.rol = 'admin' OR auth.uid() = doctor_id))
);
CREATE POLICY "doctor_consultorios_update_admin_doctor" ON public.doctor_consultorios FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND (u.rol = 'admin' OR auth.uid() = doctor_id))
);
CREATE POLICY "doctor_consultorios_delete_admin_doctor" ON public.doctor_consultorios FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND (u.rol = 'admin' OR auth.uid() = doctor_id))
);

-- ============================================================
-- DATOS SEMILLA (Seed Data)
-- ============================================================
-- Insertar consultorios por defecto en las sedes creadas en la Parte 1
INSERT INTO public.consultorios (nombre, sucursal_id) VALUES
  ('Consultorio A-101', 1), -- Sede Norte
  ('Consultorio A-102', 1), -- Sede Norte
  ('Consultorio B-201', 2), -- Sede Sur
  ('Consultorio B-202', 2)  -- Sede Sur
ON CONFLICT (nombre, sucursal_id) DO NOTHING;
