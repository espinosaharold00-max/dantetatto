import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    appointmentsThisMonth,
    completedAppointments,
    cancelledAppointments,
    pendingAppointments,
    ordersThisMonth,
    pendingOrders,
    revenue,
    totalClients,
    pendingReviews,
    topProducts,
    allProducts,
    activePromotions,
    activeBanners,
    lowStockCount,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.appointment.count({
      where: { date: { gte: monthStart, lte: monthEnd }, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: { date: { gte: monthStart, lte: monthEnd }, status: "CANCELLED" },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.order.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { price: true, costPrice: true, stock: true },
    }),
    prisma.promotion.count({
      where: { isActive: true, endDate: { gte: now } },
    }),
    prisma.banner.count({ where: { isActive: true } }),
    prisma.product.count({
      where: { isActive: true, stock: { lte: 5 } },
    }),
  ]);

  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map((p) => p.productId) } },
    select: { id: true, name: true, price: true },
  });

  const inventoryValue = allProducts.reduce(
    (sum, p) => sum + (p.costPrice || 0) * p.stock,
    0
  );
  const retailValue = allProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  return NextResponse.json({
    appointments: {
      total: appointmentsThisMonth,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      pending: pendingAppointments,
      cancellationRate:
        appointmentsThisMonth > 0
          ? ((cancelledAppointments / appointmentsThisMonth) * 100).toFixed(1)
          : 0,
    },
    orders: {
      total: ordersThisMonth,
      pending: pendingOrders,
      revenue: revenue._sum.total || 0,
    },
    clients: totalClients,
    pendingReviews,
    inventory: {
      investmentValue: inventoryValue,
      retailValue: retailValue,
      potentialProfit: retailValue - inventoryValue,
      lowStockCount,
    },
    activePromotions,
    activeBanners,
    topProducts: topProducts.map((tp) => {
      const product = topProductDetails.find((p) => p.id === tp.productId);
      return {
        name: product?.name || "Desconocido",
        sold: tp._sum.quantity || 0,
        price: product?.price || 0,
      };
    }),
  });
}
