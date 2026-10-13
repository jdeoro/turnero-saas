using System;
using System.Data;
using MySql.Data.MySqlClient;
using SeguimientoGestion.Web.DTOs;

namespace SeguimientoGestion.Web.DAL
{
    /// <summary>
    /// Acceso a datos para operaciones de usuarios mediante Stored Procedures.
    /// </summary>
    public static class UsuarioDal
    {
        /// <summary>
        /// Valida credenciales contra el Stored Procedure sp_usuario_autenticar y devuelve el DTO del usuario autenticado.
        /// </summary>
        public static UsuarioDto Autenticar(string dni, string clave)
        {
            UsuarioDto usuario = null;

            var pDni = new MySqlParameter("p_dni", MySqlDbType.VarChar, 20) { Value = dni };
            var pClave = new MySqlParameter("p_clave", MySqlDbType.VarChar, 50) { Value = clave };

            DatabaseHelper.ExecuteProcedureReader("sp_usuario_autenticar", reader =>
            {
                if (reader.Read())
                {
                    usuario = MapearUsuario(reader);
                }
            }, pDni, pClave);

            return usuario;
        }

        /// <summary>
        /// Obtiene los datos del usuario por su identificador unico mediante sp_usuario_obtener_por_id.
        /// </summary>
        public static UsuarioDto ObtenerPorId(int id)
        {
            UsuarioDto usuario = null;

            var pId = new MySqlParameter("p_id", MySqlDbType.Int32) { Value = id };

            DatabaseHelper.ExecuteProcedureReader("sp_usuario_obtener_por_id", reader =>
            {
                if (reader.Read())
                {
                    usuario = MapearUsuario(reader);
                }
            }, pId);

            return usuario;
        }

        /// <summary>
        /// Devuelve todos los usuarios del sistema para administracion.
        /// </summary>
        public static System.Collections.Generic.List<UsuarioDto> GetUsuariosTodos()
        {
            var lista = new System.Collections.Generic.List<UsuarioDto>();

            DatabaseHelper.ExecuteProcedureReader("spGetUsuariosAdmin", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(MapearUsuario(reader));
                }
            });

