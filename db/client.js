// db/client.js
import pg from "pg";
import { Client } from "pg";

// 🔥 Convertir float8 (double precision) a número real
pg.types.setTypeParser(701, parseFloat); // 701 = OID de float8

export const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function initDB() {
  await client.connect();
  console.log("PostgreSQL connectat (2.0)");
}
