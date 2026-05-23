import fs from 'fs';

function fixTimes(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the entire <section className="space-y-6"> block
    const oldSectionRegex = /<section className="space-y-6">[\s\S]*?<\/section>/;
    
    const newSection = `<section className="space-y-6">
        <div>
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Turno Matutino (Antes de las 12 PM)</h3>
          <div className="grid grid-cols-3 gap-3">
            {!selectedDate ? <p className="text-white/30 text-xs col-span-3">Selecciona un día primero</p> : validMorningTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">Sin horarios en este turno</p> : validMorningTimes.map((time) => {
              const isPast = isTimePast(time);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleTimeSelect(time)}
                  className={\`py-3 rounded-xl text-sm transition-all active:scale-95 \${
                    isPast
                      ? "opacity-30 cursor-not-allowed bg-white/5 border border-white/5 text-white/50"
                      : isSelected
                        ? "font-bold bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] shadow-[0_0_20px_rgba(0,163,173,0.6)]"
                        : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] font-medium text-white hover:bg-white/10"
                  }\`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-headline font-semibold text-xs text-white/40 mb-3 uppercase tracking-wider">Turno Vespertino (Después de las 12 PM)</h3>
          <div className="grid grid-cols-3 gap-3">
            {!selectedDate ? <p className="text-white/30 text-xs col-span-3">Selecciona un día primero</p> : validAfternoonTimes.length === 0 ? <p className="text-white/30 text-xs col-span-3">Sin horarios en este turno</p> : validAfternoonTimes.map((time) => {
              const isPast = isTimePast(time);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleTimeSelect(time)}
                  className={\`py-3 rounded-xl text-sm transition-all active:scale-95 \${
                    isPast
                      ? "opacity-30 cursor-not-allowed bg-white/5 border border-white/5 text-white/50"
                      : isSelected
                        ? "font-bold bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] shadow-[0_0_20px_rgba(0,163,173,0.6)]"
                        : "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] font-medium text-white hover:bg-white/10"
                  }\`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </section>`;

    content = content.replace(oldSectionRegex, newSection);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

fixTimes('src/app/dashboard/paciente/agendar/horario/page.tsx');
fixTimes('src/app/dashboard/secretaria/agendar/horario/page.tsx');

console.log("Fixed rendering of time sections.");
