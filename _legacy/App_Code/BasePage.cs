using System;
using System.Web.UI;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Pagina base para WebForms del sistema. Centraliza control de sesion, tema institucional y contexto del usuario.
    /// </summary>
    public class BasePage : Page
    {
        /// <summary>
        /// Determina si la pagina requiere que el usuario este autenticado para acceder.
        /// Las paginas publicas como Login deben sobreescribir esta propiedad retornando false.
        /// </summary>
        protected virtual bool RequiereAutenticacion => true;

        /// <summary>
        /// Obtiene el usuario actualmente autenticado almacenado en sesion.
        /// </summary>
        public UsuarioDto UsuarioActual => Session["Usuario"] as UsuarioDto;

        /// <summary>
        /// Obtiene el identificador del usuario autenticado o 0 si no existe sesion.
        /// </summary>
        public int UsuarioId => UsuarioActual?.Id ?? 0;

        /// <summary>
        /// Obtiene el rol del usuario autenticado o cadena vacia.
        /// </summary>
        public string RolActual => UsuarioActual?.RolNombre ?? string.Empty;

        /// <summary>
        /// Obtiene el color institucional activo desde la configuracion parametrizada.
        /// </summary>
        public string ColorInstitucional => ConfiguracionApp.ObtenerConfiguracion().ColorId;

        /// <summary>
        /// Obtiene el titulo de la aplicacion configurado.
        /// </summary>
        public string TituloApp => ConfiguracionApp.ObtenerConfiguracion().TituloApp;

        /// <summary>
        /// Obtiene la ruta del logo de la aplicacion configurado.
        /// </summary>
        public string LogoApp => ConfiguracionApp.ObtenerConfiguracion().LogoApp;

        /// <summary>
        /// Obtiene el texto del zocalo informativo de la sala de espera.
        /// </summary>
        public string Zocalo => ConfiguracionApp.ObtenerConfiguracion().Zocalo;

        /// <summary>
        /// Determina si el zocalo inferior debe mostrarse en la pantalla de sala de espera.
        /// </summary>
        public bool ZocaloVisible => ConfiguracionApp.ObtenerConfiguracion().ZocaloVisible;

        /// <summary>
        /// Obtiene el intervalo en minutos para consultar cambios en el zocalo.
        /// </summary>
        public int ZocaloRefrescoMinutos => ConfiguracionApp.ObtenerConfiguracion().ZocaloRefrescoMinutos;

        /// <summary>
        /// Obtiene el tema visual predeterminado para la carteleria TV (oscuro / claro).
        /// </summary>
        public string CarteleriaTema => ConfiguracionApp.ObtenerConfiguracion().CarteleriaTema;

        /// <summary>
        /// Control de autenticacion en el ciclo de inicializacion de la pagina.
        /// </summary>
        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);

            if (RequiereAutenticacion && UsuarioActual == null)
            {
                Response.Redirect("~/Login.aspx", true);
            }
        }

        /// <summary>
        /// Finaliza la sesion actual del usuario y redirige a la pantalla de acceso.
        /// </summary>
        public void CerrarSesion()
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("~/Login.aspx", true);
        }
    }
}
