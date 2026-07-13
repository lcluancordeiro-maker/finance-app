import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssetType } from "@/generated/prisma/client";

export async function GET() {
  const assets = await prisma.asset.findMany({
    include: { transactions: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
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

  const existing = await prisma.asset.findUnique({ where: { ticker: normalizedTicker } });
  if (existing) {
    return NextResponse.json({ error: "já existe um ativo com esse ticker" }, { status: 409 });
  }

  const asset = await prisma.asset.create({
    data: { ticker: normalizedTicker, name, type },
  });
  return NextResponse.json(asset, { status: 201 });
}
