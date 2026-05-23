-- ============================================================
-- NexusSalud — Migración Parte 3: Citas, Expedientes, Consultas,
--              Pagos, Cancelaciones, Reembolsos y Notificaciones
-- ============================================================

-- Limpieza segura por si se re-ejecuta
DROP TABLE IF EXISTS public.notificaciones CASCADE;
DROP TABLE IF EXISTS public.reembolsos CASCADE;
DROP TABLE IF EXISTS public.cancelaciones CASCADE;
DROP TABLE IF EXISTS public.pagos CASCADE;
DROP TABLE IF EXISTS public.consultas CASCADE;
DROP TABLE IF EXISTS public.citas CASCADE;
DROP TABLE IF EXISTS public.expedientes CASCADE;

-- ============================================================
-- TABLA: expedientes
-- Un expediente por paciente (historial médico global)
-- ============================================================
CREATE TABLE public.expedientes (
  id SERIAL PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (paciente_id) -- Un paciente tiene un único expediente
);

-- ============================================================
-- TABLA: citas
-- Registro de citas médicas agendadas
-- ============================================================
CREATE TABLE public.citas (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio')),
  doctor_id UUID REFERENCES public.doctores(id) ON DELETE CASCADE NOT NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
  consultorio_id INT REFERENCES public.consultorios(id) ON DELETE SET NULL,
  creada_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: consultas
-- Consulta médica realizada dentro de una cita completada
-- ============================================================
CREATE TABLE public.consultas (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  motivo TEXT,
  receta TEXT,
  expediente_id INT REFERENCES public.expedientes(id) ON DELETE CASCADE NOT NULL,
  cita_id INT REFERENCES public.citas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: pagos
-- Pago asociado a una cita
-- ============================================================
CREATE TABLE public.pagos (
  folio SERIAL PRIMARY KEY,
  monto_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  anticipo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  metodo_pago TEXT DEFAULT 'efectivo'
    CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  estatus TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estatus IN ('pendiente', 'pagado', 'parcial')),
  cita_id INT REFERENCES public.citas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: cancelaciones
-- Registro de cancelaciones de citas
-- ============================================================
CREATE TABLE public.cancelaciones (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora TIME NOT NULL DEFAULT CURRENT_TIME,
  motivo TEXT,
  tipo TEXT NOT NULL DEFAULT 'paciente'
    CHECK (tipo IN ('medico', 'paciente', 'sistema', 'admin')),
  cancelado_por TEXT, -- Nombre o descripción libre
  cita_id INT REFERENCES public.citas(id) ON DELETE CASCADE NOT NULL,
  realizada_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: reembolsos
-- Reembolso generado por una cancelación con pago previo
-- ============================================================
CREATE TABLE public.reembolsos (
  folio_reembolso SERIAL PRIMARY KEY,
  monto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estatus TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estatus IN ('pendiente', 'aprobado', 'rechazado', 'procesado')),
  cancelacion_id INT REFERENCES public.cancelaciones(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: notificaciones
-- Notificaciones enviadas al paciente
-- ============================================================
CREATE TABLE public.notificaciones (
  id SERIAL PRIMARY KEY,
  mensaje TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  leida BOOLEAN DEFAULT FALSE,
  tipo TEXT DEFAULT 'info'
    CHECK (tipo IN ('info', 'recordatorio', 'cancelacion', 'confirmacion', 'pago')),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
  cancelacion_id INT REFERENCES public.cancelaciones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para mejorar performance en consultas frecuentes
-- ============================================================
CREATE INDEX idx_citas_doctor_id ON public.citas(doctor_id);
CREATE INDEX idx_citas_paciente_id ON public.citas(paciente_id);
CREATE INDEX idx_citas_fecha ON public.citas(fecha);
CREATE INDEX idx_citas_estado ON public.citas(estado);
CREATE INDEX idx_consultas_expediente_id ON public.consultas(expediente_id);
CREATE INDEX idx_pagos_cita_id ON public.pagos(cita_id);
CREATE INDEX idx_cancelaciones_cita_id ON public.cancelaciones(cita_id);
CREATE INDEX idx_notificaciones_paciente_id ON public.notificaciones(paciente_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancelaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- EXPEDIENTES: Paciente ve el suyo, doctores/secretarias/admin ven todos
CREATE POLICY "expedientes_ver_propio" ON public.expedientes FOR SELECT
  USING (auth.uid() = paciente_id);
CREATE POLICY "expedientes_personal_ver_todos" ON public.expedientes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','doctor','secretaria')));
CREATE POLICY "expedientes_insertar_personal" ON public.expedientes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','doctor','secretaria')));
CREATE POLICY "expedientes_insertar_propio" ON public.expedientes FOR INSERT
  WITH CHECK (auth.uid() = paciente_id);

-- CITAS: Paciente ve las suyas, doctor ve las suyas, secretaria/admin ven todas
CREATE POLICY "citas_paciente_ver_suyas" ON public.citas FOR SELECT
  USING (auth.uid() = paciente_id);
CREATE POLICY "citas_doctor_ver_suyas" ON public.citas FOR SELECT
  USING (auth.uid() = doctor_id);
CREATE POLICY "citas_admin_sec_ver_todas" ON public.citas FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','secretaria')));
CREATE POLICY "citas_insertar_personal" ON public.citas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','secretaria','paciente')));
CREATE POLICY "citas_actualizar_personal" ON public.citas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','secretaria','doctor')));
CREATE POLICY "citas_eliminar_admin" ON public.citas FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol = 'admin'));

-- CONSULTAS: Doctor puede insertar/editar, paciente y admin pueden leer
CREATE POLICY "consultas_lectura_doctor_admin_paciente" ON public.consultas FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','doctor','secretaria'))
    OR
    EXISTS (
      SELECT 1 FROM public.expedientes e
      JOIN public.pacientes p ON p.id = e.paciente_id
      WHERE e.id = expediente_id AND p.id = auth.uid()
    )
  );
CREATE POLICY "consultas_insertar_doctor" ON public.consultas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','doctor')));
CREATE POLICY "consultas_actualizar_doctor" ON public.consultas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','doctor')));

-- PAGOS: Secretaria y admin gestionan, paciente puede ver el suyo
CREATE POLICY "pagos_admin_sec_total" ON public.pagos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','secretaria')));
CREATE POLICY "pagos_paciente_ver" ON public.pagos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citas c WHERE c.id = cita_id AND c.paciente_id = auth.uid()
    )
  );

-- CANCELACIONES: Admin/Secretaria crean, todos los involucrados pueden ver
CREATE POLICY "cancelaciones_admin_sec_total" ON public.cancelaciones FOR ALL
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','secretaria')));
CREATE POLICY "cancelaciones_doctor_ver" ON public.cancelaciones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.citas c WHERE c.id = cita_id AND c.doctor_id = auth.uid()));
CREATE POLICY "cancelaciones_paciente_ver" ON public.cancelaciones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.citas c WHERE c.id = cita_id AND c.paciente_id = auth.uid()));

