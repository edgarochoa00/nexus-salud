// Tipos TypeScript — NexusSalud (Schema Completo)

// ─── Roles y Estados ─────────────────────────────────────────
export type Rol = 'admin' | 'doctor' | 'secretaria' | 'paciente';
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
export type EstadoPago = 'pendiente' | 'pagado' | 'parcial';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';
export type TipoCancelacion = 'medico' | 'paciente' | 'sistema' | 'admin';
export type EstadoReembolso = 'pendiente' | 'aprobado' | 'rechazado' | 'procesado';
export type TipoNotificacion = 'info' | 'recordatorio' | 'cancelacion' | 'confirmacion' | 'pago';

// ─── Entidades Base ──────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  correo: string;
  usuario: string;
  rol: Rol;
  created_at: string;
}

/** @deprecated Usar Usuario — mantenido por compatibilidad */
export interface Perfil extends Usuario {}

export interface Especialidad {
  id: number;
  nombre: string;
  created_at: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  id_administrador?: string;
  created_at: string;
}

export interface Consultorio {
  id: number;
  nombre: string;
  sucursal_id: number;
  sucursales?: Sucursal;
  created_at: string;
}

// ─── Sub-Tablas de Rol ───────────────────────────────────────
export interface Doctor {
  id: string;
  precio_consulta: number;
  especialidad_id?: number;
  especialidades?: Especialidad;
  usuarios?: Usuario;
  created_at: string;
}

export interface Secretaria {
  id: string;
  sucursal_id?: number;
  sucursales?: Sucursal;
  usuarios?: Usuario;
  created_at: string;
}

export interface Paciente {
  id: string;
  fecha_nacimiento?: string;
  usuarios?: Usuario;
  created_at: string;
}

export interface Administrador {
  id: string;
  usuarios?: Usuario;
  created_at: string;
}

export interface DoctorConsultorio {
  id: number;
  doctor_id: string;
  consultorio_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  doctores?: Doctor;
  consultorios?: Consultorio;
  created_at: string;
}

// ─── Citas y Agenda ─────────────────────────────────────────
export interface Cita {
  id: number;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  doctor_id: string;
  paciente_id: string;
  consultorio_id?: number;
  creada_por?: string;
  created_at: string;
  // Relaciones populadas
  paciente?: Usuario;
  doctor?: Usuario;
  consultorio?: Consultorio;
  pagos?: Pago[];
}

// ─── Expedientes y Consultas ─────────────────────────────────
export interface Expediente {
  id: number;
  paciente_id: string;
  created_at: string;
  // Relaciones
  pacientes?: Paciente;
  consultas?: Consulta[];
}

export interface Consulta {
  id: number;
  fecha_hora: string;
  motivo?: string;
  receta?: string;
  expediente_id: number;
  cita_id?: number;
  created_at: string;
  // Relaciones
  expedientes?: Expediente;
  citas?: Cita;
}

// ─── Pagos ──────────────────────────────────────────────────
export interface Pago {
  folio: number;
  monto_total: number;
  anticipo: number;
  metodo_pago: MetodoPago;
  estatus: EstadoPago;
  cita_id: number;
  created_at: string;
  citas?: Cita;
}

// ─── Cancelaciones y Reembolsos ──────────────────────────────
export interface Cancelacion {
  id: number;
  fecha: string;
  hora: string;
  motivo?: string;
  tipo: TipoCancelacion;
  cancelado_por?: string;
  cita_id: number;
  realizada_por?: string;
  created_at: string;
  citas?: Cita;
  reembolsos?: Reembolso[];
}

export interface Reembolso {
  folio_reembolso: number;
  monto: number;
  estatus: EstadoReembolso;
  cancelacion_id: number;
  created_at: string;
  cancelaciones?: Cancelacion;
}

// ─── Notificaciones ─────────────────────────────────────────
export interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: TipoNotificacion;
  paciente_id: string;
  cancelacion_id?: number;
  created_at: string;
}

/** @deprecated Tabla eliminada — usar doctor_consultorios */
export interface HorarioBloqueado {
  id: string;
  doctor_id: string;
  fecha: string;
  hora: string;
  motivo: string;
  created_at: string;
}
