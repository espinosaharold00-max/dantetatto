"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("p") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!code || code.length !== 6) {
      setError("Ingresa el código de 6 dígitos");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Error al verificar");
        setLoading(false);
        return;
      }

      setSuccess(true);

      if (password) {
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-green-800 bg-green-950 p-4 text-sm text-green-400">
          Email verificado correctamente. Redirigiendo...
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-center text-sm text-neutral-400">
        Enviamos un código de 6 dígitos a{" "}
        <span className="text-white">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="code">Código de verificación</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="border-neutral-700 bg-neutral-800 text-center text-2xl tracking-[8px]"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verificando..." : "Verificar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        ¿No recibiste el código?{" "}
        <Link href="/registro" className="text-brand-amber underline">
          Intentar de nuevo
        </Link>
      </p>
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900">
        <CardHeader className="text-center">
          <Link href="/" className="mb-2 block">
            <span className="text-2xl font-black text-brand-amber">DANTE TATTOO</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-neutral-400">Estudio de Tatuaje</span>
          </Link>
          <CardTitle className="text-lg text-neutral-300">
            Verificar email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-center text-sm text-neutral-400">Cargando...</p>}>
            <VerifyForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
