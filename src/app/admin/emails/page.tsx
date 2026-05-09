"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmailLogEntry {
  id: string;
  to: string;
  type: string;
  subject: string;
  resendId: string | null;
  error: string | null;
  sentAt: string;
}

const typeLabels: Record<string, string> = {
  APPOINTMENT_CONFIRMATION: "Confirmación cita",
  APPOINTMENT_REMINDER_48H: "Recordatorio 48h",
  APPOINTMENT_REMINDER_2H: "Recordatorio 2h",
  APPOINTMENT_CONFIRMED: "Cita confirmada",
  APPOINTMENT_CANCELLED: "Cita cancelada",
  POST_APPOINTMENT: "Post-cita",
  ORDER_CONFIRMATION: "Confirmación pedido",
  ORDER_SHIPPED: "Pedido enviado",
  ORDER_INVOICE: "Factura",
  NEWSLETTER: "Newsletter",
};

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/emails")
      .then((r) => r.json())
      .then(setEmails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center text-neutral-400">Cargando...</div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">
        Historial de emails
      </h1>

      {emails.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="py-8 text-center text-neutral-400">
            No hay emails enviados aún
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <Card
              key={email.id}
              className="border-neutral-800 bg-neutral-900"
            >
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {email.error ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {email.subject}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[email.type] || email.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Mail className="h-3 w-3" />
                      {email.to}
                      {email.error && (
                        <span className="text-red-400">
                          Error: {email.error}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">
                  {format(new Date(email.sentAt), "d MMM HH:mm", {
                    locale: es,
                  })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
