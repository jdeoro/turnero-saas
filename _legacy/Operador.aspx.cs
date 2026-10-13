using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Services;
using SeguimientoGestion.Web.DTOs;
using SeguimientoGestion.Web.Negocio;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// CodeBehind para el Panel del Operador. Expone los WebMethods para la interaccion asincrona con la interfaz.
    /// </summary>
    public partial class Operador : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // El control de autenticacion se ejecuta en BasePage.OnInit
        }

        /// <summary>
        /// Obtiene el identificador del usuario autenticado en la sesion actual.
        /// </summary>
        private static int ObtenerUsuarioIdSesion()
        {
            var context = HttpContext.Current;
            if (context == null || context.Session == null) return 0;

            var usuario = context.Session["Usuario"] as UsuarioDto;
            if (usuario != null && usuario.Id > 0) return usuario.Id;

            if (context.Session["Usuario_Id"] != null)
            {
                int id;
                if (int.TryParse(context.Session["Usuario_Id"].ToString(), out id))
                    return id;
            }

            return 0;
        }

        /// <summary>
        /// Obtiene los datos del puesto y sector asignados al operador logueado.
        /// </summary>
        [WebMethod]
        public static PuestoDto ObtenerBoxOperador()
        {
            int idUsuario = ObtenerUsuarioIdSesion();
            if (idUsuario <= 0) return null;
            return Puesto.ObtenerBoxOperador(idUsuario);
        }

        /// <summary>
        /// Obtiene el turno actual que esta en atencion o llamado en el puesto del operador.
        /// </summary>
        [WebMethod]
        public static TurnoDto ObtenerActual(int idPuesto)
        {
            if (idPuesto <= 0)
            {
                int idUsuario = ObtenerUsuarioIdSesion();
                var box = Puesto.ObtenerBoxOperador(idUsuario);
                if (box == null) return null;
                idPuesto = box.IdPuesto;
            }
            return Turno.ObtenerActual(idPuesto);
        }

        /// <summary>
        /// Obtiene la lista de turnos en espera para el sector correspondiente.
        /// </summary>
        [WebMethod]
        public static List<TurnoDto> ObtenerEnCola(int idSector)
        {
            if (idSector <= 0)
            {
                int idUsuario = ObtenerUsuarioIdSesion();
                var box = Puesto.ObtenerBoxOperador(idUsuario);
                if (box == null) return new List<TurnoDto>();
                idSector = box.IdSector;
            }
            return Turno.ObtenerEnCola(idSector);
        }

        /// <summary>
        /// Llama al proximo turno con mayor prioridad para el puesto y operador actual.
        /// </summary>
        [WebMethod]
        public static TurnoDto LlamarSiguiente(int idPuesto, int idSector)
        {
            int idUsuario = ObtenerUsuarioIdSesion();
            if (idUsuario <= 0) return null;

            if (idPuesto <= 0 || idSector <= 0)
            {
                var box = Puesto.ObtenerBoxOperador(idUsuario);
                if (box == null) return null;
                idPuesto = box.IdPuesto;
                idSector = box.IdSector;
            }
            return Turno.LlamarSiguiente(idPuesto, idUsuario, idSector);
        }

        /// <summary>
        /// Inicia la atencion del turno activo y habilita el computo de tiempo.
        /// </summary>
        [WebMethod]
        public static bool IniciarAtencion(int idTurno)
        {
            if (idTurno <= 0) return false;
            return Turno.IniciarAtencion(idTurno);
        }

        /// <summary>
        /// Finaliza la atencion del turno activo.
        /// </summary>
        [WebMethod]
        public static bool Finalizar(int idTurno)
        {
            if (idTurno <= 0) return false;
            return Turno.Finalizar(idTurno);
        }

        /// <summary>
        /// Registra la inasistencia del paciente al llamado.
        /// </summary>
        [WebMethod]
        public static bool MarcarAusente(int idTurno)
        {
            if (idTurno <= 0) return false;
            return Turno.MarcarAusente(idTurno);
        }

        /// <summary>
        /// Deriva el turno activo hacia otro sector de atencion.
        /// </summary>
        [WebMethod]
        public static bool Derivar(int idTurno, int idSectorDestino, bool esPrioritario, string observaciones)
        {
            if (idTurno <= 0 || idSectorDestino <= 0) return false;
            return Turno.Derivar(idTurno, idSectorDestino, esPrioritario, observaciones);
        }

        /// <summary>
        /// Registra una reiteracion de llamado para el turno activo.
        /// </summary>
        [WebMethod]
        public static bool Rellamar(int idTurno)
        {
            if (idTurno <= 0) return false;
            return Turno.Rellamar(idTurno);
        }

        /// <summary>
        /// Obtiene los turnos marcados como ausentes para el sector.
        /// </summary>
        [WebMethod]
        public static List<TurnoDto> ObtenerAusentes(int idSector)
        {
            if (idSector <= 0)
            {
                int idUsuario = ObtenerUsuarioIdSesion();
                var box = Puesto.ObtenerBoxOperador(idUsuario);
                if (box == null) return new List<TurnoDto>();
                idSector = box.IdSector;
            }
            return Turno.ObtenerAusentes(idSector);
        }

        /// <summary>
        /// Reincorpora un turno ausente a la cola de espera activa con prioridad alta.
        /// </summary>
        [WebMethod]
        public static bool ReactivarAusente(int idTurno)
        {
            if (idTurno <= 0) return false;
            return Turno.ReactivarAusente(idTurno);
        }

        /// <summary>
        /// Obtiene la nomina de sectores activos para el formulario de derivacion.
        /// </summary>
        [WebMethod]
        public static List<SectorDto> ObtenerSectores()
        {
            return Sector.ObtenerActivos();
        }
    }
}
