import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.NEON_DB_CONNECTION_STRING) {
  throw new Error('NEON_DB_CONNECTION_STRING is not defined in environment variables');
}

const sql = neon(process.env.NEON_DB_CONNECTION_STRING);
export const db = drizzle(sql, { schema });

export type Database = typeof db; 