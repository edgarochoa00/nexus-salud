import fs from 'fs';

function updateSucursalesPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the useEffect block
  const oldEffect = /useEffect\(\(\) => \{[\s\S]*?supabase\.from\("sucursales"\)\.select\("\*"\)\.order\("nombre"\)\.then\(\(\{ data \}\) => \{[\s\S]*?setSucursales\(data \?\? \[\]\);[\s\S]*?setLoading\(false\);[\s\S]*?\}\);[\s\S]*?\}, \[\]\);/g;
  
  const newEffect = `useEffect(() => {
    const { doctor_id, sucursal } = obtenerCitaEnProceso();
    if (!doctor_id) {
      // Fallback si no hay doctor seleccionado, mostrar todas
      supabase.from("sucursales").select("*").order("nombre").then(({ data }) => {
        setSucursales(data ?? []);
        setLoading(false);
      });
      return;
    }

    // Filtrar sucursales donde trabaja el doctor seleccionado
    supabase
      .from("doctor_consultorios")
      .select(\`
        consultorios(
          sucursales(id, nombre, direccion)
        )
      \`)
      .eq("doctor_id", doctor_id)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching sucursales:", error);
          setLoading(false);
          return;
        }
        
        // Extraer sucursales únicas
        const uniqueSucursales = new Map();
        data?.forEach((item: any) => {
          const suc = item.consultorios?.sucursales;
          if (suc && !uniqueSucursales.has(suc.id)) {
            uniqueSucursales.set(suc.id, suc);
          }
        });
        
        const sucursalesFiltradas = Array.from(uniqueSucursales.values());
        setSucursales(sucursalesFiltradas);
        setLoading(false);

        // Pre-seleccionar si ya estaba en el store y existe en las filtradas
        if (sucursal) {
          const found = sucursalesFiltradas.find((s: any) => s.nombre === sucursal);
          if (found) setSelectedId(found.id);
        }
      });
  }, []);`;

  content = content.replace(oldEffect, newEffect);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

updateSucursalesPage('src/app/dashboard/paciente/agendar/sucursal/page.tsx');
updateSucursalesPage('src/app/dashboard/secretaria/agendar/sucursal/page.tsx');

