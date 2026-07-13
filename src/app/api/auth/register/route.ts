import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body ?? {};

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      portfolio: { create: {} },
    },
  });

  const token = await createSessionToken(user.id);
  const res = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 }
  );
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
