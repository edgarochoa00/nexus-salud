import fs from 'fs';

function fixHydration(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove the synchronous call
    content = content.replace(/const cita = obtenerCitaEnProceso\(\);\n/, '');

    // 2. Add state
    const stateHook = `  const [isMounted, setIsMounted] = useState(false);\n  const [cita, setCita] = useState<any>({});\n`;
    content = content.replace(/const \[selectedTime, setSelectedTime\] = useState<string \| null>\(null\);/, `const [selectedTime, setSelectedTime] = useState<string | null>(null);\n${stateHook}`);

    // 3. Update useEffect
    const oldEffect = `  useEffect(() => {
    const supabase = createClient();
    const { doctor_id, sucursal } = obtenerCitaEnProceso();`;
    
    const newEffect = `  useEffect(() => {
    setIsMounted(true);
    const dataCita = obtenerCitaEnProceso();
    setCita(dataCita);
    const supabase = createClient();
    const { doctor_id, sucursal } = dataCita;`;

    content = content.replace(oldEffect, newEffect);

    // 4. Return null or skeleton while not mounted
    const returnStatement = `  return (`;
    const newReturn = `  if (!isMounted) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin material-symbols-outlined text-4xl text-cyan-400">progress_activity</div></div>;\n\n  return (`;
    
    // Only replace the first occurrence (main return)
    content = content.replace(returnStatement, newReturn);

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

fixHydration('src/app/dashboard/paciente/agendar/horario/page.tsx');
fixHydration('src/app/dashboard/secretaria/agendar/horario/page.tsx');

console.log("Hydration fix applied.");
