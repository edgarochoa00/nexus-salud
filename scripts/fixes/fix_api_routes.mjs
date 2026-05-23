import fs from 'fs';
import path from 'path';

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

const apiRoutes = [
    'src/app/api/admin/doctores/route.ts',
    'src/app/api/admin/administradores/route.ts',
    'src/app/api/admin/asistentes/route.ts'
];

for (const file of apiRoutes) {
    replaceInFile(file, [
        {
            // Replace destructuring
            regex: /const \{([^}]*)username([^}]*)\} = await request\.json\(\);/g,
            replacement: 'const {$1curp$2} = await request.json();'
        },
        {
            // Fix validation
            regex: /if \(\!nombre \|\| \!apellidos \|\| \!correo \|\| \!username \|\| \!password\) \{/g,
            replacement: 'if (!nombre || !apellidos || !curp || !password || (!correo && !telefono)) {'
        },
        {
            regex: /return NextResponse\.json\(\{ error: "Nombre, apellidos, correo, usuario y contraseña son obligatorios." \}, \{ status: 400 \}\);/g,
            replacement: 'return NextResponse.json({ error: "Faltan campos obligatorios o de contacto." }, { status: 400 });'
        },
        {
            // Username processing to curp processing
            regex: /const usernameLower = username\.toLowerCase\(\)\.trim\(\);/g,
            replacement: 'const curpUpper = curp.toUpperCase().trim();\n    const emailToUse = correo && correo.trim() !== "" ? correo.trim() : `${curpUpper.toLowerCase()}@nexussalud.app`;'
        },
        {
            // Fix email in createUser
            regex: /email: correo\.trim\(\),/g,
            replacement: 'email: emailToUse,'
        },
        {
            // Fix metadata
            regex: /username: usernameLower,/g,
            replacement: 'curp: curpUpper,'
        }
    ]);
}
