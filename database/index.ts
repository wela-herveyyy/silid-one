import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

// Survive Turbopack HMR — avoid leaking extra MySQL connection pools.
const globalForDb = globalThis as unknown as { __silidMysqlPool?: mysql.Pool };

const pool =
  globalForDb.__silidMysqlPool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    supportBigNumbers: true,
    bigNumberStrings: true,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 5,
    idleTimeout: 10_000,
    queueLimit: 0,
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__silidMysqlPool = pool;
}

export const database = drizzle(pool, { schema, mode: "default" });

export async function closeDatabasePool(): Promise<void> {
  await pool.end();
  if (globalForDb.__silidMysqlPool === pool) delete globalForDb.__silidMysqlPool;
}
