"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al restablecer");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900">
        <CardHeader className="text-center">
          <Link href="/" className="mb-2 flex flex-col items-center gap-2">
            <Image src="/images/logo-cat.png" alt="Dante Tattoo" width={64} height={45} className="h-11 w-auto" />
            <span className="text-2xl font-black text-brand-amber">DANTE TATTOO</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-neutral-400">Estudio de Tatuaje</span>
          </Link>
          <CardTitle className="text-lg text-neutral-300">
            Nueva contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-green-800 bg-green-950 p-4 text-sm text-green-400">
                Contraseña actualizada correctamente.
              </div>
              <Link
                href="/login"
                className="inline-block rounded-lg bg-brand-amber px-6 py-2 text-sm font-medium text-brand-dark hover:bg-brand-amber-dark"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="border-neutral-700 bg-neutral-800"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
