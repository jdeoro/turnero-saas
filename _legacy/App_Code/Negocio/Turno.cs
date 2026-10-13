using System;
using System.Collections.Generic;
using SeguimientoGestion.Web.DAL;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.Negocio
{
    /// <summary>
    /// Logica de negocio para el ciclo de vida y atencion de turnos.
    /// </summary>
    public static class Turno
    {
        /// <summary>
        /// Obtiene el turno actual que esta siendo llamado o atendido en un puesto determinado.
        /// </summary>
        public static TurnoDto ObtenerActual(int idPuesto)
        {
            if (idPuesto <= 0)
            {
                return null;
            }

            return TurnoDal.GetTurnoActual(idPuesto);
        }

        /// <summary>
        /// Obtiene los turnos en espera para un sector especifico.
        /// </summary>
        public static List<TurnoDto> ObtenerEnCola(int idSector)
        {
            if (idSector <= 0)
            {
                return new List<TurnoDto>();
            }

            return TurnoDal.GetTurnoenCola(idSector);
        }

        /// <summary>
        /// Llama al proximo turno en espera segun reglas de prioridad para el puesto y operador.
        /// </summary>
        public static TurnoDto LlamarSiguiente(int idPuesto, int idUsuario, int idSector)
        {
            if (idPuesto <= 0 || idUsuario <= 0 || idSector <= 0)
            {
                return null;
            }

            return TurnoDal.GetSiguiente(idPuesto, idUsuario, idSector);
        }

        /// <summary>
        /// Registra el inicio de atencion del paciente en el box.
        /// </summary>
        public static bool IniciarAtencion(int idTurno)
        {
            if (idTurno <= 0)
            {
                return false;
            }

            return TurnoDal.UpdateInicioAtencion(idTurno);
        }

        /// <summary>
        /// Concluye la atencion del turno activo.
        /// </summary>
        public static bool Finalizar(int idTurno)
        {
            if (idTurno <= 0)
            {
                return false;
            }

            return TurnoDal.UpdateFinalizar(idTurno);
        }

        /// <summary>
        /// Registra al paciente como ausente si no concurre al llamado.
        /// </summary>
        public static bool MarcarAusente(int idTurno)
        {
            if (idTurno <= 0)
            {
                return false;
            }

            return TurnoDal.UpdateAusente(idTurno);
        }

        /// <summary>
        /// Deriva un turno a otro sector con prioridad y notas de atencion.
        /// </summary>
        public static bool Derivar(int idTurno, int idSectorDestino, bool esPrioritario, string observaciones)
        {
            if (idTurno <= 0 || idSectorDestino <= 0)
            {
                return false;
            }

            string obsLimpias = string.IsNullOrWhiteSpace(observaciones) ? null : observaciones.Trim();
            return TurnoDal.UpdateDerivar(idTurno, idSectorDestino, esPrioritario, obsLimpias);
        }

        /// <summary>
        /// Emitir un nuevo turno desde el totem de autoservicio validando los parametros minimos.
        /// </summary>
        public static TurnoDto Emitir(string dni, int idSector, bool esPrioritario = false, string observaciones = null)
        {
            if (idSector <= 0)
            {
                return null;
            }

            string dniLimpio = string.IsNullOrWhiteSpace(dni) ? null : dni.Trim();
            string obsLimpias = string.IsNullOrWhiteSpace(observaciones) ? null : observaciones.Trim();

            return TurnoDal.EmitirTurnoTotem(dniLimpio, idSector, esPrioritario, obsLimpias);
        }

        /// <summary>
        /// Registra una reiteracion de llamado para el turno activo.
        /// </summary>
        public static bool Rellamar(int idTurno)
        {
            if (idTurno <= 0)
            {
                return false;
            }

            return TurnoDal.RellamarTurno(idTurno);
        }

        /// <summary>
        /// Obtiene los turnos ausentes del dia para el sector especificado.
        /// </summary>
        public static List<TurnoDto> ObtenerAusentes(int idSector)
        {
            if (idSector <= 0)
            {
                return new List<TurnoDto>();
            }

            return TurnoDal.GetTurnosAusentes(idSector);
        }

        /// <summary>
        /// Reincorpora un turno ausente a la cola de espera activa con prioridad alta.
        /// </summary>
        public static bool ReactivarAusente(int idTurno)
        {
            if (idTurno <= 0)
            {
                return false;
            }

            return TurnoDal.ReactivarTurnoAusente(idTurno);
        }

        /// <summary>
        /// Obtiene los turnos mas recientemente llamados del dia para la carteleria digital con filtros opcionales.
        /// </summary>
        public static List<TurnoDto> ObtenerTurnosCarteleria(int limite = 6, string piso = null, int idSector = 0)
        {
            int lim = (limite <= 0) ? 6 : limite;
            string pisoLimpio = string.IsNullOrWhiteSpace(piso) ? null : piso.Trim();
            return TurnoDal.GetTurnosCarteleria(lim, pisoLimpio, idSector);
        }
    }
}
