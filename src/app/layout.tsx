import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meridiano Finanças — Educação e Investimentos Simulados",
  description: "Aprenda economia e finanças e pratique investimentos com dinheiro virtual e cotações reais",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2a78d6",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getSessionUserId();
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f9f9f7] text-[#0b0b0b] dark:bg-[#0d0d0d] dark:text-[#ffffff]">
        {user && <NavBar userName={user.name} />}
        {children}
      </body>
    </html>
  );
}