            return lista;
        }

        /// <summary>
        /// Devuelve la lista de roles del sistema.
        /// </summary>
        public static System.Collections.Generic.List<RolDto> GetRoles()
        {
            var lista = new System.Collections.Generic.List<RolDto>();

            DatabaseHelper.ExecuteProcedureReader("spGetRoles", reader =>
            {
                while (reader.Read())
                {
                    lista.Add(new RolDto
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        Nombre = reader["nombre"] != DBNull.Value ? reader["nombre"].ToString() : string.Empty,
                        Descripcion = reader["descripcion"] != DBNull.Value ? reader["descripcion"].ToString() : string.Empty
                    });
                }
            });

            return lista;
        }

        /// <summary>
        /// Inserta un nuevo usuario y su asignacion de rol.
        /// </summary>
        public static int InsertarUsuario(string nombre, string dni, string clave, string email, int rolId)
        {
            var pNom = new MySqlParameter("p_nombre", MySqlDbType.VarChar, 100) { Value = nombre };
            var pDni = new MySqlParameter("p_dni", MySqlDbType.VarChar, 20) { Value = dni };
            var pCla = new MySqlParameter("p_clave", MySqlDbType.VarChar, 50) { Value = clave };
            var pMail = new MySqlParameter("p_email", MySqlDbType.VarChar, 100) { Value = string.IsNullOrWhiteSpace(email) ? (object)DBNull.Value : email.Trim() };
            var pRol = new MySqlParameter("p_rol_id", MySqlDbType.Int32) { Value = rolId };

            object res = DatabaseHelper.ExecuteProcedureScalar("spInsertUsuario", pNom, pDni, pCla, pMail, pRol);
            return res != null ? Convert.ToInt32(res) : 0;
        }

        /// <summary>
        /// Actualiza los datos de un usuario existente. Si p_clave es nulo o vacio, se conserva la clave actual.
        /// </summary>
        public static bool ActualizarUsuario(int idUsuario, string nombre, string dni, string clave, string email, int rolId, bool estado)
        {
            var pId = new MySqlParameter("p_id_usuario", MySqlDbType.Int32) { Value = idUsuario };
            var pNom = new MySqlParameter("p_nombre", MySqlDbType.VarChar, 100) { Value = nombre };
            var pDni = new MySqlParameter("p_dni", MySqlDbType.VarChar, 20) { Value = dni };
            var pCla = new MySqlParameter("p_clave", MySqlDbType.VarChar, 50) { Value = string.IsNullOrWhiteSpace(clave) ? (object)DBNull.Value : clave.Trim() };
            var pMail = new MySqlParameter("p_email", MySqlDbType.VarChar, 100) { Value = string.IsNullOrWhiteSpace(email) ? (object)DBNull.Value : email.Trim() };
            var pRol = new MySqlParameter("p_rol_id", MySqlDbType.Int32) { Value = rolId };
            var pEst = new MySqlParameter("p_estado", MySqlDbType.Byte) { Value = estado ? 1 : 0 };

            int filas = DatabaseHelper.ExecuteProcedureNonQuery("spUpdateUsuario", pId, pNom, pDni, pCla, pMail, pRol, pEst);
            return filas >= 0;
        }

        /// <summary>
        /// Alterna el estado activo/inactivo (baja logica) del usuario.
        /// </summary>
        public static bool ToggleUsuarioActivo(int idUsuario)
        {
            var pId = new MySqlParameter("p_id_usuario", MySqlDbType.Int32) { Value = idUsuario };
            object res = DatabaseHelper.ExecuteProcedureScalar("spToggleUsuarioActivo", pId);
            return res != null && Convert.ToBoolean(res);
        }

        /// <summary>
        /// Mapea un registro del MySqlDataReader a una instancia de UsuarioDto.
        /// </summary>
        private static UsuarioDto MapearUsuario(IDataRecord record)
        {
            var dto = new UsuarioDto
            {
                Id = Convert.ToInt32(record["id"]),
                Nombre = record["nombre"] != DBNull.Value ? record["nombre"].ToString() : string.Empty,
                Dni = record["dni"] != DBNull.Value ? record["dni"].ToString() : string.Empty,
                Email = record["email"] != DBNull.Value ? record["email"].ToString() : string.Empty,
                Estado = record["estado"] != DBNull.Value && Convert.ToBoolean(record["estado"]),
                RolId = record["rol_id"] != DBNull.Value ? Convert.ToInt32(record["rol_id"]) : 0,
                RolNombre = record["rol_nombre"] != DBNull.Value ? record["rol_nombre"].ToString() : string.Empty
            };

            if (TieneColumna(record, "puesto_nombre") && record["puesto_nombre"] != DBNull.Value)
            {
                dto.PuestoNombre = record["puesto_nombre"].ToString();
            }
            if (TieneColumna(record, "id_puesto") && record["id_puesto"] != DBNull.Value)
            {
                dto.IdPuesto = Convert.ToInt32(record["id_puesto"]);
            }
            if (TieneColumna(record, "sector_nombre") && record["sector_nombre"] != DBNull.Value)
            {
                dto.SectorNombre = record["sector_nombre"].ToString();
            }
            if (TieneColumna(record, "id_sector") && record["id_sector"] != DBNull.Value)
            {
                dto.IdSector = Convert.ToInt32(record["id_sector"]);
            }
            if (TieneColumna(record, "sector_piso") && record["sector_piso"] != DBNull.Value)
            {
                dto.SectorPiso = record["sector_piso"].ToString();
            }

            return dto;
        }

        private static bool TieneColumna(IDataRecord dr, string columnName)
        {
            for (int i = 0; i < dr.FieldCount; i++)
            {
                if (dr.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}
