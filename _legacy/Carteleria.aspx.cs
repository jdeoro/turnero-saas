using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Services;
using SeguimientoGestion.Web.DTOs;
using SeguimientoGestion.Web.Negocio;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Permite la visualizacion publica de los turnos convocados no se necesita iniciar sesion.
    /// </summary>
    public partial class Carteleria : BasePage
    {
        // Indicar que la pantalla de carteleria de sala no requiere credenciales de operador
        protected override bool RequiereAutenticacion => false;

        public string PisoFiltro { get; set; } = string.Empty;
        public int SectorFiltro { get; set; } = 0;
        public string SubtituloSala { get; set; } = "Sala de Espera y Orientación al Público";
        public string TemaUrl { get; set; } = string.Empty;
        public string TemaInicial { get; set; } = "oscuro";
        public string ClaseTema => string.Equals(TemaInicial, "claro", StringComparison.OrdinalIgnoreCase) ? "tv-theme-light" : string.Empty;

        protected void Page_Load(object sender, EventArgs e)
        {
            // Desactiva cache para monitoreo continuo
            Response.Cache.SetNoStore();
            Response.Cache.SetNoServerCaching();

            if (!IsPostBack)
            {
                PisoFiltro = Request.QueryString["piso"] != null ? Request.QueryString["piso"].Trim() : string.Empty;
                if (!string.IsNullOrEmpty(Request.QueryString["sector"]))
                {
                    int sec;
                    if (int.TryParse(Request.QueryString["sector"], out sec))
                    {
                        SectorFiltro = sec;
                    }
                }

                if (!string.IsNullOrEmpty(PisoFiltro))
                {
                    SubtituloSala = $"Sala de Espera • {PisoFiltro}";
                }
                else if (SectorFiltro > 0)
                {
                    var sectores = Sector.ObtenerActivos();
                    var sec = sectores != null ? sectores.FirstOrDefault(s => s.IdSector == SectorFiltro) : null;
                    if (sec != null)
                    {
                        SubtituloSala = $"Sala de Espera • {sec.Descripcion}";
                    }
                    else
                    {
                        SubtituloSala = "Sala de Espera por Sector";
                    }
                }
                else
                {
                    SubtituloSala = "Sala de Espera y Orientación al Público";
                }

                // Evaluar parametro de tema por URL (?tema=claro o ?tema=oscuro)
                string temaParam = Request.QueryString["tema"] != null ? Request.QueryString["tema"].Trim().ToLowerInvariant() : string.Empty;
                if (temaParam == "claro" || temaParam == "oscuro")
                {
                    TemaUrl = temaParam;
                    TemaInicial = temaParam;
                }
                else
                {
                    TemaInicial = CarteleriaTema;
                }
            }
        }

        /// <summary>
        /// Obtener los turnos/llamados mas recientes del dia para el panel principal y el historial con filtros opcionales.
        /// </summary>
        [WebMethod]
        public static List<TurnoDto> ObtenerLlamadosCarteleria(string piso = null, int idSector = 0)
        {
            try
            {
                return Turno.ObtenerTurnosCarteleria(6, piso, idSector) ?? new List<TurnoDto>();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Error al obtener llamados para carteleria: " + ex.Message);
                return new List<TurnoDto>();
            }
        }

        /// <summary>
        /// Obtener la lista de sectores activos para alimentar el selector de salas en pantalla.
        /// </summary>
        [WebMethod]
        public static List<SectorDto> ObtenerSectoresSalas()
        {
            try
            {
                return Sector.ObtenerActivos() ?? new List<SectorDto>();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Error al obtener sectores para salas: " + ex.Message);
                return new List<SectorDto>();
            }
        }

        /// <summary>
        /// Obtener los parametros dinamicos de configuracion del zocalo (texto, visibilidad y refresco).
        /// </summary>
        [WebMethod]
        public static object ObtenerConfiguracionZocalo()
        {
            try
            {
                var cfg = ConfiguracionApp.ObtenerConfiguracion();
                return new
                {
                    zocalo = cfg.Zocalo,
                    visible = cfg.ZocaloVisible,
                    refrescoMinutos = cfg.ZocaloRefrescoMinutos,
                    tema = cfg.CarteleriaTema
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Error al obtener configuracion de zocalo: " + ex.Message);
                return new
                {
                    zocalo = string.Empty,
                    visible = false,
                    refrescoMinutos = 10,
                    tema = "oscuro"
                };
            }
        }
    }
}
