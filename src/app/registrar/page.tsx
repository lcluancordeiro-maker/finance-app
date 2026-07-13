"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar conta.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">Criar conta</h1>
      <p className="mb-6 text-sm text-[#52514e] dark:text-[#c3c2b7]">
        Comece com R$ 10.000,00 virtuais para praticar investimentos.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-[#898781]">Pelo menos 6 caracteres.</p>
        </div>
        {error && <p className="text-sm text-[#d03b3b] dark:text-[#e66767]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[#52514e] dark:text-[#c3c2b7]">
        Já tem conta?{" "}
        <Link href="/login" className="text-[#2a78d6] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
