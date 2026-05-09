"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    cancellationRate: number | string;
  };
  orders: {
    total: number;
    revenue: number;
  };
  clients: number;
  pendingReviews: number;
  topProducts: { name: string; sold: number; price: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-neutral-400">Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-400">Error al cargar estadísticas</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Citas del mes",
      value: stats.appointments.total,
      icon: Calendar,
      sub: `${stats.appointments.pending} pendientes`,
    },
    {
      title: "Ingresos tienda",
      value: `$${(stats.orders.revenue / 100).toFixed(2)}`,
      icon: DollarSign,
      sub: `${stats.orders.total} pedidos`,
    },
    {
      title: "Total clientes",
      value: stats.clients,
      icon: Users,
      sub: "registrados",
    },
    {
      title: "Tasa cancelación",
      value: `${stats.appointments.cancellationRate}%`,
      icon: TrendingUp,
      sub: `${stats.appointments.cancelled} canceladas`,
    },
    {
      title: "Citas completadas",
      value: stats.appointments.completed,
      icon: Clock,
      sub: "este mes",
    },
    {
      title: "Reseñas pendientes",
      value: stats.pendingReviews,
      icon: Star,
      sub: "por aprobar",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="border-neutral-800 bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <p className="text-xs text-neutral-400">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.topProducts.length > 0 && (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">
              Productos más vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-neutral-950 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-neutral-400">
                      {product.sold} vendidos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
