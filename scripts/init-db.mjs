import pg from "pg";
import { readFileSync } from "fs";

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    "SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'"
  );

  if (parseInt(rows[0].count) > 0) {
    console.log("[init-db] Tablas ya existen, sin cambios");
    await client.end();
    return;
  }

  console.log("[init-db] Creando tablas por primera vez...");
  const sql = readFileSync("scripts/init.sql", "utf8");
  await client.query(sql);
  console.log("[init-db] Tablas creadas exitosamente");
  await client.end();
}

main().catch((e) => {
  console.error("[init-db] Error:", e.message);
  process.exit(1);
});
