import { describe, it, expect } from "vitest";
import { createMarketIdentity } from "../src/core/marketIdentity.js";
import { HistoryAdapter, type RawHistoryRow } from "../src/core/historyAdapter.js";
import { ScopeGate, type EvidenceRef } from "../src/core/scopeGate.js";
import { buildDecisionReceipt, verifyDecisionReceipt } from "../src/core/decisionReceipt.js";

describe("Adversarial Break Tests (Contamination, Injection & Tampering)", () => {
  const targetMarket = createMarketIdentity({
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

  it("Attack A: Reused-pool adjacent market contamination", () => {
    // 5 clean rows from target market + 5 contaminated rows from prior market sharing the pool
    const mixedRows: RawHistoryRow[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `target-row-${i}`,
        marketId: targetMarket.marketId,
        poolAddress: targetMarket.poolAddress,
        timestamp: 1789047185 + i * 5,
        price: 0.6 + i * 0.02,
        size: 10,
        side: "YES" as const,
        source: "fills" as const,
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `recycled-pool-foreign-row-${i}`,
        marketId: "0x000000000000000000000000000000000000000000000000000000000001925d", // Previous BTC market
        poolAddress: targetMarket.poolAddress,
        timestamp: 1789047065 + i * 5,
        price: 0.3 + i * 0.01,
        size: 50,
        side: "NO" as const,
        source: "fills" as const,
      })),
    ];

    // Baseline accepts all 10 rows
    const baseline = HistoryAdapter.readPoolHistory(targetMarket.poolAddress, mixedRows);
    expect(baseline.totalRows).toBe(10);
    expect(baseline.isContaminated).toBe(true);

    // EPOCHLINE detects 5 foreign rows, marks state as REJECT, produces REFUSED receipt
    const epochline = HistoryAdapter.readMarketHistory(targetMarket, mixedRows, {
      action: "BUY_YES",
      confidence: 0.9,
      price: 0.65,
      rationale: "Unsafe signal",
    });

    expect(epochline.verdict.state).toBe("REJECT");
    expect(epochline.receipt.state).toBe("REFUSED");
    expect(epochline.receipt.decision.action).toBe("REFUSE");
    expect(epochline.rejectedRows.length).toBe(5);
    expect(epochline.acceptedRows.length).toBe(5);
  });

  it("Attack B: Foreign asset / cross-venue injection", () => {
    const injectedRows: RawHistoryRow[] = [
      {
        id: "legit-eth-fill",
        marketId: targetMarket.marketId,
        poolAddress: targetMarket.poolAddress,
        timestamp: 1789047200,
        price: 0.62,
        size: 5,
        side: "YES",
        source: "fills",
      },
      {
        id: "injected-btc-fill",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019259", // Foreign BTC 900s market
        poolAddress: "0x28dd287412281e5986bc7b78ecc69ac16c4977ad",
        timestamp: 1789047210,
        price: 0.91,
        size: 100,
        side: "YES",
        source: "fills",
      },
    ];

    const result = HistoryAdapter.readMarketHistory(targetMarket, injectedRows);
    expect(result.verdict.state).toBe("REJECT");
    expect(result.verdict.offending.some((o) => o.code === "MARKET_MISMATCH")).toBe(true);
    expect(result.receipt.state).toBe("REFUSED");
  });

  it("Attack C: Tampered receipt hash or payload detection", () => {
    const cleanRows: RawHistoryRow[] = [
      {
        id: "fill-clean",
        marketId: targetMarket.marketId,
        poolAddress: targetMarket.poolAddress,
        timestamp: 1789047200,
        price: 0.65,
        size: 10,
        side: "YES",
        source: "fills",
      },
    ];

    const result = HistoryAdapter.readMarketHistory(targetMarket, cleanRows, {
      action: "BUY_YES",
      confidence: 0.85,
      price: 0.65,
      rationale: "Clean execution context",
    });

    expect(result.receipt.state).toBe("VALID");

    // Case 1: Tampered decision action
    const tamperedAction = {
      ...result.receipt,
      decision: { ...result.receipt.decision, action: "BUY_NO" as const },
    };
    expect(verifyDecisionReceipt(tamperedAction).isValid).toBe(false);

    // Case 2: Invariant forgery (marked VALID while having rejected items)
    const forgedValid = {
      ...result.receipt,
      input: {
        ...result.receipt.input,
        rejectedCount: 1,
        rejectedEvidence: [
          {
            evidence: {
              id: "fake",
              source: "fills" as const,
              sourceId: "fake",
              data: {},
            },
            reason: "forged",
            code: "MARKET_MISMATCH" as const,
          },
        ],
      },
    };
    const forgeryCheck = verifyDecisionReceipt(forgedValid);
    expect(forgeryCheck.isValid).toBe(false);
    expect(forgeryCheck.reasons.some((r) => r.includes("Invariant violated"))).toBe(true);
  });
});
