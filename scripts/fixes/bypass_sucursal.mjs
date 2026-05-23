import fs from 'fs';

function updateStepText(filePath, fromText, toText) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(new RegExp(fromText, 'g'), toText);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 1. Update the link in doctor/page.tsx to point directly to horario
function bypassLink(filePath, type) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/href="\/dashboard\/[a-z]+\/agendar\/sucursal"/, 'href="/dashboard/' + type + '/agendar/horario"');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

bypassLink('src/app/dashboard/paciente/agendar/doctor/page.tsx', 'paciente');
bypassLink('src/app/dashboard/secretaria/agendar/doctor/page.tsx', 'secretaria');

// 2. Update the progress dots/text
const files = [
  'src/app/dashboard/paciente/agendar/page.tsx',
  'src/app/dashboard/paciente/agendar/doctor/page.tsx',
  'src/app/dashboard/paciente/agendar/horario/page.tsx',
  'src/app/dashboard/secretaria/agendar/page.tsx',
  'src/app/dashboard/secretaria/agendar/doctor/page.tsx',
  'src/app/dashboard/secretaria/agendar/horario/page.tsx',
];

files.forEach(file => {
  updateStepText(file, 'Paso 1 de 4', 'Paso 1 de 3');
  updateStepText(file, 'Paso 2 de 4', 'Paso 2 de 3');
  updateStepText(file, 'Paso 4 de 4', 'Paso 3 de 3');
  
  // Also fix Horario page if it had "Paso 4 de 4" text, wait, I didn't see "Paso 4 de 4" in Horario but let's check.
  
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // If it has 4 progress bars: w-1/4 -> w-1/3
    content = content.replace(/w-1\/4/g, 'w-1/3');
    // The bars are usually formatted like: <div className="w-1/4 h-full bg-white/5"></div>
    // Let's just manually replace 4 bars with 3 in agendar/page.tsx
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log("Bypassed sucursal step and updated progress texts.");
