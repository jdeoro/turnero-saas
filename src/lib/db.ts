import mysql from 'mysql2/promise';

// Pool global singleton para evitar fugas de conexiones en desarrollo (HMR de Next.js)
declare global {
  // eslint-disable-next-line no-var
  var __dbPool: mysql.Pool | undefined;
}

function getPool(): mysql.Pool {
  if (!global.__dbPool) {
    global.__dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'desarro2_turnosmedicos',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });
  }
  return global.__dbPool;
}

export const pool = getPool();

/**
 * Ejecuta una consulta o llamado a Stored Procedure tipado
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.query(sql, params);
  return rows as T;
}

/**
 * Ejecuta un Stored Procedure y devuelve el primer resultset
 */
export async function executeProcedure<T = any>(spName: string, params: any[] = []): Promise<T[]> {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${spName}(${placeholders})`;
  const [results]: any = await pool.query(sql, params);
  
  // mysql2 devuelve un array donde el primer elemento son las filas del SP
  if (Array.isArray(results) && results.length > 0) {
    return results[0] as T[];
  }
  return [];
}
