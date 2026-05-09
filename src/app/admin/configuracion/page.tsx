"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface DaySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  allDay: boolean;
  createdAt: string;
}

export default function AdminConfigPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: "10:00",
      endTime: "19:00",
      slotDuration: 60,
      isActive: i !== 0,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Blocked slots state
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);
  const [blockForm, setBlockForm] = useState({
    date: "",
    allDay: true,
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [submittingBlock, setSubmittingBlock] = useState(false);

  useEffect(() => {
    fetch("/api/admin/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSchedule((prev) =>
            prev.map((day) => {
              const found = data.find(
                (d: DaySchedule) => d.dayOfWeek === day.dayOfWeek
              );
              return found || day;
            })
          );
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchBlockedSlots();
  }, []);

  const fetchBlockedSlots = async () => {
    setLoadingBlocked(true);
    try {
      const res = await fetch("/api/appointments/blocked");
      if (res.ok) {
        const data = await res.json();
        setBlockedSlots(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const updateDay = (dayOfWeek: number, field: string, value: unknown) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockSubmit = async () => {
    if (!blockForm.date) return;

    setSubmittingBlock(true);
    try {
      const dateStr = blockForm.date;
      const body: Record<string, unknown> = {
        date: new Date(dateStr + "T00:00:00").toISOString(),
        allDay: blockForm.allDay,
        reason: blockForm.reason || undefined,
      };

      if (!blockForm.allDay) {
        if (!blockForm.startTime || !blockForm.endTime) {
          setSubmittingBlock(false);
          return;
        }
        body.startTime = new Date(
          dateStr + "T" + blockForm.startTime + ":00"
        ).toISOString();
        body.endTime = new Date(
          dateStr + "T" + blockForm.endTime + ":00"
        ).toISOString();
      }

      const res = await fetch("/api/appointments/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setBlockForm({
          date: "",
          allDay: true,
          startTime: "",
          endTime: "",
          reason: "",
        });
        fetchBlockedSlots();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/blocked?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Configuración</h1>

      <div className="space-y-6">
        {/* Schedule configuration card */}
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Horario de trabajo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-3"
              >
                <div className="flex w-28 items-center gap-2">
                  <Switch
                    checked={day.isActive}
                    onCheckedChange={(v) =>
                      updateDay(day.dayOfWeek, "isActive", v)
                    }
                  />
                  <span
                    className={`text-sm ${day.isActive ? "text-white" : "text-neutral-400"}`}
                  >
                    {dayNames[day.dayOfWeek]}
                  </span>
                </div>

                {day.isActive && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-neutral-400">De</Label>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, "startTime", e.target.value)
                        }
                        className="w-28 border-neutral-700 bg-neutral-800"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-neutral-400">A</Label>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, "endTime", e.target.value)
                        }
                        className="w-28 border-neutral-700 bg-neutral-800"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-neutral-400">
                        Duración (min)
                      </Label>
                      <Input
                        type="number"
                        value={day.slotDuration}
                        onChange={(e) =>
                          updateDay(
                            day.dayOfWeek,
                            "slotDuration",
                            parseInt(e.target.value) || 60
                          )
                        }
                        className="w-20 border-neutral-700 bg-neutral-800"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-white text-black hover:bg-neutral-200"
            >
              <Save className="h-4 w-4" />
              {saved ? "Guardado" : saving ? "Guardando..." : "Guardar horario"}
            </Button>
          </CardContent>
        </Card>

        {/* Blocked slots card */}
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Días Bloqueados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing blocked slots list */}
            {loadingBlocked ? (
              <p className="text-sm text-neutral-400">
                Cargando días bloqueados...
              </p>
            ) : blockedSlots.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No hay horarios bloqueados
              </p>
            ) : (
              <div className="space-y-2">
                {blockedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {format(new Date(slot.date), "d MMM yyyy", {
                            locale: es,
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          {slot.allDay ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/10 text-amber-400"
                            >
                              Todo el día
                            </Badge>
                          ) : (
                            <span className="text-xs text-neutral-400">
                              {format(new Date(slot.startTime), "HH:mm")} —{" "}
                              {format(new Date(slot.endTime), "HH:mm")}
                            </span>
                          )}
                          {slot.reason && (
                            <span className="text-xs text-neutral-400">
                              — {slot.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteBlock(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Block slot form */}
            <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-medium text-white">
                Bloquear horario
              </p>

              <div>
                <Label className="text-xs text-neutral-400">Fecha</Label>
                <Input
                  type="date"
                  value={blockForm.date}
                  onChange={(e) =>
                    setBlockForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="mt-1 border-neutral-700 bg-neutral-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={blockForm.allDay}
                  onCheckedChange={(checked) =>
                    setBlockForm((prev) => ({
                      ...prev,
                      allDay: !!checked,
                      startTime: "",
                      endTime: "",
                    }))
                  }
                />
                <Label className="text-sm text-neutral-300">Todo el día</Label>
              </div>

              {!blockForm.allDay && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-neutral-400">
                      Hora inicio
                    </Label>
                    <Input
                      type="time"
                      value={blockForm.startTime}
                      onChange={(e) =>
                        setBlockForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="mt-1 border-neutral-700 bg-neutral-800"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-neutral-400">
                      Hora fin
                    </Label>
                    <Input
                      type="time"
                      value={blockForm.endTime}
                      onChange={(e) =>
                        setBlockForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="mt-1 border-neutral-700 bg-neutral-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-neutral-400">
                  Razón (opcional)
                </Label>
                <Input
                  type="text"
                  placeholder="Vacaciones, mantenimiento..."
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="mt-1 border-neutral-700 bg-neutral-800"
                />
              </div>

              <Button
                onClick={handleBlockSubmit}
                disabled={
                  submittingBlock ||
                  !blockForm.date ||
                  (!blockForm.allDay &&
                    (!blockForm.startTime || !blockForm.endTime))
                }
                className="w-full gap-2 bg-amber-600 text-white hover:bg-amber-700"
              >
                {submittingBlock ? "Bloqueando..." : "Bloquear horario"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
