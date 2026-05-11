"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/lib/country-codes";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+507");

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
        body: JSON.stringify({ name, email, password, phone: phone ? `${countryCode}${phone}` : undefined }),
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
          <Link href="/" className="mb-2 block">
            <Image src="/images/logo.png" alt="Dante Tattoo" width={56} height={56} className="mx-auto rounded-full" />
            <span className="mt-2 text-2xl font-black text-brand-amber">DANTE TATTOO</span>
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
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={(v) => { if (v) setCountryCode(v); }}>
                  <SelectTrigger className="w-[130px] shrink-0 border-neutral-700 bg-neutral-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="62535086"
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
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
