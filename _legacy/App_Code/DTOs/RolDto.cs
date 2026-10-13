using System;

namespace SeguimientoGestion.Web.DTOs
{
    /// <summary>
    /// Objeto de transferencia de datos para informacion de rol.
    /// </summary>
    [Serializable]
    public class RolDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
    }
}
