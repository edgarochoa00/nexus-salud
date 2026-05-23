import fs from 'fs';

function removeFilter(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the filter logic with just setSchedules(data)
    const oldLogic = `            // Filter by the specific sucursal selected
            const relevant = data.filter((d: any) => d.consultorios?.sucursales?.nombre === sucursal);
            setSchedules(relevant.length > 0 ? relevant : data);`;
            
    const newLogic = `            // Eliminamos el filtro por sucursal para que muestre TODOS los días del doctor
            setSchedules(data);`;

    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

removeFilter('src/app/dashboard/paciente/agendar/horario/page.tsx');
removeFilter('src/app/dashboard/secretaria/agendar/horario/page.tsx');

console.log("Removed sucursal filter from horario pages.");
