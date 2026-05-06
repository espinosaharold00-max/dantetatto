import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@dantetatto.com" },
  });

  if (!adminExists) {
    const hash = await bcrypt.hash("admin123456", 12);
    await prisma.user.create({
      data: {
        name: "Dante Admin",
        email: "admin@dantetatto.com",
        password: hash,
        role: "ADMIN",
      },
    });
    console.log("[seed] Admin creado: admin@dantetatto.com");
  } else {
    console.log("[seed] Admin ya existe, sin cambios");
  }

  for (let day = 0; day < 7; day++) {
    const exists = await prisma.scheduleConfig.findUnique({
      where: { dayOfWeek: day },
    });
    if (!exists) {
      await prisma.scheduleConfig.create({
        data: {
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "19:00",
          slotDuration: 60,
          isActive: day !== 0,
        },
      });
    }
  }
  console.log("[seed] Horario configurado");

  const products = [
    {
      name: "Crema Hidratante para Tatuajes",
      slug: "crema-hidratante-tatuajes",
      description: "Crema especializada para la hidratacion y cuidado de tatuajes nuevos y existentes.",
      price: 35000,
      category: "cremas",
      stock: 50,
      images: [],
    },
    {
      name: "Jabon Antibacterial Suave",
      slug: "jabon-antibacterial-suave",
      description: "Jabon neutro antibacterial perfecto para la limpieza de tatuajes frescos.",
      price: 18000,
      category: "jabones",
      stock: 80,
      images: [],
    },
    {
      name: "Pelicula Protectora Transparente",
      slug: "pelicula-protectora-transparente",
      description: "Pelicula transpirable de segunda piel para proteger tu tatuaje.",
      price: 25000,
      category: "protectores",
      stock: 40,
      images: [],
    },
    {
      name: "Kit Completo de Cuidado",
      slug: "kit-completo-cuidado",
      description: "Kit completo con crema hidratante, jabon antibacterial y pelicula protectora.",
      price: 65000,
      compareAtPrice: 78000,
      category: "kits",
      stock: 25,
      images: [],
    },
  ];

  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!exists) {
      await prisma.product.create({ data: p });
    }
  }
  console.log("[seed] Productos verificados");

  const postSlug = "cuidados-basicos-tatuaje-nuevo";
  const postExists = await prisma.post.findUnique({ where: { slug: postSlug } });
  if (!postExists) {
    await prisma.post.create({
      data: {
        title: "Cuidados basicos para tu tatuaje nuevo",
        slug: postSlug,
        content: "<h2>Los primeros dias son cruciales</h2><p>Tu nuevo tatuaje necesita cuidados especificos para sanar correctamente.</p>",
        excerpt: "Guia completa para cuidar tu tatuaje nuevo.",
        category: "cuidados",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorName: "Dante Tatto",
      },
    });
  }
  console.log("[seed] Post verificado");

  console.log("[seed] Completado");
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e.message);
    process.exit(0);
  })
  .finally(() => prisma.$disconnect());
