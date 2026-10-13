using System;

namespace SeguimientoGestion.Web.DTOs
{
    /// <summary>
    /// Representa un puesto fisico de atencion (Box, Ventanilla, Consultorio) y su estado de asignacion.
    /// </summary>
    public class PuestoDto
    {
        public int IdPuesto { get; set; }
        public int IdSector { get; set; }
        public string Descripcion { get; set; }
        public int? IdUsuarioOperador { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaAlta { get; set; }

        // Propiedades de contexto del Sector (procedentes de joins)
        public string SectorDescripcion { get; set; }
        public string Piso { get; set; }
        public string LetraTicket { get; set; }
        public int TiempoEstimado { get; set; }

        // Propiedades de contexto del Operador
        public string OperadorNombre { get; set; }
    }
}
