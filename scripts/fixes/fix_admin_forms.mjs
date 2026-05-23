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

const files = [
    'src/app/dashboard/admin/doctores/page.tsx',
    'src/app/dashboard/admin/administradores/page.tsx',
    'src/app/dashboard/admin/asistentes/page.tsx'
];

for (const file of files) {
    replaceInFile(file, [
        {
            // Remove required from email input
            regex: /type="email"\s*required/g,
            replacement: 'type="email"'
        },
        {
            // Change label to optional
            regex: /<label className="text-\[10px\] font-bold text-cyan-400 uppercase tracking-widest ml-1">Correo Electrónico<\/label>/g,
            replacement: '<label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Correo Electrónico (Opcional si usa Teléfono)</label>'
        },
        {
            // Change label for telefono to optional
            regex: /<label className="text-\[10px\] font-bold text-cyan-400 uppercase tracking-widest ml-1">Teléfono<\/label>/g,
            replacement: '<label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Teléfono (Opcional si usa Correo)</label>'
        }
    ]);
}
