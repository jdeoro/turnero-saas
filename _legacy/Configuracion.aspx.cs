using System;
using System.Collections.Generic;
using System.Web.Services;
using SeguimientoGestion.Web.DTOs;
using SeguimientoGestion.Web.Negocio;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Modulo de administracion y configuracion de sectores, puestos y usuarios.
    /// Exclusivo para perfiles con privilegios de Administrador o Supervisor.
    /// </summary>
    public partial class Configuracion : BasePage
    {
        protected override bool RequiereAutenticacion => true;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Control estricto de autorizacion: solo Supervisor o Administrador
                if (UsuarioActual == null || !UsuarioActual.EsAdminOSupervisor)
                {
                    Response.Redirect("~/Default.aspx", true);
                    return;
                }
            }
        }

        /// <summary>
        /// Obtiene en una sola llamada los catalogos completos para alimentar las 3 pestañas de administracion.
        /// </summary>
        [WebMethod]
        public static object ObtenerDatosIniciales()
        {
            try
            {
                var sectores = Sector.ObtenerTodos() ?? new List<SectorDto>();
                var puestos = Puesto.ObtenerTodos() ?? new List<PuestoDto>();
                var usuarios = Usuario.ObtenerTodos() ?? new List<UsuarioDto>();
                var roles = Usuario.ObtenerRoles() ?? new List<RolDto>();

                return new
                {
                    ok = true,
                    sectores = sectores,
                    puestos = puestos,
                    usuarios = usuarios,
                    roles = roles
                };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = "Error al cargar datos: " + ex.Message };
            }
        }

        /// <summary>
        /// Guarda (crea o actualiza) un sector de atencion.
        /// </summary>
        [WebMethod]
        public static object GuardarSector(int idSector, string descripcion, string piso, string letraTicket, int tiempoEstimado, bool pausado, bool activo)
        {
            try
            {
                int id = Sector.Guardar(idSector, descripcion, piso, letraTicket, tiempoEstimado, pausado, activo);
                return new { ok = id > 0, id = id, mensaje = id > 0 ? "Sector guardado correctamente." : "No se pudo guardar el sector." };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = ex.Message };
            }
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del sector.
        /// </summary>
        [WebMethod]
        public static object ToggleSector(int idSector)
        {
            try
            {
                bool nuevoEstado = Sector.ToggleActivo(idSector);
                return new { ok = true, activo = nuevoEstado, mensaje = "Estado del sector actualizado." };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = ex.Message };
            }
        }

        /// <summary>
        /// Guarda (crea o actualiza) un puesto o box de atencion.
        /// </summary>
        [WebMethod]
        public static object GuardarPuesto(int idPuesto, string descripcion, int idSector, int? idUsuarioOperador, bool activo)
        {
            try
            {
                int id = Puesto.Guardar(idPuesto, descripcion, idSector, idUsuarioOperador, activo);
                return new { ok = id > 0, id = id, mensaje = id > 0 ? "Puesto guardado correctamente." : "No se pudo guardar el puesto." };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = ex.Message };
            }
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del puesto.
        /// </summary>
        [WebMethod]
        public static object TogglePuesto(int idPuesto)
        {
            try
            {
                bool nuevoEstado = Puesto.ToggleActivo(idPuesto);
                return new { ok = true, activo = nuevoEstado, mensaje = "Estado del puesto actualizado." };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = ex.Message };
            }
        }

        /// <summary>
        /// Guarda (crea o actualiza) un usuario y su rol en el sistema.
        /// </summary>
        [WebMethod]
        public static object GuardarUsuario(int idUsuario, string nombre, string dni, string clave, string email, int rolId, bool estado)
        {
            try
            {
                int id = Usuario.Guardar(idUsuario, nombre, dni, clave, email, rolId, estado);
                return new { ok = id > 0, id = id, mensaje = id > 0 ? "Usuario guardado correctamente." : "No se pudo guardar el usuario." };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = ex.Message };
            }
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del usuario.
        /// </summary>
        [WebMethod]
        public static object ToggleUsuario(int idUsuario)
        {
            try
            {
                bool nuevoEstado = Usuario.ToggleActivo(idUsuario);
                return new { ok = true, estado = nuevoEstado, mensaje = "Estado del usuario actualizado." };
            }
            catch (Exception ex)
            {
                return new { ok = false, mensaje = ex.Message };
            }
        }
    }
}
