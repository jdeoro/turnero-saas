using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.DAL
{
    /// <summary>
    /// Acceso a datos para sectores y tramites de atencion mediante Stored Procedures.
    /// </summary>
    public static class SectorDal
    {
        /// <summary>
        /// Devuelve la lista de todos los sectores activos para derivaciones.
        /// </summary>
        public static List<SectorDto> GetSectoresActivos()
        {
            var lista = new List<SectorDto>();

            DatabaseHelper.ExecuteProcedureReader("spGetSectoresActivos", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearSector(reader));
                }
            });

            return lista;
        }

        /// <summary>
        /// Devuelve todos los sectores registrados (activos e inactivos) para administracion.
        /// </summary>
        public static List<SectorDto> GetSectoresTodos()
        {
            var lista = new List<SectorDto>();

            DatabaseHelper.ExecuteProcedureReader("spGetSectoresAdmin", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearSector(reader));
                }
            });

            return lista;
        }

        /// <summary>
        /// Inserta un nuevo sector en la base de datos y retorna su ID generado.
        /// </summary>
        public static int InsertarSector(string descripcion, string piso, string letraTicket, int tiempoEstimado)
        {
            var pDesc = new MySqlParameter("p_descripcion", MySqlDbType.VarChar, 100) { Value = descripcion };
            var pPiso = new MySqlParameter("p_piso", MySqlDbType.VarChar, 30) { Value = piso };
            var pLetra = new MySqlParameter("p_letra_ticket", MySqlDbType.VarChar, 2) { Value = letraTicket };
            var pTiempo = new MySqlParameter("p_tiempo_estimado", MySqlDbType.Int32) { Value = tiempoEstimado };

            object res = DatabaseHelper.ExecuteProcedureScalar("spInsertSector", pDesc, pPiso, pLetra, pTiempo);
            return res != null ? Convert.ToInt32(res) : 0;
        }

        /// <summary>
        /// Actualiza los datos de un sector existente.
        /// </summary>
        public static bool ActualizarSector(int idSector, string descripcion, string piso, string letraTicket, int tiempoEstimado, bool pausado, bool activo)
        {
            var pId = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };
            var pDesc = new MySqlParameter("p_descripcion", MySqlDbType.VarChar, 100) { Value = descripcion };
            var pPiso = new MySqlParameter("p_piso", MySqlDbType.VarChar, 30) { Value = piso };
            var pLetra = new MySqlParameter("p_letra_ticket", MySqlDbType.VarChar, 2) { Value = letraTicket };
            var pTiempo = new MySqlParameter("p_tiempo_estimado", MySqlDbType.Int32) { Value = tiempoEstimado };
            var pPausado = new MySqlParameter("p_pausado", MySqlDbType.Byte) { Value = pausado ? 1 : 0 };
            var pActivo = new MySqlParameter("p_activo", MySqlDbType.Byte) { Value = activo ? 1 : 0 };

            int filas = DatabaseHelper.ExecuteProcedureNonQuery("spUpdateSector", pId, pDesc, pPiso, pLetra, pTiempo, pPausado, pActivo);
            return filas >= 0;
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del sector.
        /// </summary>
        public static bool ToggleSectorActivo(int idSector)
        {
            var pId = new MySqlParameter("p_id_sector", MySqlDbType.Int32) { Value = idSector };
            object res = DatabaseHelper.ExecuteProcedureScalar("spToggleSectorActivo", pId);
            return res != null && Convert.ToBoolean(res);
        }

        /// <summary>
        /// Mapea dinamicamente un registro de IDataRecord a una instancia de SectorDto.
        /// </summary>
        private static SectorDto MapearSector(IDataRecord record)
        {
            var dto = new SectorDto();

            for (int i = 0; i < record.FieldCount; i++)
            {
                if (record.IsDBNull(i)) continue;

                string col = record.GetName(i);
                switch (col.ToLowerInvariant())
                {
                    case "id_sector":
                        dto.IdSector = Convert.ToInt32(record[i]);
                        break;
                    case "descripcion":
                        dto.Descripcion = record[i].ToString();
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
                    case "pausado":
                        dto.Pausado = Convert.ToBoolean(record[i]);
                        break;
                    case "activo":
                        dto.Activo = Convert.ToBoolean(record[i]);
                        break;
                    case "fecha_alta":
                        dto.FechaAlta = Convert.ToDateTime(record[i]);
                        break;
                }
            }

            return dto;
        }
    }
}
