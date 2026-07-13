import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const body = await request.json();
  const { assetId, type, quantity, price, date, notes } = body ?? {};

  if (!assetId || typeof assetId !== "string") {
    return NextResponse.json({ error: "assetId é obrigatório" }, { status: 400 });
  }
  if (!type || !(Object.values(TransactionType) as string[]).includes(type)) {
    return NextResponse.json({ error: "type inválido" }, { status: 400 });
  }
  if (typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json({ error: "quantity deve ser maior que zero" }, { status: 400 });
  }
  if (typeof price !== "number" || price <= 0) {
    return NextResponse.json({ error: "price deve ser maior que zero" }, { status: 400 });
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return NextResponse.json({ error: "ativo não encontrado" }, { status: 404 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      assetId,
      type,
      quantity,
      price,
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
    },
  });
  return NextResponse.json(transaction, { status: 201 });
}
