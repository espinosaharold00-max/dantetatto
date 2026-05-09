"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Email y contraseña son requeridos");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
      } else if (result?.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Error inesperado al iniciar sesión");
        setLoading(false);
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
            <span className="text-2xl font-black text-brand-amber">DANTETATTOO</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-neutral-400">Cat & Co — Tattoo Stuff</span>
          </Link>
          <CardTitle className="text-lg text-neutral-300">
            Iniciar sesión
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
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
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/recuperar" className="text-neutral-400 hover:text-brand-amber">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <Separator className="my-6 bg-neutral-800" />

          <Button
            variant="outline"
            className="w-full border-neutral-700"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continuar con Google
          </Button>

          <p className="mt-6 text-center text-sm text-neutral-400">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-brand-amber underline">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
