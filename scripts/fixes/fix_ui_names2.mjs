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

// 1. Fix secretaria agendar
replaceInFile('src/app/dashboard/secretaria/agendar/page.tsx', [
    { regex: /\{p\.usuario\} · /g, replacement: '' },
    { regex: /\{selectedPaciente\.usuario\}/g, replacement: '' }
]);

