using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.DAL
{
    /// <summary>
    /// Acceso a datos para puestos de atencion y boxes mediante Stored Procedures.
    /// </summary>
    public static class PuestoDal
    {
        /// <summary>
        /// Devuelve los datos del puesto y sector asignados al operador logueado.
        /// </summary>
        public static PuestoDto GetBoxOperador(int idUsuario)
        {
            PuestoDto puesto = null;
            var pIdUsuario = new MySqlParameter("p_id_usuario", MySqlDbType.Int32) { Value = idUsuario };

            DatabaseHelper.ExecuteProcedureReader("spGetBoxOperador", reader =>
            {
                if (reader.Read())
                {
                    puesto = MapearPuesto(reader);
                }
            }, pIdUsuario);

            return puesto;
        }

        /// <summary>
        /// Devuelve todos los puestos de atencion registrados con datos de sector y operador.
        /// </summary>
        public static List<PuestoDto> GetPuestosTodos()
        {
            var lista = new List<PuestoDto>();

            DatabaseHelper.ExecuteProcedureReader("spGetPuestosAdmin", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearPuesto(reader));
                }
            });

            return lista;
        }

        /// <summary>
        /// Inserta un nuevo puesto de atencion y devuelve el identificador generado.
        /// </summary>
        public static int InsertarPuesto(string descripcion, int idSector, int? idUsuarioOperador)
        {
            var pDesc = new MySqlParameter("p_descripcion", MySqlDbType.VarChar, 50) { Value = descripcion };
            var pSec = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };
            var pOp = new MySqlParameter("p_id_usuario_operador", MySqlDbType.Int32) { Value = idUsuarioOperador.HasValue && idUsuarioOperador.Value > 0 ? (object)idUsuarioOperador.Value : DBNull.Value };

            object res = DatabaseHelper.ExecuteProcedureScalar("spInsertPuesto", pDesc, pSec, pOp);
            return res != null ? Convert.ToInt32(res) : 0;
        }

        /// <summary>
        /// Actualiza los datos y asignaciones de un puesto de atencion.
        /// </summary>
        public static bool ActualizarPuesto(int idPuesto, string descripcion, int idSector, int? idUsuarioOperador, bool activo)
        {
            var pId = new MySqlParameter("p_id_puesto", MySqlDbType.Int32) { Value = idPuesto };
            var pDesc = new MySqlParameter("p_descripcion", MySqlDbType.VarChar, 50) { Value = descripcion };
            var pSec = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };
            var pOp = new MySqlParameter("p_id_usuario_operador", MySqlDbType.Int32) { Value = idUsuarioOperador.HasValue && idUsuarioOperador.Value > 0 ? (object)idUsuarioOperador.Value : DBNull.Value };
            var pActivo = new MySqlParameter("p_activo", MySqlDbType.Byte) { Value = activo ? 1 : 0 };

            int filas = DatabaseHelper.ExecuteProcedureNonQuery("spUpdatePuesto", pId, pDesc, pSec, pOp, pActivo);
            return filas >= 0;
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del puesto.
        /// </summary>
        public static bool TogglePuestoActivo(int idPuesto)
        {
            var pId = new MySqlParameter("p_id_puesto", MySqlDbType.Int32) { Value = idPuesto };
            object res = DatabaseHelper.ExecuteProcedureScalar("spTogglePuestoActivo", pId);
            return res != null && Convert.ToBoolean(res);
        }

        /// <summary>
        /// Mapea dinamicamente un registro de IDataRecord a una instancia de PuestoDto.
        /// </summary>
        private static PuestoDto MapearPuesto(IDataRecord record)
        {
            var dto = new PuestoDto();

            for (int i = 0; i < record.FieldCount; i++)
            {
                if (record.IsDBNull(i)) continue;

                string col = record.GetName(i);
                switch (col.ToLowerInvariant())
                {
                    case "id_puesto":
                        dto.IdPuesto = Convert.ToInt32(record[i]);
                        break;
                    case "puesto":
                    case "descripcion":
                        dto.Descripcion = record[i].ToString();
                        break;
                    case "id_sector":
                        dto.IdSector = Convert.ToInt32(record[i]);
                        break;
                    case "sector":
                    case "sector_descripcion":
                    case "sectordescripcion":
                        dto.SectorDescripcion = record[i].ToString();
                        break;
                    case "piso":
                        dto.Piso = record[i].ToString();
                        break;
                    case "letraticket":
                        dto.LetraTicket = record[i].ToString();
                        break;
                    case "tiempo_estimado":
                    case "tiempoestimado":
                        dto.TiempoEstimado = Convert.ToInt32(record[i]);
                        break;
                    case "id_usuario_operador":
                        dto.IdUsuarioOperador = Convert.ToInt32(record[i]);
                        break;
                    case "activo":
                        dto.Activo = Convert.ToBoolean(record[i]);
                        break;
                    case "fecha_alta":
                        dto.FechaAlta = Convert.ToDateTime(record[i]);
                        break;
                    case "operador_nombre":
                        dto.OperadorNombre = record[i].ToString();
                        break;
                }
            }

            return dto;
        }
    }
}
