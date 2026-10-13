import { TurnoRepository } from '@/repositories/turnoRepository';
import { SectorRepository } from '@/repositories/sectorRepository';
import { Turno, Sector } from '@/types';

export class TurnoService {
  /**
   * Emite un turno desde el tótem validando reglas de negocio
   */
  static async emitirTurno(params: {
    tenantId: number;
    dni: string;
    idSector: number;
    esPrioritario?: boolean;
    observaciones?: string;
  }): Promise<Turno> {
    const dniLimpio = params.dni ? params.dni.replace(/\D/g, '').trim() : '';
    if (!params.idSector || params.idSector <= 0) {
      throw new Error('Sector no válido');
    }

    const turno = await TurnoRepository.emitirTurnoTotem({
      tenantId: params.tenantId,
      dni: dniLimpio,
      idSector: params.idSector,
      esPrioritario: !!params.esPrioritario,
      observaciones: params.observaciones?.trim() || 'Emitido desde Tótem de Autoservicio',
    });

    if (!turno) {
      throw new Error('No se pudo emitir el turno');
    }

    return turno;
  }

  /**
   * Obtiene los sectores activos habilitados para emisión
   */
  static async getSectoresDisponibles(tenantId: number): Promise<Sector[]> {
    const sectores = await SectorRepository.getActivos(tenantId);
    // Filtrar sectores no pausados
    return sectores.filter((s) => !s.pausado && s.activo);
  }

  /**
   * Llama al siguiente paciente o visitante en cola
   */
  static async llamarSiguiente(params: {
    tenantId: number;
    idPuesto: number;
    idUsuario: number;
    idSector: number;
  }): Promise<Turno | null> {
    if (!params.idPuesto || !params.idSector) {
      throw new Error('Puesto y Sector son obligatorios');
    }
    return await TurnoRepository.llamarSiguiente(
      params.tenantId,
      params.idPuesto,
      params.idUsuario,
      params.idSector
    );
  }

  /**
   * Inicia la atención
   */
  static async iniciarAtencion(tenantId: number, idTurno: number): Promise<boolean> {
    if (!idTurno || idTurno <= 0) throw new Error('ID de turno inválido');
    return await TurnoRepository.iniciarAtencion(tenantId, idTurno);
  }

  /**
   * Finaliza la atención
   */
  static async finalizarTurno(tenantId: number, idTurno: number): Promise<boolean> {
    if (!idTurno || idTurno <= 0) throw new Error('ID de turno inválido');
    return await TurnoRepository.finalizarTurno(tenantId, idTurno);
  }

  /**
   * Marca ausencia
   */
  static async marcarAusente(tenantId: number, idTurno: number): Promise<boolean> {
    if (!idTurno || idTurno <= 0) throw new Error('ID de turno inválido');
    return await TurnoRepository.marcarAusente(tenantId, idTurno);
  }

  /**
   * Deriva a otro sector
   */
  static async derivarTurno(params: {
    tenantId: number;
    idTurno: number;
    idSectorDestino: number;
    esPrioritario?: boolean;
    observaciones: string;
  }): Promise<boolean> {
    if (!params.idTurno || !params.idSectorDestino) {
      throw new Error('Datos de derivación incompletos');
    }
    return await TurnoRepository.derivarTurno({
      tenantId: params.tenantId,
      idTurno: params.idTurno,
      idSectorDestino: params.idSectorDestino,
      esPrioritario: params.esPrioritario ?? true, // por defecto derivado va con alta prioridad
      observaciones: params.observaciones.trim(),
    });
  }

  /**
   * Rellama el turno a pantalla
   */
  static async rellamar(tenantId: number, idTurno: number): Promise<boolean> {
    return await TurnoRepository.rellamar(tenantId, idTurno);
  }

  /**
   * Obtiene la cola de espera de un sector
   */
  static async getCola(tenantId: number, idSector: number): Promise<Turno[]> {
    return await TurnoRepository.getColaSector(tenantId, idSector);
  }

  /**
   * Obtiene el turno actual del box
   */
  static async getActual(tenantId: number, idPuesto: number): Promise<Turno | null> {
    return await TurnoRepository.getTurnoActual(tenantId, idPuesto);
  }

  /**
   * Obtiene llamados para Cartelería TV
   */
  static async getCarteleria(
    tenantId: number,
    limite: number = 6,
    piso?: string,
    idSector?: number
  ): Promise<Turno[]> {
    return await TurnoRepository.getTurnosCarteleria(tenantId, limite, piso, idSector);
  }
}
