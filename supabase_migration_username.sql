-- ============================================================
-- MIGRACIÓN: Agregar username a perfiles
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Agregar columna username
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Asignar username automático a usuarios existentes (basado en correo)
UPDATE public.perfiles
SET username = LOWER(SPLIT_PART(correo, '@', 1))
WHERE username IS NULL;

-- 3. Función para buscar el correo por username (bypasea RLS para login)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT correo FROM public.perfiles 
  WHERE LOWER(username) = LOWER(p_username) 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Actualizar el trigger de nuevo usuario para generar username automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Generar username base desde el nombre o desde el correo
  base_username := LOWER(
    REGEXP_REPLACE(
      COALESCE(
        NEW.raw_user_meta_data->>'nombre',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      '[^a-z0-9]', '', 'g'
    )
  );
  
  -- Asegurarse de que el username sea único
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.perfiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.perfiles (id, nombre, correo, rol, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente'),
    final_username
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
