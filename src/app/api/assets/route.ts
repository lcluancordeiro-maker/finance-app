import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssetType } from "@/generated/prisma/client";
import { requireAuth, HttpError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await requireAuth();
    const assets = await prisma.asset.findMany({
      include: { transactions: { where: { portfolio: { userId } } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(assets);
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { ticker, name, type } = body ?? {};

    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json({ error: "ticker é obrigatório" }, { status: 400 });
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
    }
    if (!type || !(Object.values(AssetType) as string[]).includes(type)) {
      return NextResponse.json({ error: "type inválido" }, { status: 400 });
    }

    const normalizedTicker = type === AssetType.CRIPTO ? ticker.trim().toLowerCase() : ticker.trim().toUpperCase();

    // Catálogo de ativos é compartilhado entre usuários — se já existe, reaproveita em vez de bloquear.
    const existing = await prisma.asset.findUnique({ where: { ticker: normalizedTicker } });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const asset = await prisma.asset.create({
      data: { ticker: normalizedTicker, name, type },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
