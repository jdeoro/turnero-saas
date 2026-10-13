using System;
using System.Data;
using System.Web;

namespace SeguimientoGestion.Web
{
    /// <summary>
    /// Gestión centralizada de parámetros institucionales (color, logo, título)
    /// leídos dinámicamente de la tabla cfg_parametros en MySQL.
    /// </summary>
    public class ConfiguracionApp
    {
        private const string CacheKey = "cfg_parametros_cache";

        public string ColorId { get; set; } = "#334155";
        public string LogoApp { get; set; } = "~/img/logo.png";
        public string TituloApp { get; set; } = "Gestión Turnos";
        public string Zocalo { get; set; } = "Bienvenido a nuestra sede central • Por favor permanezca atento a la pantalla y conserve su ticket impreso • Se ruega respetar el orden de llamado";
        public bool ZocaloVisible { get; set; } = true;
        public int ZocaloRefrescoMinutos { get; set; } = 10;
        public string CarteleriaTema { get; set; } = "oscuro";

        /// <summary>
        /// Obtiene la configuración activa del sistema con caché breve (30 segundos).
        /// </summary>
        public static ConfiguracionApp ObtenerConfiguracion(bool forzarRecarga = false)
        {
            if (!forzarRecarga && HttpRuntime.Cache != null && HttpRuntime.Cache[CacheKey] is ConfiguracionApp cached)
            {
                return cached;
            }

            ConfiguracionApp config = new ConfiguracionApp();
            try
            {
                App_Code.MysqlCon con = new App_Code.MysqlCon();
                DataTable dt = con.Select("SELECT clave, valor FROM cfg_parametros;");
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        string clave = row["clave"] != DBNull.Value ? row["clave"].ToString().Trim() : string.Empty;
                        string valor = row["valor"] != DBNull.Value ? row["valor"].ToString().Trim() : string.Empty;

                        if (string.Equals(clave, "colorId", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(valor))
                        {
                            config.ColorId = valor;
                        }
                        else if (string.Equals(clave, "logoApp", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(valor))
                        {
                            config.LogoApp = valor;
                        }
                        else if (string.Equals(clave, "tituloApp", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(valor))
                        {
                            config.TituloApp = valor;
                        }
                        else if (string.Equals(clave, "zocalo", StringComparison.OrdinalIgnoreCase))
                        {
                            config.Zocalo = valor;
                        }
                        else if (string.Equals(clave, "zocaloVisible", StringComparison.OrdinalIgnoreCase))
                        {
                            config.ZocaloVisible = valor == "1" || valor.Equals("true", StringComparison.OrdinalIgnoreCase);
                        }
                        else if (string.Equals(clave, "zocaloRefrescoMinutos", StringComparison.OrdinalIgnoreCase))
                        {
                            if (int.TryParse(valor, out int min) && min > 0)
                            {
                                config.ZocaloRefrescoMinutos = min;
                            }
                        }
                        else if (string.Equals(clave, "carteleriaTema", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(valor))
                        {
                            config.CarteleriaTema = valor.ToLowerInvariant();
                        }
                    }
                }

                if (HttpRuntime.Cache != null)
                {
                    HttpRuntime.Cache.Insert(CacheKey, config, null, DateTime.Now.AddSeconds(30), System.Web.Caching.Cache.NoSlidingExpiration);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("Error al cargar configuracion de cfg_parametros: " + ex.Message);
            }

            return config;
        }
    }
}
