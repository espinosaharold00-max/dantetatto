"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Configuración</h1>

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-white">
            Horario de trabajo
          </CardTitle>
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
                  className={`text-sm ${day.isActive ? "text-white" : "text-neutral-500"}`}
                >
                  {dayNames[day.dayOfWeek]}
                </span>
              </div>

              {day.isActive && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-neutral-500">De</Label>
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
                    <Label className="text-xs text-neutral-500">A</Label>
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
                    <Label className="text-xs text-neutral-500">
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
    </div>
  );
}
