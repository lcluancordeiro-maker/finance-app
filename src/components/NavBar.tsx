"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  userName: string;
};

export function NavBar({ userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Carteira" },
    { href: "/licoes", label: "Lições" },
  ];

  return (
    <header className="border-b border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)]">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <nav className="flex items-center gap-4">
          <span className="text-sm font-semibold">Meridiano Finanças</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? "text-[#2a78d6] font-medium"
                  : "text-[#52514e] dark:text-[#c3c2b7] hover:underline"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          <span>{userName}</span>
          <button onClick={handleLogout} className="text-[#d03b3b] hover:underline">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
