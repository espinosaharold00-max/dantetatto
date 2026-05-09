"use client";

import { useEffect, useState } from "react";
import { Download, Search, Calendar, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Client {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: {
    appointments: number;
    orders: number;
    reviews: number;
  };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    window.open("/api/admin/clients?format=csv", "_blank");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <Button
          variant="outline"
          className="gap-2 border-neutral-700"
          onClick={exportCSV}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-neutral-700 bg-neutral-800 pl-10"
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No se encontraron clientes
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Card
              key={client.id}
              className="border-neutral-800 bg-neutral-900"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">
                    {client.name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-neutral-400">{client.email}</p>
                  {client.phone && (
                    <p className="text-sm text-neutral-400">{client.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {client._count.appointments} citas
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {client._count.orders} pedidos
                  </div>
                  <span className="text-xs text-neutral-400">
                    {format(new Date(client.createdAt), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-neutral-400">
        {filtered.length} clientes
      </p>
    </div>
  );
}
