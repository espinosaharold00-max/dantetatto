"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, User, LogOut, CalendarDays, Shield } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/agenda", label: "Agendar cita" },
  { href: "/tienda", label: "Tienda" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre-mi", label: "Sobre mi" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-brand-dark/95 backdrop-blur supports-[backdrop-filter]:bg-brand-dark/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-brand-amber">
            DANTE TATTOO
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-300 transition-colors hover:text-brand-amber"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/tienda/carrito"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-neutral-300 hover:text-brand-pink")}
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {session?.user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <User className="h-5 w-5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
                  <div className="px-3 py-2 text-sm font-medium text-neutral-300">
                    {session.user.name || session.user.email}
                  </div>
                  <div className="my-1 h-px bg-neutral-700" />
                  <Link
                    href="/mis-citas"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Mis Citas
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                    >
                      <Shield className="h-4 w-4" />
                      Panel Admin
                    </Link>
                  )}
                  <div className="my-1 h-px bg-neutral-700" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10")}
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        <button
          className="text-neutral-300 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-t border-neutral-800 bg-brand-dark px-4 pb-4 shadow-2xl md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-sm font-medium text-neutral-300 transition-colors hover:text-brand-amber"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4">
            {session?.user ? (
              <>
                <p className="px-1 text-xs text-neutral-500">
                  {session.user.name || session.user.email}
                </p>
                <Link
                  href="/mis-citas"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full border-brand-amber/30 text-brand-amber")}
                  onClick={() => setMobileOpen(false)}
                >
                  Mis Citas
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full border-brand-amber/30 text-brand-amber")}
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
