import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pg from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    step: "init",
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/\/\/.*@/, "//***@")
      : "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "NOT SET",
  };

  let client: InstanceType<typeof pg.Client> | null = null;

  try {
    info.step = "pg_connect";
    client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    info.pg_connected = true;

    info.step = "check_tables";
    const tables = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    info.tables = tables.rows.map((r: { tablename: string }) => r.tablename);

    info.step = "count_users";
    const userCount = await client.query("SELECT COUNT(*) as count FROM users");
    info.user_count = parseInt(userCount.rows[0].count);

    info.step = "check_admin";
    const adminCheck = await client.query(
      "SELECT id, email, role, password IS NOT NULL as has_password FROM users WHERE email = $1",
      ["admin@dantetattoo.com"]
    );
    info.admin_exists = adminCheck.rows.length > 0;
    if (adminCheck.rows.length > 0) {
      info.admin_info = adminCheck.rows[0];
    }

    info.step = "bcrypt_hash";
    const hash = await bcrypt.hash("admin123456", 12);
    info.hash_generated = true;
    info.hash_preview = hash.substring(0, 20) + "...";

    info.step = "bcrypt_verify";
    const verifyOk = await bcrypt.compare("admin123456", hash);
    info.bcrypt_verify = verifyOk;

    if (adminCheck.rows.length > 0) {
      info.step = "update_admin";
      await client.query(
        'UPDATE users SET password = $1, role = $2 WHERE email = $3',
        [hash, "ADMIN", "admin@dantetattoo.com"]
      );
      info.action = "password_reset_via_pg";

      info.step = "verify_stored_hash";
      const stored = await client.query(
        "SELECT password FROM users WHERE email = $1",
        ["admin@dantetattoo.com"]
      );
      const storedHash = stored.rows[0].password;
      const compareResult = await bcrypt.compare("admin123456", storedHash);
      info.stored_hash_valid = compareResult;
    } else {
      info.step = "create_admin";
      const id = crypto.randomUUID();
      await client.query(
        'INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [id, "Dante Admin", "admin@dantetattoo.com", hash, "ADMIN"]
      );
      info.action = "created_via_pg";
      info.user_id = id;
    }

    info.step = "test_prisma";
    try {
      const { prisma } = await import("@/lib/prisma");
      const prismaUser = await prisma.user.findUnique({
        where: { email: "admin@dantetattoo.com" },
      });
      info.prisma_works = true;
      info.prisma_found_user = !!prismaUser;
      if (prismaUser) {
        info.prisma_user_role = prismaUser.role;
      }
    } catch (prismaError) {
      info.prisma_works = false;
      info.prisma_error = String(prismaError);
    }

    info.status = "ok";
    info.message = "Admin listo — admin@dantetattoo.com / admin123456";
  } catch (error) {
    info.status = "error";
    info.error = String(error);
  } finally {
    if (client) await client.end().catch(() => {});
  }

  return NextResponse.json(info, { status: info.status === "ok" ? 200 : 500 });
}
