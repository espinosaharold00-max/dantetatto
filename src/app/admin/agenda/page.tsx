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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCOP } from "@/lib/format";
import type { AppointmentWithUser } from "@/types";
import type { AppointmentPayment } from "@prisma/client";

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

  // Payment state
  const [payments, setPayments] = useState<AppointmentPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [priceForm, setPriceForm] = useState({ totalPrice: "", deposit: "" });
  const [savingPrice, setSavingPrice] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "CASH",
    note: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

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

  const fetchPayments = async (appointmentId: string) => {
    setLoadingPayments(true);
    try {
      const res = await fetch(
        `/api/appointments/${appointmentId}/payments`
      );
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const selectAppointment = (apt: AppointmentWithUser) => {
    setSelectedAppointment(apt);
    setNotes(apt.adminNotes || "");
    setPriceForm({
      totalPrice: apt.totalPrice?.toString() || "",
      deposit: apt.deposit?.toString() || "",
    });
    setPaymentForm({ amount: "", method: "CASH", note: "" });
    fetchPayments(apt.id);
  };

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

  const savePrice = async (id: string) => {
    setSavingPrice(true);
    try {
      const totalPrice = parseInt(priceForm.totalPrice);
      const deposit = parseInt(priceForm.deposit) || 0;

      if (isNaN(totalPrice) || totalPrice <= 0) return;

      const res = await fetch(`/api/appointments/${id}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice, deposit }),
      });

      if (res.ok) {
        const updatedApt = {
          ...selectedAppointment!,
          totalPrice,
          deposit,
        };
        setSelectedAppointment(updatedApt);
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updatedApt : a))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrice(false);
    }
  };

  const submitPayment = async (id: string) => {
    setSubmittingPayment(true);
    try {
      const amount = parseInt(paymentForm.amount);
      if (isNaN(amount) || amount <= 0) return;

      const res = await fetch(`/api/appointments/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: paymentForm.method,
          note: paymentForm.note || undefined,
        }),
      });

      if (res.ok) {
        setPaymentForm({ amount: "", method: "CASH", note: "" });
        fetchPayments(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

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
                onClick={() => selectAppointment(apt)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-neutral-400">
                        {format(new Date(apt.date), "EEE", { locale: es })}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {format(new Date(apt.date), "d")}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-neutral-400" />
                        <span className="font-medium text-white">
                          {apt.user.name || apt.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.startTime), "HH:mm")} —{" "}
                        {format(new Date(apt.endTime), "HH:mm")}
                        <span className="text-neutral-400">•</span>
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
                <p className="text-xs uppercase text-neutral-400">Cliente</p>
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
                <p className="text-xs uppercase text-neutral-400">
                  Descripción
                </p>
                <p className="text-sm text-neutral-300">
                  {selectedAppointment.description}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-neutral-400">
                  Zona del cuerpo
                </p>
                <p className="text-sm text-white">
                  {selectedAppointment.bodyArea}
                </p>
              </div>

              {selectedAppointment.referenceImageUrl && (
                <div>
                  <p className="text-xs uppercase text-neutral-400">
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
                <p className="mb-2 text-xs uppercase text-neutral-400">
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

              {/* Payment section */}
              <div className="border-t border-neutral-800 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase text-amber-500">
                  Pagos
                </p>

                {selectedAppointment.totalPrice == null ? (
                  // Set price form
                  <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-sm font-medium text-white">
                      Establecer precio
                    </p>
                    <div>
                      <Label className="text-xs text-neutral-400">
                        Precio total
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={priceForm.totalPrice}
                        onChange={(e) =>
                          setPriceForm((prev) => ({
                            ...prev,
                            totalPrice: e.target.value,
                          }))
                        }
                        className="mt-1 border-neutral-700 bg-neutral-800"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-400">
                        Abono inicial
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={priceForm.deposit}
                        onChange={(e) =>
                          setPriceForm((prev) => ({
                            ...prev,
                            deposit: e.target.value,
                          }))
                        }
                        className="mt-1 border-neutral-700 bg-neutral-800"
                      />
                    </div>
                    <Button
                      onClick={() => savePrice(selectedAppointment.id)}
                      disabled={savingPrice || !priceForm.totalPrice}
                      size="sm"
                      className="w-full bg-amber-600 text-white hover:bg-amber-700"
                    >
                      {savingPrice ? "Guardando..." : "Guardar precio"}
                    </Button>
                  </div>
                ) : (
                  // Price summary + payment form
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm">
                      <span className="text-neutral-400">
                        Total:{" "}
                        <span className="font-medium text-white">
                          {formatCOP(selectedAppointment.totalPrice)}
                        </span>
                      </span>
                      <span className="text-neutral-400">
                        Abonado:{" "}
                        <span className="font-medium text-green-400">
                          {formatCOP(
                            (selectedAppointment.deposit || 0) + totalPaid
                          )}
                        </span>
                      </span>
                      <span className="text-neutral-400">
                        Saldo:{" "}
                        <span className="font-medium text-amber-400">
                          {formatCOP(
                            selectedAppointment.totalPrice -
                              (selectedAppointment.deposit || 0) -
                              totalPaid
                          )}
                        </span>
                      </span>
                    </div>

                    {/* Register payment form */}
                    <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <p className="text-sm font-medium text-white">
                        Registrar abono
                      </p>
                      <div>
                        <Label className="text-xs text-neutral-400">
                          Monto
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={paymentForm.amount}
                          onChange={(e) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className="mt-1 border-neutral-700 bg-neutral-800"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-400">
                          Método
                        </Label>
                        <Select
                          value={paymentForm.method}
                          onValueChange={(v: string | null) => {
                            if (v)
                              setPaymentForm((prev) => ({
                                ...prev,
                                method: v,
                              }));
                          }}
                        >
                          <SelectTrigger className="mt-1 w-full border-neutral-700 bg-neutral-800 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Efectivo</SelectItem>
                            <SelectItem value="TRANSFER">
                              Transferencia
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-400">
                          Nota (opcional)
                        </Label>
                        <Input
                          type="text"
                          placeholder="Nota del pago..."
                          value={paymentForm.note}
                          onChange={(e) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              note: e.target.value,
                            }))
                          }
                          className="mt-1 border-neutral-700 bg-neutral-800"
                        />
                      </div>
                      <Button
                        onClick={() => submitPayment(selectedAppointment.id)}
                        disabled={submittingPayment || !paymentForm.amount}
                        size="sm"
                        className="w-full bg-amber-600 text-white hover:bg-amber-700"
                      >
                        {submittingPayment
                          ? "Registrando..."
                          : "Registrar abono"}
                      </Button>
                    </div>

                    {/* Payment history */}
                    {loadingPayments ? (
                      <p className="text-xs text-neutral-400">
                        Cargando pagos...
                      </p>
                    ) : payments.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase text-neutral-400">
                          Historial de pagos
                        </p>
                        {payments.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">
                                {formatCOP(p.amount)}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {format(
                                  new Date(p.createdAt),
                                  "d MMM yyyy, HH:mm",
                                  { locale: es }
                                )}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                p.method === "CASH"
                                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                                  : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                              }
                            >
                              {p.method === "CASH"
                                ? "Efectivo"
                                : "Transferencia"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">
                        Sin pagos registrados
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
