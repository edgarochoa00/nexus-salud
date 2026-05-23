import fs from 'fs';

function updateUI(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Change "Mañana" heading to "Turno Matutino"
    content = content.replace(
      /<h3 className="font-headline font-semibold text-xs text-white\/40 mb-3 uppercase tracking-wider">Mañana<\/h3>/g,
      '<h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Turno Matutino</h3>'
    );
    
    // Change "Tarde" heading to "Turno Vespertino"
    content = content.replace(
      /<h3 className="font-headline font-semibold text-xs text-white\/40 mb-3 uppercase tracking-wider">Tarde<\/h3>/g,
      '<h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Turno Vespertino</h3>'
    );

    // Make "No hay disponibilidad" more explanatory
    content = content.replace(
      />No hay disponibilidad<\/p>/g,
      '>Sin horarios en este turno</p>'
    );

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

updateUI('src/app/dashboard/paciente/agendar/horario/page.tsx');
updateUI('src/app/dashboard/secretaria/agendar/horario/page.tsx');

console.log("UX updated to prevent confusion between Mañana (morning) and Mañana (tomorrow).");
