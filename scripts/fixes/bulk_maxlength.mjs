import fs from 'fs';
import path from 'path';

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getFiles('src/app');

function bulkReplace() {
  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Nombre y Apellidos (50)
    content = content.replace(/value=\{formData\.nombre\}/g, 'value={formData.nombre} maxLength={50}');
    content = content.replace(/value=\{formData\.apellidos\}/g, 'value={formData.apellidos} maxLength={50}');
    content = content.replace(/value=\{nombre\}\s*onChange/g, 'value={nombre} maxLength={50} onChange');
    content = content.replace(/value=\{apellidos\}\s*onChange/g, 'value={apellidos} maxLength={50} onChange');
    
    // Email (100)
    content = content.replace(/type="email"([\s\S]*?)value=\{formData\.correo\}/g, 'type="email"$1value={formData.correo} maxLength={100}');
    content = content.replace(/type="email"([\s\S]*?)value=\{correo\}/g, 'type="email"$1value={correo} maxLength={100}');

    // Contraseñas (64)
    content = content.replace(/type="password"([\s\S]*?)value=\{formData\.password\}/g, 'type="password"$1value={formData.password} maxLength={64}');
    content = content.replace(/type=\{showPass \? "text" : "password"\}([\s\S]*?)value=\{password\}/g, 'type={showPass ? "text" : "password"}$1value={password} maxLength={64}');
    content = content.replace(/type="password"([\s\S]*?)value=\{password\}/g, 'type="password"$1value={password} maxLength={64}');
    
    // Pago / Tarjetas
    content = content.replace(/placeholder="0000 0000 0000 0000" type="text" required \/>/g, 'placeholder="0000 0000 0000 0000" type="text" required maxLength={19} />');
    content = content.replace(/placeholder="Como aparece en la tarjeta" type="text" required \/>/g, 'placeholder="Como aparece en la tarjeta" type="text" required maxLength={50} />');
    content = content.replace(/placeholder="MM \/ AA" type="text" required \/>/g, 'placeholder="MM / AA" type="text" required maxLength={7} />');
    content = content.replace(/placeholder="123" type="password" required \/>/g, 'placeholder="123" type="password" required maxLength={4} />');
    
    // Sucursales / Consultorios
    content = content.replace(/value=\{nombreSucursal\}\s*onChange/g, 'value={nombreSucursal} maxLength={50} onChange');
    content = content.replace(/value=\{nombreConsultorio\}\s*onChange/g, 'value={nombreConsultorio} maxLength={20} onChange');

    // Remove duplicates if the script is re-run (just in case)
    content = content.replace(/maxLength=\{50\}\s*maxLength=\{50\}/g, 'maxLength={50}');
    content = content.replace(/maxLength=\{100\}\s*maxLength=\{100\}/g, 'maxLength={100}');
    content = content.replace(/maxLength=\{64\}\s*maxLength=\{64\}/g, 'maxLength={64}');
    content = content.replace(/maxLength=\{19\}\s*maxLength=\{19\}/g, 'maxLength={19}');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

bulkReplace();
