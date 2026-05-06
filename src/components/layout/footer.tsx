import Link from "next/link";
import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-white">DANTE TATTO</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Haciendo amigos, no clientes.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://instagram.com/dantetatto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 transition-colors hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/dantetatto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 transition-colors hover:text-white"
              >
                Facebook
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-300">
              Navegación
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/agenda", label: "Agendar cita" },
                { href: "/tienda", label: "Tienda" },
                { href: "/blog", label: "Blog" },
                { href: "/sobre-mi", label: "Sobre mí" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-300">
              Tienda
            </h4>
            <ul className="space-y-2">
              {["Cremas", "Protectores", "Jabones", "Kits"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/tienda?category=${cat.toLowerCase()}`}
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-neutral-300">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ||
                    "Dirección del estudio"}
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE}`}
                  className="hover:text-white"
                >
                  {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "Teléfono"}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_BUSINESS_EMAIL}`}
                  className="hover:text-white"
                >
                  {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "Email"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Dante Tatto. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
