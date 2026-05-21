import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL; // Asegurarse de tener DATABASE_URL en .env.local

if (!connectionString) {
  console.error("Falta DATABASE_URL en las variables de entorno.");
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function addPolicy() {
  try {
    await client.connect();
    console.log("Conectado a la base de datos.");

    const res = await client.query(`
      CREATE POLICY "pagos_paciente_insertar" ON public.pagos FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.citas c WHERE c.id = cita_id AND c.paciente_id = auth.uid())
      );
    `);
    
    console.log("Política agregada exitosamente.");
  } catch (err) {
    if (err.code === '42710') {
      console.log("La política ya existe.");
    } else {
      console.error("Error al ejecutar la consulta:", err);
    }
  } finally {
    await client.end();
  }
}

addPolicy();
