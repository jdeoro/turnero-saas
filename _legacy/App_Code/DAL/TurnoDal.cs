using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.DAL
{
    /// <summary>
    /// Acceso a datos para el ciclo de vida y gestión de turnos mediante Stored Procedures.
    /// </summary>
    public static class TurnoDal
    {
        /// <summary>
        /// Devuelve el turno que se está atendiendo o llamando en el box (o null).
        /// </summary>
        public static TurnoDto GetTurnoActual(int idPuesto)
        {
            TurnoDto turno = null;
            var pIdPuesto = new MySqlParameter("p_id_puesto", MySqlDbType.Int32) { Value = idPuesto };

            DatabaseHelper.ExecuteProcedureReader("spGetTurnoActual", reader =>
            {
                if (reader.Read())
                {
                    turno = MapearTurno(reader);
                }
            }, pIdPuesto);

            return turno;
        }

        /// <summary>
        /// Devuelve la lista de espera ordenada por prioridad y llegada con sus minutos de espera.
        /// </summary>
        public static List<TurnoDto> GetTurnoenCola(int idSector)
        {
            var lista = new List<TurnoDto>();
            var pIdSector = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };

            DatabaseHelper.ExecuteProcedureReader("spGetTurnoenCola", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearTurno(reader));
                }
            }, pIdSector);

            return lista;
        }

        /// <summary>
        /// Llama al próximo turno prioritario, lo pasa a LLAMADO y lo devuelve (o null si no hay nadie).
        /// </summary>
        public static TurnoDto GetSiguiente(int idPuesto, int idUsuario, int idSector)
        {
            TurnoDto turno = null;
            var pIdPuesto = new MySqlParameter("p_id_puesto", MySqlDbType.Int32) { Value = idPuesto };
            var pIdUsuario = new MySqlParameter("p_id_usuario", MySqlDbType.Int32) { Value = idUsuario };
            var pIdSector = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };

            DatabaseHelper.ExecuteProcedureReader("spGetSiguiente", reader =>
            {
                if (reader.Read())
                {
                    turno = MapearTurno(reader);
                }
            }, pIdPuesto, pIdUsuario, pIdSector);

            return turno;
        }

        /// <summary>
        /// Pasa el turno a EN_ATENCION e inicia la marca de tiempo del cronómetro.
        /// </summary>
        public static bool UpdateInicioAtencion(int idTurno)
        {
            var pIdTurno = new MySqlParameter("p_id_turno", MySqlDbType.Int32) { Value = idTurno };
            object resultado = DatabaseHelper.ExecuteProcedureScalar("spUpdateInicioAtencion", pIdTurno);
            return resultado != null && Convert.ToInt32(resultado) > 0;
        }

        /// <summary>
        /// Concluye la atención y pasa el turno a FINALIZADO.
        /// </summary>
        public static bool UpdateFinalizar(int idTurno)
        {
            var pIdTurno = new MySqlParameter("p_id_turno", MySqlDbType.Int32) { Value = idTurno };
            object resultado = DatabaseHelper.ExecuteProcedureScalar("spUpdateFinalizar", pIdTurno);
            return resultado != null && Convert.ToInt32(resultado) > 0;
        }

        /// <summary>
        /// Marca el turno como AUSENTE si la persona no concurrió al llamado.
        /// </summary>
        public static bool UpdateAusente(int idTurno)
        {
            var pIdTurno = new MySqlParameter("p_id_turno", MySqlDbType.Int32) { Value = idTurno };
            object resultado = DatabaseHelper.ExecuteProcedureScalar("spUpdateAusente", pIdTurno);
            return resultado != null && Convert.ToInt32(resultado) > 0;
        }

        /// <summary>
        /// Deriva el turno al nuevo sector con notas internas y prioridad alta.
        /// </summary>
        public static bool UpdateDerivar(int idTurno, int idSectorDestino, bool esPrioritario, string observaciones)
        {
            var pIdTurno = new MySqlParameter("p_id_turno", MySqlDbType.Int32) { Value = idTurno };
            var pIdSectorDestino = new MySqlParameter("p_id_sector_destino", MySqlDbType.Int32) { Value = idSectorDestino };
            var pEsPrioritario = new MySqlParameter("p_es_prioritario", MySqlDbType.Byte) { Value = esPrioritario ? 1 : 0 };
            var pObservaciones = new MySqlParameter("p_observaciones", MySqlDbType.VarChar, 500) { Value = (object)observaciones ?? DBNull.Value };

            object resultado = DatabaseHelper.ExecuteProcedureScalar("spUpdateDerivar", pIdTurno, pIdSectorDestino, pEsPrioritario, pObservaciones);
            return resultado != null && Convert.ToInt32(resultado) > 0;
        }

        /// <summary>
        /// Insertar un nuevo turno desde el totem de autoservicio y retornar el ticket emitido.
        /// </summary>
        public static TurnoDto EmitirTurnoTotem(string dni, int idSector, bool esPrioritario, string observaciones)
        {
            TurnoDto turno = null;
            var pDni = new MySqlParameter("p_dni", MySqlDbType.VarChar, 20) { Value = (object)dni ?? DBNull.Value };
            var pIdSector = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };
            var pEsPrioritario = new MySqlParameter("p_es_prioritario", MySqlDbType.Byte) { Value = esPrioritario ? 1 : 0 };
            var pObservaciones = new MySqlParameter("p_observaciones", MySqlDbType.VarChar, 500) { Value = (object)observaciones ?? DBNull.Value };

            DatabaseHelper.ExecuteProcedureReader("spInsertTurnoTotem", reader =>
            {
                if (reader.Read())
                {
                    turno = MapearTurno(reader);
                }
            }, pDni, pIdSector, pEsPrioritario, pObservaciones);

            return turno;
        }

        /// <summary>
        /// Registra una reiteracion de llamado para el turno actual y actualiza su estampa de tiempo.
        /// </summary>
        public static bool RellamarTurno(int idTurno)
        {
            var pIdTurno = new MySqlParameter("p_id_turno", MySqlDbType.Int32) { Value = idTurno };
            object resultado = DatabaseHelper.ExecuteProcedureScalar("spRellamarTurno", pIdTurno);
            return resultado != null && Convert.ToInt32(resultado) > 0;
        }

        /// <summary>
        /// Obtiene los turnos marcados como ausentes durante el dia para el sector indicado.
        /// </summary>
        public static List<TurnoDto> GetTurnosAusentes(int idSector)
        {
            var lista = new List<TurnoDto>();
            var pIdSector = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };

            DatabaseHelper.ExecuteProcedureReader("spGetTurnosAusentes", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearTurno(reader));
                }
            }, pIdSector);

            return lista;
        }

        /// <summary>
        /// Reincorpora un turno ausente a la cola de espera activa con prioridad alta.
        /// </summary>
        public static bool ReactivarTurnoAusente(int idTurno)
        {
            var pIdTurno = new MySqlParameter("p_id_turno", MySqlDbType.Int32) { Value = idTurno };
            object resultado = DatabaseHelper.ExecuteProcedureScalar("spReactivarTurnoAusente", pIdTurno);
            return resultado != null && Convert.ToInt32(resultado) > 0;
        }

        /// <summary>
        /// Obtener los ultimos turnos llamados o en atencion del dia para la carteleria digital con filtros opcionales de piso y sector.
        /// </summary>
        public static List<TurnoDto> GetTurnosCarteleria(int limite = 6, string piso = null, int idSector = 0)
        {
            var lista = new List<TurnoDto>();
            var pLimite = new MySqlParameter("p_limite", MySqlDbType.Int32) { Value = limite };
            var pPiso = new MySqlParameter("p_piso", MySqlDbType.VarChar, 50) { Value = string.IsNullOrEmpty(piso) ? (object)DBNull.Value : piso };
            var pIdSector = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector > 0 ? (object)idSector : DBNull.Value };

            DatabaseHelper.ExecuteProcedureReader("spGetTurnosCarteleria", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearTurno(reader));
                }
            }, pLimite, pPiso, pIdSector);

            return lista;
        }

        /// <summary>
        /// Mapear dinamicamente un registro de IDataRecord a una instancia de TurnoDto.
        /// </summary>
        private static TurnoDto MapearTurno(IDataRecord record)
        {
            var dto = new TurnoDto();

            for (int i = 0; i < record.FieldCount; i++)
            {
                if (record.IsDBNull(i)) continue;

                string col = record.GetName(i);
                switch (col.ToLowerInvariant())
                {
                    case "id_turno":
                        dto.IdTurno = Convert.ToInt32(record[i]);
                        break;
                    case "codigoticket":
                        dto.CodigoTicket = record[i].ToString();
                        break;
                    case "dni":
                        dto.Dni = record[i].ToString();
                        break;
                    case "titnroafi":
                        dto.TitNroAfi = Convert.ToInt32(record[i]);
                        break;
                    case "id_sector":
                        dto.IdSector = Convert.ToInt32(record[i]);
                        break;
                    case "id_puesto":
                        dto.IdPuesto = Convert.ToInt32(record[i]);
                        break;
                    case "id_usuario_operador":
                        dto.IdUsuarioOperador = Convert.ToInt32(record[i]);
                        break;
                    case "estado":
                        dto.Estado = record[i].ToString();
                        break;
                    case "es_prioritario":
                        dto.EsPrioritario = Convert.ToBoolean(record[i]);
                        break;
                    case "observaciones":
                        dto.Observaciones = record[i].ToString();
                        break;
                    case "fecha_emision":
                        dto.FechaEmision = Convert.ToDateTime(record[i]);
                        break;
                    case "fecha_llamado":
                        dto.FechaLlamado = Convert.ToDateTime(record[i]);
                        break;
                    case "fecha_inicio_atencion":
                        dto.FechaInicioAtencion = Convert.ToDateTime(record[i]);
                        break;
                    case "fecha_fin_atencion":
                        dto.FechaFinAtencion = Convert.ToDateTime(record[i]);
                        break;
                    case "minutos_espera":
                        dto.MinutosEspera = Convert.ToInt32(record[i]);
                        break;
                    case "sector_descripcion":
                        dto.SectorDescripcion = record[i].ToString();
                        break;
                    case "puesto_descripcion":
                        dto.PuestoDescripcion = record[i].ToString();
                        break;
                    case "operador_nombre":
                        dto.OperadorNombre = record[i].ToString();
                        break;
                    case "personas_antes":
                        dto.PersonasAntes = Convert.ToInt32(record[i]);
                        break;
                    case "piso":
                        dto.Piso = record[i].ToString();
                        break;
                }
            }

            return dto;
        }
    }
}
