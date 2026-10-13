using System;

namespace SeguimientoGestion.Web.DTOs
{
    /// <summary>
    /// Representa el ciclo de vida y datos de un turno de atencion.
    /// </summary>
    public class TurnoDto
    {
        public int IdTurno { get; set; }
        public string CodigoTicket { get; set; }
        public string Dni { get; set; }
        public int TitNroAfi { get; set; }
        public int IdSector { get; set; }
        public int? IdPuesto { get; set; }
        public int? IdUsuarioOperador { get; set; }
        public string Estado { get; set; }
        public bool EsPrioritario { get; set; }
        public string Observaciones { get; set; }
        public DateTime FechaEmision { get; set; }
        public DateTime? FechaLlamado { get; set; }
        public DateTime? FechaInicioAtencion { get; set; }
        public DateTime? FechaFinAtencion { get; set; }

        // Almacenar propiedades complementarias de consulta y emision
        public int MinutosEspera { get; set; }
        public string SectorDescripcion { get; set; }
        public string Piso { get; set; }
        public string PuestoDescripcion { get; set; }
        public string OperadorNombre { get; set; }
        public int PersonasAntes { get; set; }
    }
}
