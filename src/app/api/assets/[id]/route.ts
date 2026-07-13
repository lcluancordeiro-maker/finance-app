import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, HttpError } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { currentPrice } = body ?? {};

    if (typeof currentPrice !== "number" || Number.isNaN(currentPrice) || currentPrice < 0) {
      return NextResponse.json({ error: "currentPrice deve ser um número válido" }, { status: 400 });
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: { currentPrice, quoteUpdatedAt: new Date() },
    });
    return NextResponse.json(asset);
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
