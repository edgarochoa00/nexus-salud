import fs from 'fs';

function fixDynamicTimes(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove hardcoded times
    content = content.replace(/const morningTimes = \[.*?\];\n\s*const afternoonTimes = \[.*?\];\n/, '');

    // 2. Replace getAvailableTimes
    const oldGetTimes = `  const getAvailableTimes = \\(times: string\\[\\]\\) => \\{\\s*if \\(!selectedDate \\|\\| schedules.length === 0\\) return times;\\s*const dayName = mapDiaSemana\\[selectedDate.getDay\\(\\)\\];\\s*const schedule = schedules.find\\(s => s.dia_semana.normalize\\("NFD"\\).replace\\(/\\[\\\\u0300-\\\\u036f\\]/g, ""\\).toLowerCase\\(\\) === dayName\\);\\s*if \\(!schedule\\) return \\[\\];\\s*return times.filter\\(t => \\{\\s*const timeVal = t \\+ ":00";\\s*return timeVal >= schedule.hora_inicio && timeVal < schedule.hora_fin;\\s*\\}\\);\\s*\\};`;
    
    // We will replace this entire block and the validMorningTimes declarations
    const newTimesLogic = `  const generateTimeSlots = () => {
    if (!selectedDate || schedules.length === 0) return { morning: [], afternoon: [] };
    const dayName = mapDiaSemana[selectedDate.getDay()];
    const schedule = schedules.find(s => s.dia_semana.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() === dayName);
    if (!schedule) return { morning: [], afternoon: [] };

    const slots: string[] = [];
    let [currentH, currentM] = schedule.hora_inicio.split(":").map(Number);
    const [endH, endM] = schedule.hora_fin.split(":").map(Number);
    
    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const timeStr = \`\${String(currentH).padStart(2, '0')}:\${String(currentM).padStart(2, '0')}\`;
      slots.push(timeStr);
      currentM += 30;
      if (currentM >= 60) {
        currentH += 1;
        currentM -= 60;
      }
    }

    return {
      morning: slots.filter(t => parseInt(t.split(":")[0]) < 12),
      afternoon: slots.filter(t => parseInt(t.split(":")[0]) >= 12)
    };
  };

  const { morning: validMorningTimes, afternoon: validAfternoonTimes } = generateTimeSlots();`;

    // Regex to match the old getAvailableTimes and the two valid*Times declarations
    content = content.replace(/const getAvailableTimes = [\s\S]*?const validAfternoonTimes = getAvailableTimes\(afternoonTimes\);/, newTimesLogic);

    // 3. Add prompt to select a day if not selected
    content = content.replace(
      /\{validMorningTimes\.length === 0 \? <p className="text-white\/30 text-xs col-span-3">Sin horarios en este turno<\/p> : validMorningTimes\.map/g,
      `{!selectedDate ? <p className="text-white/30 text-xs col-span-3">Selecciona un día primero</p> : validMorningTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">Sin horarios en este turno</p> : validMorningTimes.map`
    );

    content = content.replace(
      /\{validAfternoonTimes\.length === 0 \? <p className="text-white\/30 text-xs col-span-3">Sin horarios en este turno<\/p> : validAfternoonTimes\.map/g,
      `{!selectedDate ? <p className="text-white/30 text-xs col-span-3">Selecciona un día primero</p> : validAfternoonTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">Sin horarios en este turno</p> : validAfternoonTimes.map`
    );

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

fixDynamicTimes('src/app/dashboard/paciente/agendar/horario/page.tsx');
fixDynamicTimes('src/app/dashboard/secretaria/agendar/horario/page.tsx');

console.log("Dynamically generating time slots based on schedule.");
