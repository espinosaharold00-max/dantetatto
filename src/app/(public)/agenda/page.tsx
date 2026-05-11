"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
import type { TimeSlot } from "@/types";

const appointmentTypes = [
  {
    value: "CONSULTATION",
    label: "Consultoría inicial",
    description: "Primera vez — platiquemos sobre tu idea",
  },
  {
    value: "CONTINUATION",
    label: "Sesión de continuación",
    description: "Continuación de un trabajo en progreso",
  },
  {
    value: "TOUCH_UP",
    label: "Retoque",
    description: "Retoques y ajustes a un tatuaje existente",
  },
];

const bodyAreas = [
  "Brazo",
  "Antebrazo",
  "Muñeca",
  "Mano",
  "Pecho",
  "Espalda",
  "Costillas",
  "Pierna",
  "Muslo",
  "Pantorrilla",
  "Tobillo",
  "Pie",
  "Cuello",
  "Hombro",
  "Otro",
];

type Step = "type" | "date" | "info" | "confirm" | "success";

export default function AgendaPage() {
  const [step, setStep] = useState<Step>("type");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const form = useForm<AppointmentInput>({
    defaultValues: {
      type: undefined,
      date: "",
      startTime: "",
      description: "",
      bodyArea: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const fetchSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/appointments/slots?date=${format(date, "yyyy-MM-dd")}`
      );
      const data = await res.json();
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedSlot(undefined);
    form.setValue("date", format(date, "yyyy-MM-dd"), { shouldValidate: true });
    fetchSlots(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot.startTime);
    form.setValue("startTime", slot.startTime, { shouldValidate: true });
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateFields = (fields?: (keyof AppointmentInput)[]) => {
    const values = form.getValues();
    const result = appointmentSchema.safeParse(values);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const issues = result.error.issues;
    const newErrors: Record<string, string> = {};
    for (const issue of issues) {
      const field = String(issue.path[0]);
      if (!fields || fields.includes(field as keyof AppointmentInput)) {
        newErrors[field] = issue.message;
      }
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async () => {
    setLoading(true);
    setSubmitError(null);
    const values = form.getValues();
    const result = appointmentSchema.safeParse(values);
    if (!result.success) {
      setStep("info");
      setSubmitError("Por favor completa todos los campos correctamente.");
      const issues = result.error.issues;
      const newErrors: Record<string, string> = {};
      for (const issue of issues) {
        newErrors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (res.ok) {
        setStep("success");
      } else {
        const error = await res.json();
        setSubmitError(error.error || "Error al crear la cita");
      }
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-amber">
          Dante Tattoo — Estudio de Tatuaje
        </p>
        <h1 className="text-4xl font-black text-white">Agenda tu cita</h1>
        <p className="mt-2 text-neutral-400">
          Selecciona el tipo de cita, elige fecha y hora, y completa tus datos
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex justify-center gap-2">
        {(["type", "date", "info", "confirm"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full ${
              (["type", "date", "info", "confirm"] as Step[]).indexOf(step) >= i
                ? "bg-brand-amber"
                : "bg-neutral-800"
            }`}
          />
        ))}
      </div>

      {step === "success" ? (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="mb-4 h-16 w-16 text-brand-amber" />
            <h2 className="mb-2 text-2xl font-bold text-white">
              ¡Cita registrada!
            </h2>
            <p className="mb-6 text-center text-neutral-400">
              Te hemos enviado un email de confirmación. Tu cita está pendiente
              de aprobación y te notificaremos cuando sea confirmada.
            </p>
            <Button
              onClick={() => {
                setStep("type");
                form.reset();
                setSelectedDate(undefined);
                setSelectedSlot(undefined);
              }}
              variant="outline"
              className="border-neutral-700"
            >
              Agendar otra cita
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm(); }}>
          {/* Step 1: Tipo de cita */}
          {step === "type" && (
            <div className="grid gap-4 sm:grid-cols-3">
              {appointmentTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`cursor-pointer border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-600 ${
                    form.watch("type") === type.value
                      ? "border-brand-amber ring-1 ring-brand-amber"
                      : ""
                  }`}
                  onClick={() => {
                    form.setValue("type", type.value as AppointmentInput["type"], { shouldValidate: true });
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      {type.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-400">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
              <div className="col-span-full mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    if (form.getValues("type")) setStep("date");
                  }}
                  disabled={!form.watch("type")}
                  className="bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Fecha y hora */}
          {step === "date" && (
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-neutral-800 bg-neutral-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CalendarIcon className="h-5 w-5" />
                    Selecciona una fecha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    locale={es}
                  />
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5" />
                    Horarios disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <p className="text-sm text-neutral-400">
                      Selecciona una fecha primero
                    </p>
                  ) : loadingSlots ? (
                    <p className="text-sm text-neutral-400">
                      Cargando horarios...
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-neutral-400">
                      No hay horarios disponibles para esta fecha
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => handleSlotSelect(slot)}
                          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                            selectedSlot === slot.startTime
                              ? "border-brand-amber bg-brand-amber text-brand-dark"
                              : slot.available
                                ? "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                                : "cursor-not-allowed border-neutral-800 text-neutral-500 line-through"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="col-span-full flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("type")}
                  className="border-neutral-700"
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (selectedDate && selectedSlot) setStep("info");
                  }}
                  disabled={!selectedDate || !selectedSlot}
                  className="bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Información */}
          {step === "info" && (
            <Card className="border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-white">Tus datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="text-white">Nombre completo</Label>
                    <Input
                      id="name"
                      value={form.watch("name")}
                      onChange={(e) => form.setValue("name", e.target.value)}
                      className="border-neutral-700 bg-neutral-800"
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-400">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.watch("email")}
                      onChange={(e) => form.setValue("email", e.target.value)}
                      className="border-neutral-700 bg-neutral-800"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone" className="text-white">Teléfono</Label>
                    <Input
                      id="phone"
                      value={form.watch("phone")}
                      onChange={(e) => form.setValue("phone", e.target.value)}
                      className="border-neutral-700 bg-neutral-800"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-400">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bodyArea" className="text-white">Zona del cuerpo</Label>
                    <Select
                      value={form.watch("bodyArea") || undefined}
                      onValueChange={(v) => { if (v) form.setValue("bodyArea", v, { shouldValidate: true }); }}
                    >
                      <SelectTrigger className="border-neutral-700 bg-neutral-800">
                        <SelectValue placeholder="Selecciona la zona" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.bodyArea && (
                      <p className="mt-1 text-sm text-red-400">
                        {fieldErrors.bodyArea}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    Describe tu diseño o idea
                  </Label>
                  <Textarea
                    id="description"
                    value={form.watch("description")}
                    onChange={(e) => form.setValue("description", e.target.value)}
                    rows={4}
                    placeholder="Cuéntanos qué tienes en mente: estilo, tamaño, referencias..."
                    className="border-neutral-700 bg-neutral-800"
                  />
                  {fieldErrors.description && (
                    <p className="mt-1 text-sm text-red-400">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("date")}
                    className="border-neutral-700"
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (validateFields(["name", "email", "phone", "bodyArea", "description"])) {
                        setSubmitError(null);
                        setStep("confirm");
                      }
                    }}
                    className="bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                  >
                    Revisar y confirmar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Confirmar */}
          {step === "confirm" && (
            <Card className="border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-white">
                  Confirma tu reserva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-neutral-400">
                      Tipo de cita
                    </p>
                    <p className="font-medium text-white">
                      {
                        appointmentTypes.find(
                          (t) => t.value === form.getValues("type")
                        )?.label
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-neutral-400">Fecha</p>
                    <p className="font-medium text-white">
                      {selectedDate &&
                        format(selectedDate, "EEEE d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-neutral-400">
                      Horario
                    </p>
                    <p className="font-medium text-white">{selectedSlot}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-neutral-400">Zona</p>
                    <p className="font-medium text-white">
                      {form.getValues("bodyArea")}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase text-neutral-400">
                      Descripción
                    </p>
                    <p className="text-sm text-neutral-300">
                      {form.getValues("description")}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                  <p className="text-xs uppercase text-neutral-400">
                    Datos de contacto
                  </p>
                  <p className="text-white">{form.getValues("name")}</p>
                  <p className="text-sm text-neutral-400">
                    {form.getValues("email")} • {form.getValues("phone")}
                  </p>
                </div>

                {submitError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("info")}
                    className="border-neutral-700"
                  >
                    Editar datos
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                  >
                    {loading ? "Registrando..." : "Confirmar reserva"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      )}
    </div>
  );
}
