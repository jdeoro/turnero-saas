import { executeProcedure } from '@/lib/db';
import { Turno } from '@/types';

export class TurnoRepository {
  /**
   * Emite un turno desde el Tótem de Autoservicio
   */
  static async emitirTurnoTotem(params: {
    tenantId: number;
    dni: string;
    idSector: number;
    esPrioritario: boolean;
    observaciones?: string;
  }): Promise<Turno | null> {
    const rows = await executeProcedure<Turno>('spInsertTurnoTotem', [
      params.tenantId,
      params.dni,
      params.idSector,
      params.esPrioritario ? 1 : 0,
      params.observaciones || 'Emitido desde Tótem de Autoservicio',
    ]);
    return rows[0] || null;
  }

  /**
   * Obtiene el turno actual que está siendo atendido o llamado en un box
   */
  static async getTurnoActual(tenantId: number, idPuesto: number): Promise<Turno | null> {
    const rows = await executeProcedure<Turno>('spGetTurnoActual', [tenantId, idPuesto]);
    return rows[0] || null;
  }

  /**
   * Obtiene la cola de espera de un sector
   */
  static async getColaSector(tenantId: number, idSector: number): Promise<Turno[]> {
    return await executeProcedure<Turno>('spGetTurnoenCola', [tenantId, idSector]);
  }

  /**
   * Llama al siguiente turno en cola para un box
   */
  static async llamarSiguiente(
    tenantId: number,
    idPuesto: number,
    idUsuario: number,
    idSector: number
  ): Promise<Turno | null> {
    const rows = await executeProcedure<Turno>('spGetSiguiente', [
      tenantId,
      idPuesto,
      idUsuario,
      idSector,
    ]);
    return rows[0] || null;
  }

  /**
   * Inicia la atención de un turno (comienza cronómetro)
   */
  static async iniciarAtencion(tenantId: number, idTurno: number): Promise<boolean> {
    const rows = await executeProcedure<{ filas_afectadas: number }>('spUpdateInicioAtencion', [
      tenantId,
      idTurno,
    ]);
    return (rows[0]?.filas_afectadas ?? 0) > 0;
  }

  /**
   * Finaliza la atención del turno
   */
  static async finalizarTurno(tenantId: number, idTurno: number): Promise<boolean> {
    const rows = await executeProcedure<{ filas_afectadas: number }>('spUpdateFinalizar', [
      tenantId,
      idTurno,
    ]);
    return (rows[0]?.filas_afectadas ?? 0) > 0;
  }

  /**
   * Marca el turno como ausente
   */
  static async marcarAusente(tenantId: number, idTurno: number): Promise<boolean> {
    const rows = await executeProcedure<{ filas_afectadas: number }>('spUpdateAusente', [
      tenantId,
      idTurno,
    ]);
    return (rows[0]?.filas_afectadas ?? 0) > 0;
  }

  /**
   * Deriva un turno a otro sector con prioridad
   */
  static async derivarTurno(params: {
    tenantId: number;
    idTurno: number;
    idSectorDestino: number;
    esPrioritario: boolean;
    observaciones: string;
  }): Promise<boolean> {
    const rows = await executeProcedure<{ filas_afectadas: number }>('spUpdateDerivar', [
      params.tenantId,
      params.idTurno,
      params.idSectorDestino,
      params.esPrioritario ? 1 : 0,
      params.observaciones,
    ]);
    return (rows[0]?.filas_afectadas ?? 0) > 0;
  }

  /**
   * Vuelve a llamar al turno en pantalla (rellamada)
   */
  static async rellamar(tenantId: number, idTurno: number): Promise<boolean> {
    const rows = await executeProcedure<{ filas_afectadas: number }>('spRellamarTurno', [
      tenantId,
      idTurno,
    ]);
    return (rows[0]?.filas_afectadas ?? 0) > 0;
  }

  /**
   * Obtiene los últimos turnos llamados para la pantalla de Cartelería TV
   */
  static async getTurnosCarteleria(
    tenantId: number,
    limite: number = 6,
    piso?: string,
    idSector?: number
  ): Promise<Turno[]> {
    return await executeProcedure<Turno>('spGetTurnosCarteleria', [
      tenantId,
      limite,
      piso || null,
      idSector || null,
    ]);
  }
}
