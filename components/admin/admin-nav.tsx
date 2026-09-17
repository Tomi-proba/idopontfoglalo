"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/admin/naptar", label: "Naptár" },
  { href: "/admin/ugyfelek", label: "Ügyfelek" },
  { href: "/admin/dolgozok", label: "Dolgozók" },
  { href: "/admin/beallitasok", label: "Beállítások" },
];

export function AdminNav({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/naptar" className="font-display text-[20px] font-black">
            Cetli<span className="text-stamp">.</span>
          </Link>
          <span className="hidden text-[14px] text-ink-soft sm:inline">{businessName}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[3px] px-3 py-2 text-[14px] font-semibold ${
                  active ? "bg-ink text-paper-raised-2" : "text-ink-soft hover:bg-paper-raised"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <form action={signOutAction}>
            <button
              type="submit"
              className="ml-1 rounded-[3px] px-3 py-2 text-[14px] font-semibold text-ink-soft hover:bg-paper-raised"
            >
              Kilépés
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
