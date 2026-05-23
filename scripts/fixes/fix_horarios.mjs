import fs from 'fs';

function updateHorarioPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Step 1: Add state for doctor schedules
  content = content.replace(
    /const \[selectedTime, setSelectedTime\] = useState<string \| null>\(null\);/,
    `const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);`
  );

  // Step 2: Fetch doctor schedules in useEffect
  const fetchEffect = `
  useEffect(() => {
    const supabase = createClient();
    const { doctor_id, sucursal } = obtenerCitaEnProceso();
    if (doctor_id) {
      supabase
        .from("doctor_consultorios")
        .select("dia_semana, hora_inicio, hora_fin, consultorios(sucursales(nombre))")
        .eq("doctor_id", doctor_id)
        .then(({ data }) => {
          if (data) {
            // Filter by the specific sucursal selected
            const relevant = data.filter((d: any) => d.consultorios?.sucursales?.nombre === sucursal);
            setSchedules(relevant.length > 0 ? relevant : data);
          }
        });
    }
  }, []);
`;
  content = content.replace(/const firstDay = new Date/, fetchEffect + '\n  const firstDay = new Date');
  content = content.replace(/import \{ obtenerCitaEnProceso, guardarCitaEnProceso \} from "@\/utils\/citaStore";/, 'import { obtenerCitaEnProceso, guardarCitaEnProceso } from "@/utils/citaStore";\nimport { createClient } from "@/utils/supabase/client";');

  // Step 3: Determine if a day is available
  // Replace the map of calendar days to check if the day of week matches the doctor's schedule
  const dayNameMap = `
  const mapDiaSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const isDayAvailable = (date: Date) => {
    if (schedules.length === 0) return true; // Si no hay horarios, permite todos (fallback)
    const dayName = mapDiaSemana[date.getDay()];
    // Ojo: en BD puede decir "miércoles" con acento, normalizamos
    return schedules.some(s => s.dia_semana.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() === dayName);
  };
`;
  content = content.replace(/const monthNames = /g, dayNameMap + '\n  const monthNames = ');

  content = content.replace(/const isPast = d < today && d\.toDateString\(\) !== today\.toDateString\(\);/, `const isPast = d < today && d.toDateString() !== today.toDateString();
              const isAvailable = isDayAvailable(d);`);
              
  content = content.replace(/onClick=\{\(\) => !isPast && handleDaySelect\(d\)\}/, `onClick={() => !isPast && isAvailable && handleDaySelect(d)}`);
  
  content = content.replace(/isPast\n\s*\? "text-white\/15 cursor-not-allowed"/, `isPast || !isAvailable
                      ? "text-white/15 cursor-not-allowed"`);

  // Step 4: Filter Times based on selected day
  const timeFilterLogic = `
  const getAvailableTimes = (times: string[]) => {
    if (!selectedDate || schedules.length === 0) return times;
    const dayName = mapDiaSemana[selectedDate.getDay()];
    const schedule = schedules.find(s => s.dia_semana.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() === dayName);
    if (!schedule) return [];
    
    return times.filter(t => {
      const timeVal = t + ":00";
      return timeVal >= schedule.hora_inicio && timeVal < schedule.hora_fin;
    });
  };

  const validMorningTimes = getAvailableTimes(morningTimes);
  const validAfternoonTimes = getAvailableTimes(afternoonTimes);
`;
  content = content.replace(/const isTodaySelected = /g, timeFilterLogic + '\n  const isTodaySelected = ');

  content = content.replace(/morningTimes\.map/g, 'validMorningTimes.map');
  content = content.replace(/afternoonTimes\.map/g, 'validAfternoonTimes.map');

  // Handle case where validTimes is empty
  content = content.replace(/<div className="grid grid-cols-3 gap-3">[\s\S]*?\{validMorningTimes\.map/g, `<div className="grid grid-cols-3 gap-3">
            {validMorningTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">No hay disponibilidad</p> : validMorningTimes.map`);
            
  content = content.replace(/<div className="grid grid-cols-3 gap-3">[\s\S]*?\{validAfternoonTimes\.map/g, `<div className="grid grid-cols-3 gap-3">
            {validAfternoonTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">No hay disponibilidad</p> : validAfternoonTimes.map`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

updateHorarioPage('src/app/dashboard/paciente/agendar/horario/page.tsx');
updateHorarioPage('src/app/dashboard/secretaria/agendar/horario/page.tsx');

