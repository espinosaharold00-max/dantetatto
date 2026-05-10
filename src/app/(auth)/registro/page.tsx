"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const password = formData.get("password") as string;

    if (!name || name.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("El email es requerido");
      setLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al registrarse");
        setLoading(false);
        return;
      }

      const result = await res.json();

      if (result.verified) {
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        router.push("/");
        router.refresh();
      } else {
        router.push(`/verificar?email=${encodeURIComponent(email)}&p=${encodeURIComponent(password)}`);
      }
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
            Crear cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                className="border-neutral-700 bg-neutral-800"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="border-neutral-700 bg-neutral-800"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                className="border-neutral-700 bg-neutral-800"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="border-neutral-700 bg-neutral-800"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-brand-amber underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