-- REEMBOLSOS: Solo admin gestiona
CREATE POLICY "reembolsos_admin_total" ON public.reembolsos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol = 'admin'));
CREATE POLICY "reembolsos_paciente_ver" ON public.reembolsos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cancelaciones c
      JOIN public.citas ci ON ci.id = c.cita_id
      WHERE c.id = cancelacion_id AND ci.paciente_id = auth.uid()
    )
  );

-- NOTIFICACIONES: Paciente ve solo las suyas, admin ve todas
CREATE POLICY "notificaciones_ver_propias" ON public.notificaciones FOR SELECT
  USING (auth.uid() = paciente_id);
CREATE POLICY "notificaciones_admin_total" ON public.notificaciones FOR ALL
  USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = auth.uid() AND u.rol IN ('admin','secretaria')));

-- ============================================================
-- FUNCIÓN: Trigger automático al cancelar una cita
-- Crea automáticamente la cancelación y notificación
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_cita_cancelada()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actuar cuando el estado cambia a 'cancelada'
  IF NEW.estado = 'cancelada' AND OLD.estado != 'cancelada' THEN
    -- Insertar notificación automática al paciente
    INSERT INTO public.notificaciones (mensaje, tipo, paciente_id)
    VALUES (
      'Tu cita del ' || TO_CHAR(NEW.fecha, 'DD/MM/YYYY') || ' a las ' || TO_CHAR(NEW.hora, 'HH24:MI') || ' ha sido cancelada.',
      'cancelacion',
      NEW.paciente_id
    );
  END IF;
  
  -- Cuando se confirma una cita, enviar notificación
  IF NEW.estado = 'confirmada' AND OLD.estado = 'pendiente' THEN
    INSERT INTO public.notificaciones (mensaje, tipo, paciente_id)
    VALUES (
      'Tu cita del ' || TO_CHAR(NEW.fecha, 'DD/MM/YYYY') || ' a las ' || TO_CHAR(NEW.hora, 'HH24:MI') || ' ha sido confirmada.',
      'confirmacion',
      NEW.paciente_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_cita_estado_cambio
  AFTER UPDATE ON public.citas
  FOR EACH ROW EXECUTE FUNCTION public.handle_cita_cancelada();

-- ============================================================
-- FUNCIÓN: Auto-crear expediente al registrar un paciente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_nuevo_paciente_expediente()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.expedientes (paciente_id)
  VALUES (NEW.id)
  ON CONFLICT (paciente_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_paciente_creado
  AFTER INSERT ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_nuevo_paciente_expediente();

-- ============================================================
-- CREAR EXPEDIENTES para pacientes YA EXISTENTES (backfill)
-- ============================================================
INSERT INTO public.expedientes (paciente_id)
SELECT id FROM public.pacientes
ON CONFLICT (paciente_id) DO NOTHING;
