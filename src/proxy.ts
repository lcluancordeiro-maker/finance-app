import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não configurado.");
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    /\.(png|svg|ico|jpg|jpeg|webmanifest)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  const isAuthPage = pathname === "/login" || pathname === "/registrar";

  if (isAuthPage) {
    if (authenticated) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
