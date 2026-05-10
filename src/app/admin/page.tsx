"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Clock,
  Package,
  ShoppingCart,
  AlertTriangle,
  Megaphone,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    pending: number;
    revenue: number;
  };
  clients: number;
  pendingReviews: number;
  inventory: {
    investmentValue: number;
    retailValue: number;
    potentialProfit: number;
    lowStockCount: number;
  };
  activePromotions: number;
  activeBanners: number;
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Image src="/images/logo.png" alt="Dante Tattoo" width={40} height={40} className="rounded-full" />
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Citas del mes</CardTitle>
            <Calendar className="h-4 w-4 text-brand-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.appointments.total}</div>
            <p className="text-xs text-neutral-400">{stats.appointments.pending} pendientes</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Ingresos tienda</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">USD ${(stats.orders.revenue / 100).toFixed(2)}</div>
            <p className="text-xs text-neutral-400">{stats.orders.total} pedidos pagados</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Pedidos pendientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.orders.pending}</div>
            <p className="text-xs text-neutral-400">por procesar</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.clients}</div>
            <p className="text-xs text-neutral-400">registrados</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Citas completadas</CardTitle>
            <Clock className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.appointments.completed}</div>
            <p className="text-xs text-neutral-400">
              este mes • {stats.appointments.cancellationRate}% cancelación
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Reseñas pendientes</CardTitle>
            <Star className="h-4 w-4 text-brand-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingReviews}</div>
            <p className="text-xs text-neutral-400">por aprobar</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Inversión en stock</CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              USD ${(stats.inventory.investmentValue / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Valor retail</CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-brand-amber">
              USD ${(stats.inventory.retailValue / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Ganancia potencial</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-400">
              USD ${(stats.inventory.potentialProfit / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-neutral-800 bg-neutral-900 ${stats.inventory.lowStockCount > 0 ? "border-yellow-800/50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Stock bajo</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.inventory.lowStockCount > 0 ? "text-yellow-400" : "text-neutral-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${stats.inventory.lowStockCount > 0 ? "text-yellow-400" : "text-white"}`}>
              {stats.inventory.lowStockCount} productos
            </div>
            {stats.inventory.lowStockCount > 0 && (
              <Link href="/admin/inventario" className="text-xs text-yellow-400 underline">
                Ver inventario
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {stats.topProducts.length > 0 && (
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-white">Productos más vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-neutral-950 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-amber/10 text-sm font-bold text-brand-amber">
                        {i + 1}
                      </span>
                      <span className="text-white">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-neutral-400">{product.sold} vendidos</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Estado del sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-neutral-950 p-3">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-4 w-4 text-brand-amber" />
                  <span className="text-neutral-300">Promociones activas</span>
                </div>
                <Badge variant="outline" className="text-brand-amber">{stats.activePromotions}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-950 p-3">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-4 w-4 text-brand-pink" />
                  <span className="text-neutral-300">Banners activos</span>
                </div>
                <Badge variant="outline" className="text-brand-pink">{stats.activeBanners}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
