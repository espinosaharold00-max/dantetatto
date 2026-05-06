import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Crear usuario admin
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dantetattoo.com" },
    update: {},
    create: {
      name: "Dante Admin",
      email: "admin@dantetattoo.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin creado:", admin.email);

  // Configurar horario de trabajo (Lunes a Sábado, 10:00 - 19:00)
  for (let day = 0; day < 7; day++) {
    await prisma.scheduleConfig.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: {
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "19:00",
        slotDuration: 60,
        isActive: day !== 0, // Domingo cerrado
      },
    });
  }
  console.log("Horario de trabajo configurado");

  // Productos de ejemplo
  const products = [
    {
      name: "Crema Hidratante para Tatuajes",
      slug: "crema-hidratante-tatuajes",
      description:
        "Crema especializada para la hidratación y cuidado de tatuajes nuevos y existentes. Fórmula con vitamina E y aloe vera.",
      price: 35000,
      category: "cremas",
      stock: 50,
      images: [],
    },
    {
      name: "Jabón Antibacterial Suave",
      slug: "jabon-antibacterial-suave",
      description:
        "Jabón neutro antibacterial perfecto para la limpieza de tatuajes frescos. Sin fragancias artificiales.",
      price: 18000,
      category: "jabones",
      stock: 80,
      images: [],
    },
    {
      name: "Película Protectora Transparente",
      slug: "pelicula-protectora-transparente",
      description:
        "Película transpirable de segunda piel para proteger tu tatuaje durante los primeros días de cicatrización.",
      price: 25000,
      category: "protectores",
      stock: 40,
      images: [],
    },
    {
      name: "Kit Completo de Cuidado",
      slug: "kit-completo-cuidado",
      description:
        "Kit completo con crema hidratante, jabón antibacterial y película protectora. Todo lo que necesitas para el cuidado perfecto.",
      price: 65000,
      compareAtPrice: 78000,
      category: "kits",
      stock: 25,
      images: [],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("Productos de ejemplo creados");

  // Post de ejemplo
  await prisma.post.upsert({
    where: { slug: "cuidados-basicos-tatuaje-nuevo" },
    update: {},
    create: {
      title: "Cuidados básicos para tu tatuaje nuevo",
      slug: "cuidados-basicos-tatuaje-nuevo",
      content: `
        <h2>Los primeros días son cruciales</h2>
        <p>Tu nuevo tatuaje es básicamente una herida abierta, y necesita cuidados específicos para sanar correctamente y mantener los colores vibrantes.</p>
        <h3>1. Las primeras 24 horas</h3>
        <p>Mantén el vendaje que te colocamos en el estudio por al menos 2-3 horas. Cuando lo retires, lava suavemente con agua tibia y jabón antibacterial.</p>
        <h3>2. Hidratación constante</h3>
        <p>Aplica una capa fina de crema hidratante sin fragancia 2-3 veces al día. No exageres con la cantidad — una capa fina es suficiente.</p>
        <h3>3. Lo que debes evitar</h3>
        <p>Durante las primeras 2-3 semanas:</p>
        <ul>
          <li>NO rasques ni arranques las costras</li>
          <li>NO expongas al sol directo</li>
          <li>NO te metas a piscinas, mar o jacuzzi</li>
          <li>NO uses ropa ajustada sobre la zona</li>
        </ul>
        <h3>4. Productos recomendados</h3>
        <p>En nuestra tienda tenemos productos especializados que hemos probado y recomendamos para el cuidado óptimo de tu tatuaje.</p>
      `,
      excerpt:
        "Guía completa para cuidar tu tatuaje nuevo y asegurar una cicatrización perfecta.",
      category: "cuidados",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorName: "Dante Tatto",
      metaTitle: "Cuidados básicos para tu tatuaje nuevo — Dante Tatto",
      metaDescription:
        "Aprende cómo cuidar tu tatuaje nuevo paso a paso. Guía completa de cuidados post-tatuaje.",
    },
  });
  console.log("Post de ejemplo creado");

  console.log("Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
