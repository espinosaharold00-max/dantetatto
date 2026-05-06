"use client";

import { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { AppointmentWithUser } from "@/types";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const typeLabels: Record<string, string> = {
  CONSULTATION: "Consultoría",
  CONTINUATION: "Continuación",
  TOUCH_UP: "Retoque",
};

export default function AdminAgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithUser | null>(null);
  const [notes, setNotes] = useState("");

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/appointments?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`
    )
      .then((r) => r.json())
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWeek]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updated : a))
        );
        if (selectedAppointment?.id === id) setSelectedAppointment(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveNotes = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="border-neutral-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[200px] text-center text-sm text-neutral-300">
            {format(weekStart, "d MMM", { locale: es })} —{" "}
            {format(weekEnd, "d MMM yyyy", { locale: es })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="border-neutral-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {loading ? (
            <p className="py-8 text-center text-neutral-400">Cargando...</p>
          ) : appointments.length === 0 ? (
            <Card className="border-neutral-800 bg-neutral-900">
              <CardContent className="py-8 text-center text-neutral-400">
                No hay citas esta semana
              </CardContent>
            </Card>
          ) : (
            appointments.map((apt) => (
              <Card
                key={apt.id}
                className={`cursor-pointer border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700 ${
                  selectedAppointment?.id === apt.id ? "ring-1 ring-white" : ""
                }`}
                onClick={() => {
                  setSelectedAppointment(apt);
                  setNotes(apt.adminNotes || "");
                }}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-neutral-500">
                        {format(new Date(apt.date), "EEE", { locale: es })}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {format(new Date(apt.date), "d")}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-neutral-500" />
                        <span className="font-medium text-white">
                          {apt.user.name || apt.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.startTime), "HH:mm")} —{" "}
                        {format(new Date(apt.endTime), "HH:mm")}
                        <span className="text-neutral-600">•</span>
                        {typeLabels[apt.type]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[apt.status]}
                    >
                      {statusLabels[apt.status]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} />}>
                          <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(apt.id, "CONFIRMED");
                          }}
                        >
                          Confirmar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(apt.id, "COMPLETED");
                          }}
                        >
                          Completar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(apt.id, "CANCELLED");
                          }}
                          className="text-red-400"
                        >
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedAppointment && (
          <Card className="h-fit border-neutral-800 bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-white">Detalle de cita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase text-neutral-500">Cliente</p>
                <p className="font-medium text-white">
                  {selectedAppointment.user.name}
                </p>
                <p className="text-sm text-neutral-400">
                  {selectedAppointment.user.email}
                </p>
                {selectedAppointment.user.phone && (
                  <p className="text-sm text-neutral-400">
                    {selectedAppointment.user.phone}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase text-neutral-500">
                  Descripción
                </p>
                <p className="text-sm text-neutral-300">
                  {selectedAppointment.description}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-neutral-500">
                  Zona del cuerpo
                </p>
                <p className="text-sm text-white">
                  {selectedAppointment.bodyArea}
                </p>
              </div>

              {selectedAppointment.referenceImageUrl && (
                <div>
                  <p className="text-xs uppercase text-neutral-500">
                    Imagen de referencia
                  </p>
                  <img
                    src={selectedAppointment.referenceImageUrl}
                    alt="Referencia"
                    className="mt-2 rounded-lg"
                  />
                </div>
              )}

              <div>
                <p className="mb-2 text-xs uppercase text-neutral-500">
                  Notas internas
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas privadas sobre esta cita..."
                  className="border-neutral-700 bg-neutral-800"
                  rows={3}
                />
                <Button
                  onClick={() => saveNotes(selectedAppointment.id)}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-neutral-700"
                >
                  Guardar notas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
