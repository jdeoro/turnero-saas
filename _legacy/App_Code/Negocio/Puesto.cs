using System;
using SeguimientoGestion.Web.DAL;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.Negocio
{
    /// <summary>
    /// Logica de negocio para la gestion y asignacion de puestos de atencion.
    /// </summary>
    public static class Puesto
    {
        /// <summary>
        /// Obtiene la configuracion del box asignado al operador validando su identificador.
        /// </summary>
        public static PuestoDto ObtenerBoxOperador(int idUsuario)
        {
            if (idUsuario <= 0)
            {
                return null;
            }

            return PuestoDal.GetBoxOperador(idUsuario);
        }

        /// <summary>
        /// Obtiene todos los puestos de atencion para administracion.
        /// </summary>
        public static System.Collections.Generic.List<PuestoDto> ObtenerTodos()
        {
            return PuestoDal.GetPuestosTodos();
        }

        /// <summary>
        /// Crea o actualiza un puesto de atencion con validacion de negocio.
        /// </summary>
        public static int Guardar(int idPuesto, string descripcion, int idSector, int? idUsuarioOperador, bool activo = true)
        {
            if (string.IsNullOrWhiteSpace(descripcion))
                throw new ArgumentException("La identificación o nombre del puesto es obligatorio.");

            if (idSector <= 0)
                throw new ArgumentException("Debe seleccionar un sector válido para el puesto.");

            int? opId = (idUsuarioOperador.HasValue && idUsuarioOperador.Value > 0) ? idUsuarioOperador : null;

            if (idPuesto > 0)
            {
                bool ok = PuestoDal.ActualizarPuesto(idPuesto, descripcion.Trim(), idSector, opId, activo);
                return ok ? idPuesto : 0;
            }
            else
            {
                return PuestoDal.InsertarPuesto(descripcion.Trim(), idSector, opId);
            }
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del puesto.
        /// </summary>
        public static bool ToggleActivo(int idPuesto)
        {
            if (idPuesto <= 0) return false;
            return PuestoDal.TogglePuestoActivo(idPuesto);
        }
    }
}
