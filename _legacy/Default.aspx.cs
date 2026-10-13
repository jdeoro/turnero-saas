using System;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Pantalla de inicio del sistema. Hereda de BasePage para control de sesion automatico y contexto.
    /// </summary>
    public partial class Default : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                lblDni.Text = !string.IsNullOrEmpty(UsuarioActual?.Dni) ? UsuarioActual.Dni : "-";
                lblRol.Text = !string.IsNullOrEmpty(RolActual) ? RolActual : "Operador";
            }
        }
    }
}