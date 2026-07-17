import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Muitas tentativas de login. Tente novamente em ${minutes} minuto(s).` },
      { status: 429 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const lockedOut = failedLoginAttempts >= MAX_FAILED_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lockedOut ? 0 : failedLoginAttempts,
        lockedUntil: lockedOut ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });
    if (lockedOut) {
      return NextResponse.json(
        { error: `Muitas tentativas de login. Tente novamente em ${LOCK_DURATION_MS / 60000} minuto(s).` },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  const token = await createSessionToken(user.id);
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
