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

// 1. Remove usuario block in paciente perfil
replaceInFile('src/app/dashboard/paciente/perfil/page.tsx', [
    {
        // Select 'usuario' in supabase
        regex: /nombre, apellidos, correo, telefono, usuario,/g,
        replacement: 'nombre, apellidos, correo, telefono, curp,'
    },
    {
        // Replace Usuario UI block with CURP block
        regex: /<p className="text-xs text-white\/50 font-bold uppercase tracking-widest mb-0\.5">Usuario<\/p>\s*<p className="text-white font-medium">@\{perfil\.usuario\}<\/p>/g,
        replacement: '<p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-0.5">CURP</p>\n                <p className="text-white font-medium">{perfil.curp || "No asignada"}</p>'
    }
]);

// 2. Fix admin doctores
replaceInFile('src/app/dashboard/admin/doctores/page.tsx', [
    { regex: /const \[username, setUsername\] = useState\(""\);/g, replacement: 'const [curp, setCurp] = useState("");' },
    { regex: /username,/g, replacement: 'curp,' },
    { regex: /setUsername\(""\);/g, replacement: 'setCurp("");' },
    { regex: /<label className="text-\[10px\] font-bold text-cyan-400 uppercase tracking-widest ml-1">ID Usuario \(Login\)<\/label>[\s\S]*?onChange=\{\(e\) => setUsername\(e.target.value\)\}[\s\S]*?\/>/g, 
      replacement: '<label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">CURP</label>\n                    <input\n                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"\n                      placeholder="CURP (18 caracteres)"\n                      type="text"\n                      required\n                      value={curp}\n                      onChange={(e) => setCurp(e.target.value.toUpperCase())}\n                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}\n                    />' },
    { regex: /<span className="flex items-center gap-1">\s*<span className="material-symbols-outlined text-xs">badge<\/span> \{doc\.usuario\}\s*<\/span>/g, replacement: '' }
]);

// 3. Fix admin administradores
replaceInFile('src/app/dashboard/admin/administradores/page.tsx', [
    { regex: /const \[username, setUsername\] = useState\(""\);/g, replacement: 'const [curp, setCurp] = useState("");' },
    { regex: /username,/g, replacement: 'curp,' },
    { regex: /setUsername\(""\);/g, replacement: 'setCurp("");' },
    { regex: /<label className="text-\[10px\] font-bold text-cyan-400 uppercase tracking-widest ml-1">ID Usuario \(Login\)<\/label>[\s\S]*?onChange=\{\(e\) => setUsername\(e.target.value\)\}[\s\S]*?\/>/g, 
      replacement: '<label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">CURP</label>\n                    <input\n                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-[#00a3ad]"\n                      placeholder="CURP (18 caracteres)"\n                      type="text"\n                      required\n                      value={curp}\n                      onChange={(e) => setCurp(e.target.value.toUpperCase())}\n                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}\n                    />' },
    { regex: /<span className="flex items-center gap-1">\s*<span className="material-symbols-outlined text-xs">badge<\/span> \{admin\.usuario\}\s*<\/span>/g, replacement: '' }
]);

// 4. Fix admin asistentes
replaceInFile('src/app/dashboard/admin/asistentes/page.tsx', [
    { regex: /const \[username, setUsername\] = useState\(""\);/g, replacement: 'const [curp, setCurp] = useState("");' },
    { regex: /username,/g, replacement: 'curp,' },
    { regex: /setUsername\(""\);/g, replacement: 'setCurp("");' },
    { regex: /<label className="text-\[10px\] font-bold text-cyan-400 uppercase tracking-widest ml-1">ID Usuario \(Login\)<\/label>[\s\S]*?onChange=\{\(e\) => setUsername\(e.target.value\)\}[\s\S]*?\/>/g, 
      replacement: '<label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">CURP</label>\n                    <input\n                      className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-slate-500 outline-none"\n                      placeholder="CURP (18 caracteres)"\n                      type="text"\n                      required\n                      value={curp}\n                      onChange={(e) => setCurp(e.target.value.toUpperCase())}\n                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}\n                    />' },
    { regex: /<span className="flex items-center gap-1">\s*<span className="material-symbols-outlined text-xs">badge<\/span> \{asistente\.usuario\}\s*<\/span>/g, replacement: '' }
]);

// 5. Fix secretaria nuevo paciente
replaceInFile('src/app/dashboard/secretaria/pacientes/nuevo/page.tsx', [
    { regex: /username: "",/g, replacement: 'curp: "",' },
    { regex: /username: formData\.username\.toLowerCase\(\),/g, replacement: 'curp: formData.curp.toUpperCase(),' },
    { regex: /<label className="text-\[10px\] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">ID de Usuario<\/label>[\s\S]*?onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, username: e.target.value.toLowerCase\(\).replace\(\/\\s\/g, ""\) \}\)\}[\s\S]*?\/>/g, 
      replacement: '<label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">CURP</label>\n              <input\n                type="text"\n                placeholder="CURP (18 caracteres)"\n                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"\n                value={formData.curp} onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase().replace(/\\s/g, "") })}\n              />' }
]);

