import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

type QueryParameter = string | number | bigint | boolean | Date | Buffer | null;

export async function executeQuery<T>(sql: string, params: QueryParameter[] = []): Promise<T> {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured.');
  }

  const port = DB_PORT ? Number(DB_PORT) : undefined;

  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
    throw new Error('DB_PORT must be a valid TCP port.');
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    const [result] = await connection.execute(sql, params);
    return result as T;
  } finally {
    await connection.end();
  }
}
