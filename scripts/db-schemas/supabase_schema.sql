-- ============================================================
-- NexusSalud — Schema Completo para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: perfiles (extiende auth.users de Supabase)
-- Almacena el rol y datos básicos de cada usuario
-- ============================================================
CREATE TABLE public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'doctor', 'secretaria', 'paciente')),
  telefono TEXT,
  curp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: doctores (datos adicionales del doctor)
-- ============================================================
CREATE TABLE public.doctores (
  id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE PRIMARY KEY,
  especialidad TEXT NOT NULL,
  cedula_profesional TEXT,
  consultorio TEXT
);

-- ============================================================
-- TABLA: citas
-- ============================================================
CREATE TABLE public.citas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  especialidad TEXT NOT NULL,
  sucursal TEXT DEFAULT 'Clínica Principal',
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: expedientes (NOM-004-SSA3-2012)
-- Una nota médica por consulta, agrupadas por paciente+doctor
-- ============================================================
CREATE TABLE public.expedientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cita_id UUID REFERENCES public.citas(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE NOT NULL,
  motivo_consulta TEXT NOT NULL,
  ta TEXT,           -- Tensión arterial
  temperatura TEXT,
  frecuencia_cardiaca TEXT,
  resumen_clinico TEXT NOT NULL,
  diagnostico TEXT NOT NULL,
  plan_tratamiento TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: horarios_bloqueados (por doctor)
-- ============================================================
CREATE TABLE public.horarios_bloqueados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo TEXT DEFAULT 'No disponible',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Proteger los datos por rol
-- ============================================================

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_bloqueados ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve el suyo propio + admins y secretarias ven todos
CREATE POLICY "perfiles_propios" ON public.perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admins_secretarias_ven_todos" ON public.perfiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfiles p
      WHERE p.id = auth.uid() AND p.rol IN ('admin', 'secretaria')
    )
  );

CREATE POLICY "perfiles_insert_propio" ON public.perfiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "perfiles_update_propio" ON public.perfiles
  FOR UPDATE USING (auth.uid() = id);

-- Citas: paciente ve las suyas, doctor ve las suyas, secretaria/admin ven todas
CREATE POLICY "paciente_ve_sus_citas" ON public.citas
  FOR SELECT USING (paciente_id = auth.uid());

CREATE POLICY "doctor_ve_sus_citas" ON public.citas
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "secretaria_admin_ven_todas_citas" ON public.citas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfiles p
      WHERE p.id = auth.uid() AND p.rol IN ('admin', 'secretaria')
    )
  );

CREATE POLICY "paciente_agenda_cita" ON public.citas
  FOR INSERT WITH CHECK (paciente_id = auth.uid());

CREATE POLICY "secretaria_agenda_cualquier_cita" ON public.citas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles p
      WHERE p.id = auth.uid() AND p.rol IN ('admin', 'secretaria')
    )
  );

CREATE POLICY "cancelar_cita_paciente" ON public.citas
  FOR UPDATE USING (paciente_id = auth.uid());

CREATE POLICY "cancelar_cita_doctor" ON public.citas
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "secretaria_actualiza_citas" ON public.citas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.perfiles p
      WHERE p.id = auth.uid() AND p.rol IN ('admin', 'secretaria')
    )
  );

-- Expedientes: doctor SOLO ve los suyos (NOM-004: privacidad entre especialistas)
CREATE POLICY "doctor_ve_solo_sus_expedientes" ON public.expedientes
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "paciente_ve_sus_expedientes" ON public.expedientes
  FOR SELECT USING (paciente_id = auth.uid());

CREATE POLICY "doctor_crea_expediente" ON public.expedientes
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

-- Horarios bloqueados: solo el doctor gestiona los suyos
CREATE POLICY "doctor_ve_su_bloqueo" ON public.horarios_bloqueados
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "doctor_bloquea_horario" ON public.horarios_bloqueados
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "doctor_desbloquea_horario" ON public.horarios_bloqueados
  FOR DELETE USING (doctor_id = auth.uid());

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- Se ejecuta después de que Supabase Auth crea el usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, correo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara la función anterior
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
