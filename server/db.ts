import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to connect to the Supabase database");
}

const configuredPoolSize = Number.parseInt(process.env.PG_POOL_MAX ?? "1", 10);
const poolMax = Number.isFinite(configuredPoolSize) && configuredPoolSize > 0
  ? configuredPoolSize
  : 1;

// One client per warm serverless instance; Supabase's transaction pooler
// shares those clients across the database's backend connections.
const pool = new Pool({
  connectionString,
  max: poolMax,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (error) => {
  // Never log connection strings or other environment values.
  const errorCode = "code" in error ? String(error.code) : error.name;
  console.error("Unexpected idle database client error:", errorCode);
});

const db = drizzle(pool, { schema });

export { pool, db };
