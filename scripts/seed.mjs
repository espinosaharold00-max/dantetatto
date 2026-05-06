import pg from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows: admin } = await client.query(
    "SELECT id FROM users WHERE email = $1",
    ["admin@dantetattoo.com"]
  );
  if (admin.length === 0) {
    const hash = await bcrypt.hash("admin123456", 12);
    await client.query(
      'INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
      [randomUUID(), "Dante Admin", "admin@dantetattoo.com", hash, "ADMIN"]
    );
    console.log("[seed] Admin creado: admin@dantetattoo.com / admin123456");
  } else {
    console.log("[seed] Admin ya existe");
  }

  for (let day = 0; day < 7; day++) {
    const { rows } = await client.query(
      'SELECT id FROM schedule_config WHERE "dayOfWeek" = $1',
      [day]
    );
    if (rows.length === 0) {
      await client.query(
        'INSERT INTO schedule_config (id, "dayOfWeek", "startTime", "endTime", "slotDuration", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
        [randomUUID(), day, "10:00", "19:00", 60, day !== 0]
      );
    }
  }
  console.log("[seed] Horario configurado");

  const products = [
    { name: "Crema Hidratante para Tatuajes", slug: "crema-hidratante-tatuajes", desc: "Crema especializada para tatuajes.", price: 35000, cat: "cremas", stock: 50 },
    { name: "Jabon Antibacterial Suave", slug: "jabon-antibacterial-suave", desc: "Jabon neutro antibacterial.", price: 18000, cat: "jabones", stock: 80 },
    { name: "Pelicula Protectora", slug: "pelicula-protectora-transparente", desc: "Pelicula transpirable de segunda piel.", price: 25000, cat: "protectores", stock: 40 },
    { name: "Kit Completo de Cuidado", slug: "kit-completo-cuidado", desc: "Kit completo con crema, jabon y pelicula.", price: 65000, cat: "kits", stock: 25 },
  ];

  for (const p of products) {
    const { rows } = await client.query(
      "SELECT id FROM products WHERE slug = $1",
      [p.slug]
    );
    if (rows.length === 0) {
      await client.query(
        'INSERT INTO products (id, name, slug, description, price, category, stock, images, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, ARRAY[]::text[], true, NOW(), NOW())',
        [randomUUID(), p.name, p.slug, p.desc, p.price, p.cat, p.stock]
      );
    }
  }
  console.log("[seed] Productos verificados");

  const { rows: post } = await client.query(
    "SELECT id FROM posts WHERE slug = $1",
    ["cuidados-basicos-tatuaje-nuevo"]
  );
  if (post.length === 0) {
    await client.query(
      'INSERT INTO posts (id, title, slug, content, excerpt, category, status, "publishedAt", "authorName", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW(), NOW())',
      [
        randomUUID(),
        "Cuidados basicos para tu tatuaje nuevo",
        "cuidados-basicos-tatuaje-nuevo",
        "<h2>Los primeros dias son cruciales</h2><p>Tu nuevo tatuaje necesita cuidados especificos para sanar correctamente.</p>",
        "Guia completa para cuidar tu tatuaje nuevo.",
        "cuidados",
        "PUBLISHED",
        "Dante Tatto",
      ]
    );
  }
  console.log("[seed] Post verificado");

  console.log("[seed] Completado");
  await client.end();
}

main().catch((e) => {
  console.error("[seed] Error:", e.message);
  process.exit(0);
});
