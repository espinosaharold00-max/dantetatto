"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, User, LogOut, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/agenda", label: "Agendar cita" },
  { href: "/tienda", label: "Tienda" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre-mi", label: "Sobre mi" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-brand-dark/95 backdrop-blur supports-[backdrop-filter]:bg-brand-dark/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-brand-amber">
            CAT & CO
          </span>
          <span className="hidden text-[10px] uppercase tracking-widest text-neutral-500 sm:block">
            Tattoo Stuff
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
          <Link href="/tienda/carrito">
            <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-brand-pink">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="text-neutral-300" />}>
                  <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm font-medium">
                  {session.user.name || session.user.email}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/mis-citas" />}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Mis Citas
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10"
              >
                Iniciar sesion
              </Button>
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
        <div className="border-t border-neutral-800 bg-brand-dark px-4 pb-4 md:hidden">
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
          <div className="mt-4 flex gap-3 border-t border-neutral-800 pt-4">
            {session?.user ? (
              <>
                <Link href="/mis-citas" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full border-brand-amber/30 text-brand-amber" size="sm">
                    Mis Citas
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Panel Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-neutral-400"
                >
                  Salir
                </Button>
              </>
            ) : (
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full border-brand-amber/30 text-brand-amber" size="sm">
                  Iniciar sesion
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
