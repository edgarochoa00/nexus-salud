import fs from 'fs';

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. registro-paciente/page.tsx
replaceInFile('src/app/registro-paciente/page.tsx', [
    { regex: /type="tel" icon="phone" value=\{formData\.telefono\}/g, replacement: 'type="tel" icon="phone" value={formData.telefono} maxLength={10}' },
    { regex: /type="text" icon="badge" value=\{formData\.curp\}/g, replacement: 'type="text" icon="badge" value={formData.curp} maxLength={18}' }
]);

// 2. Login page
replaceInFile('src/app/page.tsx', [
    { regex: /type="text"\n\s*icon="badge"\n\s*value=\{curp\}/g, replacement: 'type="text"\n              icon="badge"\n              value={curp}\n              maxLength={18}' }
]);

// 3. Admin doctores/page.tsx
replaceInFile('src/app/dashboard/admin/doctores/page.tsx', [
    { regex: /placeholder="5512345678"\n\s*type="tel"\n\s*value=\{telefono\}/g, replacement: 'placeholder="5512345678"\n                      type="tel"\n                      value={telefono}\n                      maxLength={10}' },
    { regex: /placeholder="CURP \(18 caracteres\)"\n\s*type="text"\n\s*required\n\s*value=\{curp\}/g, replacement: 'placeholder="CURP (18 caracteres)"\n                      type="text"\n                      required\n                      value={curp}\n                      maxLength={18}' }
]);

// 4. Admin administradores/page.tsx
replaceInFile('src/app/dashboard/admin/administradores/page.tsx', [
    { regex: /placeholder="5512345678"\n\s*type="tel"\n\s*value=\{telefono\}/g, replacement: 'placeholder="5512345678"\n                      type="tel"\n                      value={telefono}\n                      maxLength={10}' },
    { regex: /placeholder="CURP \(18 caracteres\)"\n\s*type="text"\n\s*required\n\s*value=\{curp\}/g, replacement: 'placeholder="CURP (18 caracteres)"\n                      type="text"\n                      required\n                      value={curp}\n                      maxLength={18}' }
]);

// 5. Admin asistentes/page.tsx
replaceInFile('src/app/dashboard/admin/asistentes/page.tsx', [
    { regex: /placeholder="5512345678"\n\s*type="tel"\n\s*value=\{telefono\}/g, replacement: 'placeholder="5512345678"\n                      type="tel"\n                      value={telefono}\n                      maxLength={10}' },
    { regex: /placeholder="CURP \(18 caracteres\)"\n\s*type="text"\n\s*required\n\s*value=\{curp\}/g, replacement: 'placeholder="CURP (18 caracteres)"\n                      type="text"\n                      required\n                      value={curp}\n                      maxLength={18}' }
]);

// 6. Secretaria paciente nuevo/page.tsx
replaceInFile('src/app/dashboard/secretaria/pacientes/nuevo/page.tsx', [
    { regex: /type="tel"\n\s*placeholder="Ej: 5512345678"/g, replacement: 'type="tel"\n                placeholder="Ej: 5512345678"\n                maxLength={10}' },
    { regex: /type="text"\n\s*placeholder="CURP \(18 caracteres\)"/g, replacement: 'type="text"\n                placeholder="CURP (18 caracteres)"\n                maxLength={18}' }
]);

