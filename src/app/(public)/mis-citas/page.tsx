"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  CreditCard,
  CalendarPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCOP } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Payment = {
  id: string;
  amount: number;
  method: "CASH" | "TRANSFER";
  note: string | null;
  createdAt: string;
};

type Appointment = {
  id: string;
  type: "CONSULTATION" | "CONTINUATION" | "TOUCH_UP";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  bodyArea: string;
  totalPrice: number | null;
  payments: Payment[];
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const typeLabels: Record<Appointment["type"], string> = {
  CONSULTATION: "Consultoría",
  CONTINUATION: "Continuación",
  TOUCH_UP: "Retoque",
};

const statusConfig: Record<
  Appointment["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pendiente",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  },
  CONFIRMED: {
    label: "Confirmada",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  COMPLETED: {
    label: "Completada",
    className: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

const methodLabels: Record<Payment["method"], string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
};

function formatTime(iso: string) {
  return format(new Date(iso), "h:mm a");
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PaymentSummary({
  totalPrice,
  payments,
}: {
  totalPrice: number;
  payments: Payment[];
}) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalPrice - totalPaid;

  let colorClass = "text-red-400";
  if (balance === 0) colorClass = "text-green-400";
  else if (totalPaid > 0) colorClass = "text-amber-400";

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${colorClass}`}>
      <CreditCard className="h-4 w-4 shrink-0" />
      <span>Total: {formatCOP(totalPrice)}</span>
      <span className="text-neutral-400">|</span>
      <span>Pagado: {formatCOP(totalPaid)}</span>
      <span className="text-neutral-400">|</span>
      <span>Saldo: {formatCOP(balance)}</span>
    </div>
  );
}

function PaymentHistory({ payments }: { payments: Payment[] }) {
  const [open, setOpen] = useState(false);

  if (payments.length === 0) return null;

  return (
    <div className="mt-3 border-t border-neutral-800 pt-3">
      <button
        type="button"
        className="flex w-full items-center gap-1 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        Historial de pagos ({payments.length})
      </button>

      {open && (
        <ul className="mt-2 space-y-2">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-neutral-950 px-3 py-2 text-sm"
            >
              <span className="text-neutral-400">
                {format(new Date(p.createdAt), "d MMM yyyy", { locale: es })}
              </span>
              <span className="font-medium text-white">
                {formatCOP(p.amount)}
              </span>
              <Badge className="border border-neutral-700 bg-neutral-800 text-neutral-300 text-[10px]">
                {methodLabels[p.method]}
              </Badge>
              {p.note && (
                <span className="text-xs text-neutral-400">{p.note}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const status = statusConfig[appointment.status];

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <CalendarDays className="h-4 w-4 text-brand-amber" />
            {format(new Date(appointment.date), "EEEE d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="border border-neutral-700 bg-neutral-800 text-neutral-300">
              {typeLabels[appointment.type]}
            </Badge>
            <Badge className={`border ${status.className}`}>
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Time + Body area */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(appointment.startTime)} &ndash;{" "}
            {formatTime(appointment.endTime)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {appointment.bodyArea}
          </span>
        </div>

        {/* Description */}
        {appointment.description && (
          <p className="text-sm text-neutral-400 line-clamp-2">
            {appointment.description}
          </p>
        )}

        {/* Payment summary */}
        {appointment.totalPrice != null && appointment.totalPrice > 0 && (
          <PaymentSummary
            totalPrice={appointment.totalPrice}
            payments={appointment.payments}
          />
        )}

        {/* Payment history (expandable) */}
        <PaymentHistory payments={appointment.payments} />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MisCitasPage() {
  const { data: session, status: authStatus } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/client/appointments");
        if (!res.ok) {
          throw new Error("Error al cargar las citas");
        }
        const data: Appointment[] = await res.json();
        // Sort most recent first
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAppointments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar las citas"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [authStatus]);

  /* ---- Auth gate ---- */
  if (authStatus === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-amber border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="flex flex-col items-center py-12">
            <h2 className="mb-2 text-xl font-bold text-white">
              Inicia sesión para ver tus citas
            </h2>
            <p className="mb-6 text-sm text-neutral-400">
              Necesitas una cuenta para acceder a tu historial de citas y pagos.
            </p>
            <Link href="/login" className={cn(buttonVariants(), "bg-brand-amber text-brand-dark hover:bg-brand-amber-dark")}>
              Iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Main content ---- */
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-amber/60">
          Cat & Co — Tattoo Stuff
        </p>
        <h1 className="text-4xl font-black text-white">Mis Citas</h1>
        <p className="mt-2 text-neutral-400">
          Consulta tu historial de citas y estado de pagos
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-amber border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-red-500/30 bg-neutral-900">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Button
              variant="outline"
              className="mt-4 border-neutral-700"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && appointments.length === 0 && (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="flex flex-col items-center py-12">
            <CalendarPlus className="mb-4 h-12 w-12 text-neutral-400" />
            <h2 className="mb-2 text-xl font-bold text-white">
              No tienes citas aún
            </h2>
            <p className="mb-6 text-sm text-neutral-400">
              Agenda tu primera cita y empieza tu proyecto de tatuaje.
            </p>
            <Link href="/agenda" className={cn(buttonVariants(), "bg-brand-amber text-brand-dark hover:bg-brand-amber-dark")}>
              Agendar cita
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Appointment list */}
      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))}
        </div>
      )}
    </div>
  );
}
