import { describe, expect, it } from "vitest";
import { computePosition, type TxLike } from "@/lib/portfolio";

function tx(overrides: Partial<TxLike> & Pick<TxLike, "type" | "quantity" | "price">): TxLike {
  return { date: new Date("2026-01-01"), ...overrides };
}

describe("computePosition", () => {
  it("retorna posição zerada sem transações", () => {
    const position = computePosition([]);
    expect(position).toEqual({ quantity: 0, avgPrice: 0, costBasis: 0, realizedProfit: 0 });
  });

  it("uma única compra define quantidade e preço médio", () => {
    const position = computePosition([tx({ type: "COMPRA", quantity: 10, price: 20 })]);
    expect(position.quantity).toBe(10);
    expect(position.avgPrice).toBe(20);
    expect(position.costBasis).toBe(200);
    expect(position.realizedProfit).toBe(0);
  });

  it("múltiplas compras calculam o preço médio ponderado", () => {
    const position = computePosition([
      tx({ type: "COMPRA", quantity: 10, price: 20, date: new Date("2026-01-01") }),
      tx({ type: "COMPRA", quantity: 10, price: 30, date: new Date("2026-01-02") }),
    ]);
    expect(position.quantity).toBe(20);
    expect(position.avgPrice).toBe(25);
    expect(position.costBasis).toBe(500);
  });

  it("venda parcial com lucro calcula o lucro realizado sem alterar o preço médio", () => {
    const position = computePosition([
      tx({ type: "COMPRA", quantity: 10, price: 20, date: new Date("2026-01-01") }),
      tx({ type: "VENDA", quantity: 4, price: 25, date: new Date("2026-01-02") }),
    ]);
    expect(position.quantity).toBe(6);
    expect(position.avgPrice).toBe(20);
    expect(position.realizedProfit).toBe(20); // (25 - 20) * 4
    expect(position.costBasis).toBe(120);
  });

  it("venda parcial com prejuízo calcula lucro realizado negativo", () => {
    const position = computePosition([
      tx({ type: "COMPRA", quantity: 10, price: 20, date: new Date("2026-01-01") }),
      tx({ type: "VENDA", quantity: 4, price: 15, date: new Date("2026-01-02") }),
    ]);
    expect(position.realizedProfit).toBe(-20); // (15 - 20) * 4
  });

  it("vender toda a posição zera quantidade e preço médio", () => {
    const position = computePosition([
      tx({ type: "COMPRA", quantity: 10, price: 20, date: new Date("2026-01-01") }),
      tx({ type: "VENDA", quantity: 10, price: 25, date: new Date("2026-01-02") }),
    ]);
    expect(position.quantity).toBe(0);
    expect(position.avgPrice).toBe(0);
    expect(position.costBasis).toBe(0);
    expect(position.realizedProfit).toBe(50);
  });

  it("vender mais do que a posição não deixa quantidade negativa", () => {
    const position = computePosition([
      tx({ type: "COMPRA", quantity: 5, price: 20, date: new Date("2026-01-01") }),
      tx({ type: "VENDA", quantity: 8, price: 25, date: new Date("2026-01-02") }),
    ]);
    expect(position.quantity).toBe(0);
    expect(position.avgPrice).toBe(0);
  });

  it("recalcula o preço médio do zero após zerar e comprar de novo", () => {
    const position = computePosition([
      tx({ type: "COMPRA", quantity: 10, price: 20, date: new Date("2026-01-01") }),
      tx({ type: "VENDA", quantity: 10, price: 25, date: new Date("2026-01-02") }),
      tx({ type: "COMPRA", quantity: 5, price: 40, date: new Date("2026-01-03") }),
    ]);
    expect(position.quantity).toBe(5);
    expect(position.avgPrice).toBe(40);
    expect(position.realizedProfit).toBe(50);
  });

  it("calcula corretamente independente da ordem de entrada (ordena por data internamente)", () => {
    const position = computePosition([
      tx({ type: "VENDA", quantity: 4, price: 25, date: new Date("2026-01-02") }),
      tx({ type: "COMPRA", quantity: 10, price: 20, date: new Date("2026-01-01") }),
    ]);
    expect(position.quantity).toBe(6);
    expect(position.avgPrice).toBe(20);
    expect(position.realizedProfit).toBe(20);
  });
});
