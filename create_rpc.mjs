import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:B11Strikeforc@db.jtvkpbtyrsadkmbahino.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function createRPC() {
  try {
    await client.connect();
    
    await client.query(`
      CREATE OR REPLACE FUNCTION obtener_horarios_ocupados(p_doctor_id UUID, p_fecha DATE)
      RETURNS TABLE (hora TIME)
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT c.hora
        FROM public.citas c
        WHERE c.doctor_id = p_doctor_id
          AND c.fecha = p_fecha
          AND c.estado IN ('pendiente', 'confirmada');
      END;
      $$;
    `);
    
    console.log("RPC created successfully.");
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createRPC();
