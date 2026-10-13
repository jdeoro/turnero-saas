using System;
using SeguimientoGestion.Web.DAL;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.Negocio
{
    /// <summary>
    /// Logica de negocio para operaciones y validaciones de usuario.
    /// </summary>
    public static class Usuario
    {
        /// <summary>
        /// Realiza la autenticacion de un usuario aplicando validaciones previas de formato y estado activo.
        /// </summary>
        public static UsuarioDto Autenticar(string dni, string clave)
        {
            if (string.IsNullOrWhiteSpace(dni))
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(clave))
            {
                return null;
            }

            var usuario = UsuarioDal.Autenticar(dni.Trim(), clave.Trim());

            if (usuario == null || !usuario.Estado)
            {
                return null;
            }

            return usuario;
        }

        /// <summary>
        /// Obtiene un usuario por su identificador unico.
        /// </summary>
        public static UsuarioDto ObtenerPorId(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            return UsuarioDal.ObtenerPorId(id);
        }

        /// <summary>
        /// Obtiene todos los usuarios registrados para administracion.
        /// </summary>
        public static System.Collections.Generic.List<UsuarioDto> ObtenerTodos()
        {
            return UsuarioDal.GetUsuariosTodos();
        }

        /// <summary>
        /// Obtiene todos los roles disponibles en el sistema.
        /// </summary>
        public static System.Collections.Generic.List<RolDto> ObtenerRoles()
        {
            return UsuarioDal.GetRoles();
        }

        /// <summary>
        /// Crea o actualiza un usuario con validaciones de campos requeridos.
        /// </summary>
        public static int Guardar(int idUsuario, string nombre, string dni, string clave, string email, int rolId, bool estado = true)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre y apellido del usuario es obligatorio.");

            if (string.IsNullOrWhiteSpace(dni))
                throw new ArgumentException("El número de documento (DNI) es obligatorio.");

            if (rolId <= 0)
                throw new ArgumentException("Debe seleccionar un rol válido para el usuario.");

            string nombreLimpio = nombre.Trim();
            string dniLimpio = dni.Trim().Replace(".", "").Replace(" ", "");
            string emailLimpio = string.IsNullOrWhiteSpace(email) ? null : email.Trim();

            if (idUsuario > 0)
            {
                bool ok = UsuarioDal.ActualizarUsuario(idUsuario, nombreLimpio, dniLimpio, clave, emailLimpio, rolId, estado);
                return ok ? idUsuario : 0;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(clave))
                    throw new ArgumentException("La contraseña es obligatoria para nuevos usuarios.");

                return UsuarioDal.InsertarUsuario(nombreLimpio, dniLimpio, clave.Trim(), emailLimpio, rolId);
            }
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del usuario.
        /// </summary>
        public static bool ToggleActivo(int idUsuario)
        {
            if (idUsuario <= 0) return false;
            return UsuarioDal.ToggleUsuarioActivo(idUsuario);
        }
    }
}
