using System;
using System.Configuration;
using System.Data;
using MySql.Data.MySqlClient;

namespace SeguimientoGestion.Web.DAL
{
    /// <summary>
    /// Proveedor de operaciones de acceso a datos para MySQL con soporte de Stored Procedures y transacciones.
    /// </summary>
    public static class DatabaseHelper
    {
        private static readonly string CadenaConexion =
            ConfigurationManager.ConnectionStrings["mysqlcnx"]?.ConnectionString
            ?? ConfigurationManager.AppSettings["mysqlcnx"]
            ?? ConfigurationManager.AppSettings["PsicoFisicoPruebas"];

        /// <summary>
        /// Crea una nueva conexion a la base de datos sin abrir.
        /// </summary>
        public static MySqlConnection CreateConnection()
        {
            if (string.IsNullOrWhiteSpace(CadenaConexion))
            {
                throw new InvalidOperationException("La cadena de conexion a la base de datos no esta configurada en Web.config.");
            }
            return new MySqlConnection(CadenaConexion);
        }

        /// <summary>
        /// Ejecuta un Stored Procedure y devuelve los resultados en un DataTable.
        /// </summary>
        public static DataTable ExecuteProcedureDataTable(string spName, params MySqlParameter[] parameters)
        {
            using (var connection = CreateConnection())
            using (var command = new MySqlCommand(spName, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                if (parameters != null && parameters.Length > 0)
                {
                    command.Parameters.AddRange(parameters);
                }

                using (var adapter = new MySqlDataAdapter(command))
                {
                    var dataTable = new DataTable();
                    connection.Open();
                    adapter.Fill(dataTable);
                    return dataTable;
                }
            }
        }

        /// <summary>
        /// Ejecuta un Stored Procedure y procesa el MySqlDataReader mediante una accion delegate.
        /// </summary>
        public static void ExecuteProcedureReader(string spName, Action<MySqlDataReader> readerAction, params MySqlParameter[] parameters)
        {
            if (readerAction == null) throw new ArgumentNullException(nameof(readerAction));

            using (var connection = CreateConnection())
            using (var command = new MySqlCommand(spName, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                if (parameters != null && parameters.Length > 0)
                {
                    command.Parameters.AddRange(parameters);
                }

                connection.Open();
                using (var reader = command.ExecuteReader())
                {
                    readerAction(reader);
                }
            }
        }

        /// <summary>
        /// Ejecuta un Stored Procedure de modificacion de datos (INSERT, UPDATE, DELETE) y devuelve filas afectadas.
        /// </summary>
        public static int ExecuteProcedureNonQuery(string spName, params MySqlParameter[] parameters)
        {
            using (var connection = CreateConnection())
            using (var command = new MySqlCommand(spName, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                if (parameters != null && parameters.Length > 0)
                {
                    command.Parameters.AddRange(parameters);
                }

                connection.Open();
                return command.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Ejecuta un Stored Procedure dentro de una transaccion activa existente.
        /// </summary>
        public static int ExecuteProcedureNonQuery(MySqlConnection connection, MySqlTransaction transaction, string spName, params MySqlParameter[] parameters)
        {
            if (connection == null) throw new ArgumentNullException(nameof(connection));
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));

            using (var command = new MySqlCommand(spName, connection, transaction))
            {
                command.CommandType = CommandType.StoredProcedure;
                if (parameters != null && parameters.Length > 0)
                {
                    command.Parameters.AddRange(parameters);
                }

                return command.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Ejecuta un Stored Procedure y devuelve un unico valor escalar.
        /// </summary>
        public static object ExecuteProcedureScalar(string spName, params MySqlParameter[] parameters)
        {
            using (var connection = CreateConnection())
            using (var command = new MySqlCommand(spName, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                if (parameters != null && parameters.Length > 0)
                {
                    command.Parameters.AddRange(parameters);
                }

                connection.Open();
                return command.ExecuteScalar();
            }
        }
    }
}
