"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();

    if (!email) {
      setError("El email es requerido");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al enviar");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setSent(true);
      if (!data.emailSent) setEmailFailed(true);
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
            Recuperar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              {emailFailed ? (
                <div className="rounded-lg border border-yellow-800 bg-yellow-950 p-4 text-sm text-yellow-400">
                  El servicio de email no está disponible en este momento. Contacta al administrador para restablecer tu contraseña.
                </div>
              ) : (
                <div className="rounded-lg border border-green-800 bg-green-950 p-4 text-sm text-green-400">
                  Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
                </div>
              )}
              <Link
                href="/login"
                className="block text-sm text-brand-amber underline"
              >
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-sm text-neutral-400">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="border-neutral-700 bg-neutral-800"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-400">
                <Link href="/login" className="text-brand-amber underline">
                  Volver al login
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
