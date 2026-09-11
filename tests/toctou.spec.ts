import { describe, it, expect } from "vitest";
import { createMarketIdentity } from "../src/core/marketIdentity";
import { HistoryAdapter, type RawHistoryRow } from "../src/core/historyAdapter";
import { createExecutionSeal, verifyExecutionSeal } from "../src/core/executionSeal";

describe("TOCTOU & Cross-Epoch Replay Defense", () => {
  // Target Market A (ETH 60s at epoch T)
  const marketA = createMarketIdentity({
    marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
    symbol: "ETH 60s",
    asset: "ETH",
    intervalSec: 60,
    tradingStart: 1789047180,
    expiry: 1789047240,
    marketAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
    poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
    capturedAtBlock: 484739551,
  });

  // Successor Market B (BTC 60s at epoch T+1 recycling the same pool!)
  const marketB = createMarketIdentity({
    marketId: "0x0000000000000000000000000000000000000000000000000000000000019265",
    symbol: "BTC 60s",
    asset: "BTC",
    intervalSec: 60,
    tradingStart: 1789047240,
    expiry: 1789047300,
    marketAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
    poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f", // SAME RECYCLED POOL
    capturedAtBlock: 484739600,
  });

  const validRowsMarketA: RawHistoryRow[] = [
    {
      id: "fill-marketA-1",
      marketId: marketA.marketId,
      poolAddress: marketA.poolAddress,
      timestamp: 1789047190,
      price: 0.65,
      size: 10,
      side: "YES",
      source: "fills",
    },
  ];

  it("Scenario 1: Validate Market A -> Pool Recycles to Market B -> Replay Receipt on Market B fails", () => {
    // 1. Generate valid receipt for Market A
    const evalA = HistoryAdapter.readMarketHistory(marketA, validRowsMarketA, {
      action: "BUY_YES",
      confidence: 0.9,
      price: 0.65,
      rationale: "Clean Market A context",
    });

    expect(evalA.receipt.state).toBe("VALID");

    // 2. Create ExecutionSeal bound to Market A
    const sealA = createExecutionSeal({
      receipt: evalA.receipt,
      signer: "0xe4B713e3cF2E550147f9cc09d751f276E7B9A64e",
      side: "BUY_YES",
      amount: 10,
      price: 0.65,
      orderExpiry: 1789047240,
    });

    // 3. Attacker attempts to replay sealA or receiptA against successor Market B sharing the pool
    // Evaluating sealA against Market B receipt MUST fail!
    const evalB = HistoryAdapter.readMarketHistory(marketB, [
      {
        id: "fill-marketB-1",
        marketId: marketB.marketId,
        poolAddress: marketB.poolAddress,
        timestamp: 1789047250,
        price: 0.50,
        size: 20,
        side: "NO",
        source: "fills",
      },
    ]);

    const verificationAgainstMarketB = verifyExecutionSeal(sealA, evalB.receipt);
    expect(verificationAgainstMarketB.isValid).toBe(false);
    expect(
      verificationAgainstMarketB.reasons.some((r) => r.includes("Market ID mismatch") || r.includes("Receipt hash mismatch"))
    ).toBe(true);
  });

  it("Scenario 2: Preflight blocks execution if order expiry exceeds market expiry", () => {
    const evalA = HistoryAdapter.readMarketHistory(marketA, validRowsMarketA);

    expect(() =>
      createExecutionSeal({
        receipt: evalA.receipt,
        signer: "0xe4B713e3cF2E550147f9cc09d751f276E7B9A64e",
        side: "BUY_YES",
        amount: 10,
        price: 0.65,
        orderExpiry: 1789047300, // Exceeds Market A expiry (1789047240)
      })
    ).toThrow(/exceeds market expiry/);
  });
});
