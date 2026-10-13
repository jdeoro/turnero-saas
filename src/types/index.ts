// =====================================================================
// TIPOS DE DOMINIO — TURNERO SAAS MULTI-TENANT
// =====================================================================

export type TenantPlan = 'TRIAL' | 'BASICO' | 'PRO' | 'ENTERPRISE';
export type TenantEstado = 'TRIAL_ACTIVO' | 'ACTIVO' | 'EXPIRADO' | 'SUSPENDIDO';

export interface Tenant {
  id: number;
  slug: string;
  nombre_empresa: string;
  email_contacto: string;
  telefono?: string | null;
  plan: TenantPlan;
  estado: TenantEstado;
  trial_fin: string; // ISO o MySQL datetime
  activo: boolean;
  es_vigente?: boolean;
}

export type EstadoTurno =
  | 'EN_ESPERA'
  | 'DERIVADO_EN_ESPERA'
  | 'LLAMADO'
  | 'EN_ATENCION'
  | 'FINALIZADO'
  | 'AUSENTE';

export interface Turno {
  id_turno: number;
  tenant_id: number;
  codigoTicket: string;
  dni: string;
  titnroafi: number;
  id_sector: number;
  id_puesto?: number | null;
  id_usuario_operador?: number | null;
  estado: EstadoTurno;
  es_prioritario: number;
  observaciones?: string | null;
  fecha_emision: string;
  fecha_llamado?: string | null;
  fecha_inicio_atencion?: string | null;
  fecha_fin_atencion?: string | null;
  // Campos calculados o de joins
  sector_descripcion?: string;
  piso?: string;
  puesto_descripcion?: string;
  operador_nombre?: string;
  minutos_espera?: number;
  personas_antes?: number;
}

export interface Sector {
  id_sector: number;
  tenant_id: number;
  descripcion: string;
  piso: string;
  letraTicket: string;
  tiempo_estimado: number;
  pausado: boolean;
  activo: boolean;
  fecha_alta: string;
}

export interface Puesto {
  id_puesto: number;
  tenant_id: number;
  id_sector: number;
  descripcion: string;
  id_usuario_operador?: number | null;
  activo: boolean;
  fecha_alta: string;
  // Joins
  sector_descripcion?: string;
  piso?: string;
  operador_nombre?: string;
}

export interface Usuario {
  id: number;
  tenant_id: number;
  nombre: string;
  dni: string;
  email?: string | null;
  estado: boolean;
  rol_id: number;
  rol_nombre: string;
  id_puesto?: number | null;
  puesto_nombre?: string | null;
  id_sector?: number | null;
  sector_nombre?: string | null;
}

export interface ParametroApp {
  id: number;
  tenant_id: number;
  clave: string;
  valor: string;
  descripcion?: string | null;
}
