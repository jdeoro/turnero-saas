using System;
using System.Collections.Generic;
using SeguimientoGestion.Web.DAL;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.Negocio
{
    /// <summary>
    /// Logica de negocio para sectores y tramites del edificio.
    /// </summary>
    public static class Sector
    {
        /// <summary>
        /// Obtiene la lista de sectores activos habilitados para atencion y derivaciones.
        /// </summary>
        public static List<SectorDto> ObtenerActivos()
        {
            return SectorDal.GetSectoresActivos();
        }

        /// <summary>
        /// Obtiene todos los sectores (activos e inactivos) para la administracion.
        /// </summary>
        public static List<SectorDto> ObtenerTodos()
        {
            return SectorDal.GetSectoresTodos();
        }

        /// <summary>
        /// Crea o actualiza un sector validando campos requeridos y formatos.
        /// </summary>
        public static int Guardar(int idSector, string descripcion, string piso, string letraTicket, int tiempoEstimado, bool pausado = false, bool activo = true)
        {
            if (string.IsNullOrWhiteSpace(descripcion))
                throw new ArgumentException("La descripción del sector es obligatoria.");

            if (string.IsNullOrWhiteSpace(letraTicket))
                throw new ArgumentException("La letra o prefijo del ticket es obligatorio.");

            string letraLimpia = letraTicket.Trim().ToUpperInvariant();
            if (letraLimpia.Length > 2)
                letraLimpia = letraLimpia.Substring(0, 2);

            string pisoLimpio = string.IsNullOrWhiteSpace(piso) ? "Planta Baja" : piso.Trim();
            int tiempoLimpio = tiempoEstimado <= 0 ? 10 : tiempoEstimado;

            if (idSector > 0)
            {
                bool ok = SectorDal.ActualizarSector(idSector, descripcion.Trim(), pisoLimpio, letraLimpia, tiempoLimpio, pausado, activo);
                return ok ? idSector : 0;
            }
            else
            {
                return SectorDal.InsertarSector(descripcion.Trim(), pisoLimpio, letraLimpia, tiempoLimpio);
            }
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del sector.
        /// </summary>
        public static bool ToggleActivo(int idSector)
        {
            if (idSector <= 0) return false;
            return SectorDal.ToggleSectorActivo(idSector);
        }
    }
}
