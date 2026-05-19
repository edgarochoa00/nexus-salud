// Store para el flujo de agendamiento
// Usa localStorage para persistir datos entre pasos de la navegación

export interface CitaEnProceso {
  paciente_id?: string;    // Para paciente: su propio ID | Para secretaria: ID seleccionado
  paciente_nombre?: string;
  doctor_id?: string;
  doctor_nombre?: string;
  especialidad?: string;
  fecha?: string;          // "YYYY-MM-DD"
  hora?: string;           // "HH:MM"
  sucursal?: string;
  precio?: number;
}

const KEY = "nexus_cita_en_proceso";

export function guardarCitaEnProceso(data: Partial<CitaEnProceso>) {
  if (typeof window === "undefined") return;
  const existing = obtenerCitaEnProceso();
  localStorage.setItem(KEY, JSON.stringify({ ...existing, ...data }));
}

export function obtenerCitaEnProceso(): CitaEnProceso {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function limpiarCitaEnProceso() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
