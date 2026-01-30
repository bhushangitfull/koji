import { Pool, PoolClient } from 'pg';
import env from './env';

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const getConnection = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export const disconnect = async (): Promise<void> => {
  await pool.end();
};

export default pool;
