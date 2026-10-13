using System;
using System.Configuration;
using System.Data;
using MySql.Data.MySqlClient;

namespace SeguimientoGestion.Web.App_Code
{
    /// <summary>
    /// Clase para la gestión de conexiones y operaciones contra base de datos MySQL.
    /// Implementa buenas prácticas de liberación de recursos (IDisposable / using).
    /// </summary>
    public class MysqlCon
    {
        private readonly string _connectionString;

        public MysqlCon()
        {
            // Lectura prioritaria de la cadena directa configurada en Web.config
            string connStr = ConfigurationManager.AppSettings["PsicoFisicoPruebas"];

            if (string.IsNullOrWhiteSpace(connStr))
            {
                string host = ConfigurationManager.AppSettings["MySqlHost"] ?? "172.16.10.2";
                string port = ConfigurationManager.AppSettings["MySqlPort"] ?? "33306";
                string user = ConfigurationManager.AppSettings["MySqlUser"] ?? "root";
                string pass = ConfigurationManager.AppSettings["MySqlPass"] ?? "prueba";
                string db = ConfigurationManager.AppSettings["MySqlDB"] ?? "db_queue_manager";

                connStr = string.Format("Persist Security Info=False;Allow Zero Datetime=True;database={0};server={1};port={2};user id={3};pwd={4};pooling=false;CharSet=utf8mb4;",
                    db, host, port, user, pass);
            }

            _connectionString = connStr;
        }

        public MysqlCon(string connectionString)
        {
            _connectionString = connectionString;
        }

        /// <summary>
        /// Obtiene una nueva conexión a MySQL.
        /// </summary>
        public MySqlConnection GetConnection()
        {
            return new MySqlConnection(_connectionString);
        }

        /// <summary>
        /// Ejecuta una consulta SELECT y retorna un DataTable con los resultados.
        /// </summary>
        public DataTable Select(string sqlQuery)
        {
            DataTable dt = new DataTable();
            using (MySqlConnection conn = GetConnection())
            {
                using (MySqlCommand cmd = new MySqlCommand(sqlQuery, conn))
                {
                    using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }
            return dt;
        }

        /// <summary>
        /// Ejecuta un Stored Procedure y retorna un DataTable con los resultados.
        /// </summary>
        public DataTable SelectProcedure(string spName, params MySqlParameter[] parameters)
        {
            DataTable dt = new DataTable();
            using (MySqlConnection conn = GetConnection())
            {
                using (MySqlCommand cmd = new MySqlCommand(spName, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    if (parameters != null && parameters.Length > 0)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }

                    using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                    {
                        adapter.Fill(dt);
                    }
                }
            }
            return dt;
        }

        /// <summary>
        /// Ejecuta un comando SQL (INSERT, UPDATE, DELETE) y retorna la cantidad de filas afectadas.
        /// </summary>
        public int Execute(string sqlQuery)
        {
            using (MySqlConnection conn = GetConnection())
            {
                conn.Open();
                using (MySqlCommand cmd = new MySqlCommand(sqlQuery, conn))
                {
                    return cmd.ExecuteNonQuery();
                }
            }
        }

        /// <summary>
        /// Ejecuta un Stored Procedure de acción y retorna la cantidad de filas afectadas.
        /// </summary>
        public int ExecuteProcedure(string spName, params MySqlParameter[] parameters)
        {
            using (MySqlConnection conn = GetConnection())
            {
                conn.Open();
                using (MySqlCommand cmd = new MySqlCommand(spName, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    if (parameters != null && parameters.Length > 0)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }
                    return cmd.ExecuteNonQuery();
                }
            }
        }

        /// <summary>
        /// Ejecuta una consulta escalar y retorna el primer valor de la primera fila.
        /// </summary>
        public object ExecuteScalar(string sqlQuery)
        {
            using (MySqlConnection conn = GetConnection())
            {
                conn.Open();
                using (MySqlCommand cmd = new MySqlCommand(sqlQuery, conn))
                {
                    return cmd.ExecuteScalar();
                }
            }
        }

        /// <summary>
        /// Verifica la conectividad con la base de datos.
        /// </summary>
        public bool TestConnection()
        {
            try
            {
                using (MySqlConnection conn = GetConnection())
                {
                    conn.Open();
                    return conn.State == ConnectionState.Open;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}