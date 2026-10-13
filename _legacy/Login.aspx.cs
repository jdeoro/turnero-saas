using System;
using System.Web;
using SeguimientoGestion.Web.DTOs;
using SeguimientoGestion.Web.Negocio;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Code Behind de la pantalla de Login.
    /// Autentica usuarios a traves de la capa de negocio Usuario.
    /// </summary>
    public partial class Login : BasePage
    {
        protected override bool RequiereAutenticacion => false;

        protected void Page_Load(object sender, EventArgs e)
        {
            // Evitar almacenamiento en cache del navegador
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetExpires(DateTime.UtcNow.AddHours(-1));
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");

            // Si ya existe sesion activa, redirigir a la pantalla principal
            if (!IsPostBack && UsuarioActual != null)
            {
                Response.Redirect("~/Default.aspx", true);
            }
        }

        protected void btnIngresar_Click(object sender, EventArgs e)
        {
            string dni = txtDni.Text.Trim();
            string clave = txtPassword.Text.Trim();

            // Validacion basica de campos requeridos
            if (string.IsNullOrEmpty(dni) || string.IsNullOrEmpty(clave))
            {
                MostrarError("Por favor, ingrese su DNI y contraseña.");
                return;
            }

            try
            {
                UsuarioDto usuario = Usuario.Autenticar(dni, clave);

                if (usuario != null)
                {
                    Session["Usuario"] = usuario;
                    Session["Usuario_Id"] = usuario.Id;
                    Session["Usuario_Nombre"] = usuario.Nombre;
                    Session["Usuario_DNI"] = usuario.Dni;
                    Session["Usuario_Rol"] = !string.IsNullOrEmpty(usuario.RolNombre) ? usuario.RolNombre : "Operador";

                    Response.Redirect("~/Default.aspx", true);
                    return;
                }

                // Si no se encontro el usuario o la clave no coincide
                MostrarError("DNI o contraseña incorrectos. Verifique sus datos e intente nuevamente.");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Error en Login: " + ex.Message);
                MostrarError("Ocurrió un error al procesar el ingreso. Intente nuevamente en unos instantes.");
            }
        }

        private void MostrarError(string mensaje)
        {
            pnlError.Visible = true;
            litError.Text = Server.HtmlEncode(mensaje);
        }
    }
}