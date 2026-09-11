import { describe, it, expect } from "vitest";
import { createMarketIdentity } from "../../src/core/marketIdentity.js";
import { ScopeGate, type EvidenceRef } from "../../src/core/scopeGate.js";

describe("ScopeGate", () => {
  const identity = createMarketIdentity({
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

  it("ACCEPT: strictly valid evidence for target market window", () => {
    const validEvidence: EvidenceRef[] = [
      {
        id: "fill-1",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047190,
        source: "fills",
        sourceId: "fill-1",
        data: { price: 0.65, size: 10 },
      },
      {
        id: "fill-2",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047230,
        source: "fills",
        sourceId: "fill-2",
        data: { price: 0.68, size: 5 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, validEvidence);
    expect(verdict.state).toBe("ACCEPT");
    expect(verdict.accepted.length).toBe(2);
    expect(verdict.offending.length).toBe(0);
  });

  it("REJECT: rejects foreign market rows sharing the same pool", () => {
    const contaminatedEvidence: EvidenceRef[] = [
      {
        id: "fill-valid",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047190,
        source: "fills",
        sourceId: "fill-valid",
        data: { price: 0.65, size: 10 },
      },
      {
        id: "fill-foreign-recycled-pool",
        marketId: "0x000000000000000000000000000000000000000000000000000000000001925d", // Prior BTC 60s market on same pool
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047080,
        source: "fills",
        sourceId: "fill-foreign-recycled-pool",
        data: { price: 0.42, size: 50 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, contaminatedEvidence);
    expect(verdict.state).toBe("REJECT");
    expect(verdict.accepted.length).toBe(1);
    expect(verdict.offending.length).toBe(1);
    expect(verdict.offending[0].code).toBe("MARKET_MISMATCH");
  });

  it("REJECT: fails closed on missing marketId provenance", () => {
    const missingProvenanceEvidence: EvidenceRef[] = [
      {
        id: "fill-no-provenance",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047200,
        source: "fills",
        sourceId: "fill-no-provenance",
        data: { price: 0.55 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, missingProvenanceEvidence);
    expect(verdict.state).toBe("REJECT");
    expect(verdict.offending[0].code).toBe("PROVENANCE_MISSING");
  });

  it("REJECT: fails on out-of-window timestamp even with matching marketId", () => {
    const outOfWindowEvidence: EvidenceRef[] = [
      {
        id: "fill-out-of-window",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047300, // Beyond expiry (1789047240)
        source: "fills",
        sourceId: "fill-out-of-window",
        data: { price: 0.55 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, outOfWindowEvidence);
    expect(verdict.state).toBe("REJECT");
    expect(verdict.offending[0].code).toBe("TEMPORAL_OUT_OF_BOUNDS");
  });
});
