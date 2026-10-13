using System;
using System.Collections.Generic;
using System.Web.Services;
using SeguimientoGestion.Web.DTOs;
using SeguimientoGestion.Web.Negocio;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Code Behind para la terminal de autoservicio (Totem).
    /// Permitir la emision de turnos espontaneos y el check-in de citas.
    /// </summary>
    public partial class Totem : BasePage
    {
        // Indicar que la terminal de autoservicio no requiere inicio de sesion de operador
        protected override bool RequiereAutenticacion => false;

        protected void Page_Load(object sender, EventArgs e)
        {
            // Configurar cabeceras de respuesta para terminal de autoservicio
            Response.Cache.SetNoStore();
            Response.Cache.SetNoServerCaching();
        }

        /// <summary>
        /// Obtener la lista de sectores activos habilitados para la seleccion en el totem.
        /// </summary>
        [WebMethod]
        public static List<SectorDto> ObtenerSectores()
        {
            try
            {
                // Consultar sectores activos desde la capa de negocio
                return Sector.ObtenerActivos() ?? new List<SectorDto>();
            }
            catch (Exception ex)
            {
                // Registrar excepcion y retornar lista vacia para evitar caidas en el cliente
                System.Diagnostics.Trace.TraceError("Error al obtener sectores en Totem: " + ex.Message);
                return new List<SectorDto>();
            }
        }

        /// <summary>
        /// Emitir un nuevo turno espontaneo para el sector seleccionado.
        /// </summary>
        [WebMethod]
        public static TurnoDto EmitirTurno(string dni, int idSector, bool esPrioritario)
        {
            try
            {
                // Validar parametros minimos requeridos
                if (idSector <= 0)
                {
                    return null;
                }

                // Invocar la emision en la capa de negocio
                return Turno.Emitir(dni, idSector, esPrioritario, "Emitido desde Totem de Autoservicio");
            }
            catch (Exception ex)
            {
                // Registrar excepcion de emision
                System.Diagnostics.Trace.TraceError("Error al emitir turno en Totem: " + ex.Message);
                throw new Exception("No fue posible emitir el turno en este momento: " + ex.Message);
            }
        }

        /// <summary>
        /// Consultar cita programada para el DNI o emitir pase a Mesa de Entrada.
        /// </summary>
        [WebMethod]
        public static TurnoDto ConsultarTurnoProgramado(string dni)
        {
            try
            {
                // Derivar provisoriamente a Mesa de Entrada (Sector 1) segun especificacion funcional CU-02
                return Turno.Emitir(dni, 1, false, "Check-in de turno programado / Mesa de Entrada");
            }
            catch (Exception ex)
            {
                // Registrar excepcion en check-in
                System.Diagnostics.Trace.TraceError("Error al consultar turno programado en Totem: " + ex.Message);
                throw new Exception("Error al procesar la cita programada: " + ex.Message);
            }
        }
    }
}
