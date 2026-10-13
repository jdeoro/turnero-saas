using System;

namespace SeguimientoGestion.Web.DTOs
{
    /// <summary>
    /// Objeto de transferencia de datos para informacion de usuario y su rol.
    /// </summary>
    [Serializable]
    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Dni { get; set; }
        public string Email { get; set; }
        public bool Estado { get; set; }
        public int RolId { get; set; }
        public string RolNombre { get; set; }

        public int? IdPuesto { get; set; }
        public string PuestoNombre { get; set; }
        public int? IdSector { get; set; }
        public string SectorNombre { get; set; }
        public string SectorPiso { get; set; }

        public bool EsSupervisor => "Supervisor".Equals(RolNombre, StringComparison.OrdinalIgnoreCase);
        public bool EsOperador => "Operador".Equals(RolNombre, StringComparison.OrdinalIgnoreCase);
        public bool EsAdministrador => "Administrador".Equals(RolNombre, StringComparison.OrdinalIgnoreCase);
        public bool EsAdminOSupervisor => EsSupervisor || EsAdministrador;
    }
}
