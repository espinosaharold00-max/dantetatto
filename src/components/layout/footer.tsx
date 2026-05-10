import Link from "next/link";
import Image from "next/image";

import { MapPin, Phone, Mail } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-brand-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Dante Tattoo" width={40} height={40} className="rounded-full" />
              <h3 className="text-lg font-bold text-brand-amber">DANTE TATTOO</h3>
            </div>
            <p className="mt-3 text-sm text-neutral-400">
              Haciendo amigos, no clientes.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://www.instagram.com/dantetattoo507/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-brand-amber"
              >
                <InstagramIcon className="h-4 w-4" />
                @dantetattoo507
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-brand-cream">
              Navegacion
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/agenda", label: "Agendar cita" },
                { href: "/tienda", label: "Tienda" },
                { href: "/blog", label: "Blog" },
                { href: "/sobre-mi", label: "Sobre mi" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-brand-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Image src="/images/logo-polylove.png" alt="Poly Love" width={28} height={28} className="rounded-full object-cover" />
              <h4 className="text-sm font-semibold uppercase text-brand-pink">
                Poly Love
              </h4>
            </div>
            <p className="mb-2 text-xs text-neutral-400">Tattoo After Care</p>
            <ul className="space-y-2">
              {["Cremas", "Protectores", "Jabones", "Kits"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/tienda?category=${cat.toLowerCase()}`}
                    className="text-sm text-neutral-400 transition-colors hover:text-brand-pink"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-brand-cream">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="h-4 w-4 shrink-0 text-brand-amber" />
                <span>
                  {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ||
                    "Panama City, PTY"}
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <Phone className="h-4 w-4 shrink-0 text-brand-amber" />
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE}`}
                  className="hover:text-brand-amber"
                >
                  {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "Telefono"}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <Mail className="h-4 w-4 shrink-0 text-brand-amber" />
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_BUSINESS_EMAIL}`}
                  className="hover:text-brand-amber"
                >
                  {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "Email"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-xs text-neutral-400">
          <span className="text-neutral-400">Since 2017</span>
          {" — "}
          © {new Date().getFullYear()} Dante Tattoo. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
