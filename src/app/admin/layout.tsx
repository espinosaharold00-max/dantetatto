"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Package,
  ShoppingCart,
  FileText,
  Star,
  Users,
  Mail,
  Settings,
  ArrowLeft,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: Calendar },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/emails", label: "Emails", icon: Mail },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-800 bg-neutral-900">
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
          <span className="text-lg font-bold text-white">Admin</span>
          <Link href="/" className="text-neutral-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {adminLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  );
}
