const schedules = [
  {
    dia_semana: 'lunes',
    hora_inicio: '08:00:00',
    hora_fin: '13:00:00'
  }
];

const selectedDate = new Date('2026-05-25T12:00:00Z'); // Monday
const mapDiaSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const dayName = mapDiaSemana[selectedDate.getDay()];
console.log("dayName:", dayName);

const schedule = schedules.find(s => s.dia_semana.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === dayName);
console.log("schedule found:", schedule);

const times = ["08:00", "09:00", "09:30", "10:00", "11:00", "11:30"];

const available = times.filter(t => {
  const timeVal = t + ":00";
  return timeVal >= schedule.hora_inicio && timeVal < schedule.hora_fin;
});
console.log("available times:", available);
