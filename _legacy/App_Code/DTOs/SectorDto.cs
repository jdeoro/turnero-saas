using System;

namespace SeguimientoGestion.Web.DTOs
{
    /// <summary>
    /// Representa un sector o tramite de atencion dentro del edificio.
    /// </summary>
    public class SectorDto
    {
        public int IdSector { get; set; }
        public string Descripcion { get; set; }
        public string Piso { get; set; }
        public string LetraTicket { get; set; }
        public int TiempoEstimado { get; set; }
        public bool Pausado { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaAlta { get; set; }
    }
}
