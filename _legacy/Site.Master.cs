using System;
using System.IO;

namespace SeguimientoGestion.Web
{
    public partial class SiteMaster : System.Web.UI.MasterPage
    {
        public string CurrentUserName { get; private set; } = "Usuario";
        public string CurrentUserRole { get; private set; } = "Operador";
        public string Initials { get; private set; } = "US";
        public bool EsSupervisor { get; private set; } = false;
        public string LogoApp { get; private set; } = "~/img/logo.png";
        public string TituloApp { get; private set; } = "Gestión Turnos";
        public string ColorInstitucional { get; private set; } = "#334155";

        protected void Page_Init(object sender, EventArgs e)
        {
            // Lectura de parámetros institucionales (color, logo, título)
            ConfiguracionApp config = ConfiguracionApp.ObtenerConfiguracion();
            LogoApp = config.LogoApp;
            TituloApp = config.TituloApp;
            ColorInstitucional = !string.IsNullOrWhiteSpace(config.ColorId) ? config.ColorId.Trim() : "#334155";
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            // Verificación de sesión centralizada
            if (Session["Usuario_Id"] == null)
            {
                Response.Redirect("~/Login.aspx", true);
                return;
            }

            if (Session["Usuario_Nombre"] != null)
            {
                CurrentUserName = Session["Usuario_Nombre"].ToString();
                string[] parts = CurrentUserName.Split(' ');
                if (parts.Length >= 2 && parts[0].Length > 0 && parts[1].Length > 0)
                {
                    Initials = (parts[0][0].ToString() + parts[1][0].ToString()).ToUpper();
                }
                else if (CurrentUserName.Length >= 2)
                {
                    Initials = CurrentUserName.Substring(0, 2).ToUpper();
                }
            }

            if (Session["Usuario_Rol"] != null)
            {
                CurrentUserRole = Session["Usuario_Rol"].ToString();
            }

            EsSupervisor = string.Equals(CurrentUserRole, "Supervisor", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(CurrentUserRole, "Administrador", StringComparison.OrdinalIgnoreCase);
        }

        protected string IsActive(string pageName)
        {
            string currentPage = Path.GetFileName(Request.PhysicalPath);
            return string.Equals(currentPage, pageName, StringComparison.OrdinalIgnoreCase) ? "active" : "";
        }

        protected void lnkLogout_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("~/Login.aspx", true);
        }
    }
}