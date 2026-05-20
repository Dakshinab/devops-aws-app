"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-stone-200 px-6 py-4 text-sm sm:px-10 lg:px-12">
      <Link href="/" className="font-semibold text-stone-900 hover:text-stone-600">
        Serene Stay
      </Link>
      <nav className="flex gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "font-semibold text-stone-900"
                : "text-stone-500 transition hover:text-stone-900"
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}