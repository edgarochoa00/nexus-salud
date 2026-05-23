import fs from 'fs';

const filePath = 'src/app/dashboard/admin/asignaciones/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. State changes
content = content.replace(/const \[diaSemana, setDiaSemana\] = useState\("lunes"\);/, 'const [diasSemana, setDiasSemana] = useState<string[]>(["lunes"]);');

// 2. Handle Submit logic changes
const oldSubmitLogic = `      // Formatear horas agregando segundos si no los tienen para cumplir con el tipo TIME
      const tInicio = horaInicio.length === 5 ? \`\${horaInicio}:00\` : horaInicio;
      const tFin = horaFin.length === 5 ? \`\${horaFin}:00\` : horaFin;

      // Validar choques de horario en el mismo consultorio
      const choqueConsultorio = assignmentsList.find((asig) => {
        if (asig.dia_semana === diaSemana && asig.consultorio_id === Number(consultorioId)) {
          if (tInicio < asig.hora_fin && tFin > asig.hora_inicio) return true;
        }
        return false;
      });

      if (choqueConsultorio) {
        const docConflicto = choqueConsultorio.doctores?.usuarios?.nombre || "otro médico";
        const docApellidos = choqueConsultorio.doctores?.usuarios?.apellidos || "";
        setErrorMsg(\`Choque de horario: Ese consultorio ya está ocupado los \${diaSemana} de \${choqueConsultorio.hora_inicio.slice(0,5)} a \${choqueConsultorio.hora_fin.slice(0,5)} por Dr. \${docConflicto} \${docApellidos}.\`);
        setLoading(false);
        return;
      }
      
      // Validar que el mismo doctor no esté asignado a dos lugares al mismo tiempo
      const choqueDoctor = assignmentsList.find((asig) => {
        if (asig.dia_semana === diaSemana && asig.doctor_id === doctorId) {
          if (tInicio < asig.hora_fin && tFin > asig.hora_inicio) return true;
        }
        return false;
      });

      if (choqueDoctor) {
        const conConflicto = choqueDoctor.consultorios?.nombre || "otro consultorio";
        setErrorMsg(\`Choque de horario: El médico seleccionado ya tiene turno asignado en \${conConflicto} los \${diaSemana} de \${choqueDoctor.hora_inicio.slice(0,5)} a \${choqueDoctor.hora_fin.slice(0,5)}.\`);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("doctor_consultorios")
        .insert({
          doctor_id: doctorId,
          consultorio_id: Number(consultorioId),
          dia_semana: diaSemana,
          hora_inicio: tInicio,
          hora_fin: tFin,
        });`;

const newSubmitLogic = `      if (diasSemana.length === 0) {
        setErrorMsg("Debes seleccionar al menos un día de la semana.");
        setLoading(false);
        return;
      }

      const tInicio = horaInicio.length === 5 ? \`\${horaInicio}:00\` : horaInicio;
      const tFin = horaFin.length === 5 ? \`\${horaFin}:00\` : horaFin;

      // Validate all selected days
      for (const dia of diasSemana) {
        const choqueConsultorio = assignmentsList.find((asig) => {
          if (asig.dia_semana === dia && asig.consultorio_id === Number(consultorioId)) {
            if (tInicio < asig.hora_fin && tFin > asig.hora_inicio) return true;
          }
          return false;
        });

        if (choqueConsultorio) {
          const docConflicto = choqueConsultorio.doctores?.usuarios?.nombre || "otro médico";
          const docApellidos = choqueConsultorio.doctores?.usuarios?.apellidos || "";
          setErrorMsg(\`Choque de horario: El consultorio ya está ocupado el \${dia} de \${choqueConsultorio.hora_inicio.slice(0,5)} a \${choqueConsultorio.hora_fin.slice(0,5)} por Dr. \${docConflicto} \${docApellidos}.\`);
          setLoading(false);
          return;
        }
        
        const choqueDoctor = assignmentsList.find((asig) => {
          if (asig.dia_semana === dia && asig.doctor_id === doctorId) {
            if (tInicio < asig.hora_fin && tFin > asig.hora_inicio) return true;
          }
          return false;
        });

        if (choqueDoctor) {
          const conConflicto = choqueDoctor.consultorios?.nombre || "otro consultorio";
          setErrorMsg(\`Choque de horario: El médico ya tiene turno en \${conConflicto} el \${dia} de \${choqueDoctor.hora_inicio.slice(0,5)} a \${choqueDoctor.hora_fin.slice(0,5)}.\`);
          setLoading(false);
          return;
        }
      }

      // Insert all
      const inserts = diasSemana.map((dia) => ({
        doctor_id: doctorId,
        consultorio_id: Number(consultorioId),
        dia_semana: dia,
        hora_inicio: tInicio,
        hora_fin: tFin,
      }));

      const { error } = await supabase.from("doctor_consultorios").insert(inserts);`;

content = content.replace(oldSubmitLogic, newSubmitLogic);

// 3. UI Changes (Replace the <select> with checkboxes)
const oldSelectUI = `<div className="space-y-2">
                  <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Día de la Semana</label>
                  <select
                    className="w-full px-4 py-3.5 rounded-2xl text-white bg-cyan-950/80 outline-none border border-white/10"
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value)}
                    required
                  >
                    <option value="lunes" className="bg-cyan-950 text-white">Lunes</option>
                    <option value="martes" className="bg-cyan-950 text-white">Martes</option>
                    <option value="miercoles" className="bg-cyan-950 text-white">Miércoles</option>
                    <option value="jueves" className="bg-cyan-950 text-white">Jueves</option>
                    <option value="viernes" className="bg-cyan-950 text-white">Viernes</option>
                    <option value="sabado" className="bg-cyan-950 text-white">Sábado</option>
                    <option value="domingo" className="bg-cyan-950 text-white">Domingo</option>
                  </select>
                </div>`;

const newCheckboxUI = `<div className="space-y-3">
                  <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest ml-1">Días de la Semana (Múltiples)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map(dia => (
                      <label key={dia} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-cyan-950/50 text-rose-500 focus:ring-rose-500/50"
                          checked={diasSemana.includes(dia)}
                          onChange={(e) => {
                            if (e.target.checked) setDiasSemana([...diasSemana, dia]);
                            else setDiasSemana(diasSemana.filter(d => d !== dia));
                          }}
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors capitalize">{dia}</span>
                      </label>
                    ))}
                  </div>
                </div>`;

content = content.replace(oldSelectUI, newCheckboxUI);

fs.writeFileSync(filePath, content, 'utf8');
console.log("UI updated for multiple days.");

