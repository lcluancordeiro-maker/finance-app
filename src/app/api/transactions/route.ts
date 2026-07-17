import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import { requireAuth, HttpError } from "@/lib/auth";
import { placeOrder } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { assetId, type, quantity, price, notes } = body ?? {};

    if (!assetId || typeof assetId !== "string") {
      return NextResponse.json({ error: "assetId é obrigatório" }, { status: 400 });
    }
    if (!type || !(Object.values(TransactionType) as string[]).includes(type)) {
      return NextResponse.json({ error: "type inválido" }, { status: 400 });
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json({ error: "quantity deve ser maior que zero" }, { status: 400 });
    }

    const transaction = await placeOrder({
      userId,
      assetId,
      type,
      quantity,
      price: typeof price === "number" ? price : undefined,
      notes: typeof notes === "string" ? notes : undefined,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
