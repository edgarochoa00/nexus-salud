// Tipos TypeScript que reflejan el esquema de Supabase
export type Rol = 'admin' | 'doctor' | 'secretaria' | 'paciente';
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Perfil {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  telefono?: string;
  curp?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  especialidad: string;
  cedula_profesional?: string;
  consultorio?: string;
  perfil?: Perfil;
}

export interface Cita {
  id: string;
  paciente_id: string;
  doctor_id: string;
  fecha: string;
  hora: string;
  especialidad: string;
  sucursal: string;
  estado: EstadoCita;
  notas?: string;
  created_at: string;
  paciente?: Perfil;
  doctor?: Perfil;
}

export interface Expediente {
  id: string;
  cita_id?: string;
  paciente_id: string;
  doctor_id: string;
  fecha: string;
  motivo_consulta: string;
  ta?: string;
  temperatura?: string;
  frecuencia_cardiaca?: string;
  resumen_clinico: string;
  diagnostico: string;
  plan_tratamiento: string;
  created_at: string;
  paciente?: Perfil;
  doctor?: Perfil;
}

export interface HorarioBloqueado {
  id: string;
  doctor_id: string;
  fecha: string;
  hora: string;
  motivo: string;
  created_at: string;
}
