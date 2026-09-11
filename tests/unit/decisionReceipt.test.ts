import { describe, it, expect } from "vitest";
import { createMarketIdentity } from "../../src/core/marketIdentity.js";
import { ScopeGate, type EvidenceRef } from "../../src/core/scopeGate.js";
import { buildDecisionReceipt, verifyDecisionReceipt } from "../../src/core/decisionReceipt.js";

describe("DecisionReceipt", () => {
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

  it("builds and verifies a VALID receipt with clean evidence", () => {
    const evidenceList: EvidenceRef[] = [
      {
        id: "fill-1",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047200,
        source: "fills",
        sourceId: "fill-1",
        data: { price: 0.65 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, evidenceList);
    const receipt = buildDecisionReceipt({
      identity,
      verdict,
      decisionProposal: {
        action: "BUY_YES",
        confidence: 0.85,
        price: 0.65,
        rationale: "Strong upward order-flow within clean ETH 60s market epoch.",
      },
    });

    expect(receipt.state).toBe("VALID");
    expect(receipt.decision.action).toBe("BUY_YES");

    const verification = verifyDecisionReceipt(receipt);
    expect(verification.isValid).toBe(true);
    expect(verification.reasons).toEqual([]);
  });

  it("builds a REFUSED receipt when contaminated and blocks BUY action", () => {
    const contaminatedList: EvidenceRef[] = [
      {
        id: "foreign-row",
        marketId: "0x000000000000000000000000000000000000000000000000000000000001925d",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047080,
        source: "fills",
        sourceId: "foreign-row",
        data: { price: 0.35 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, contaminatedList);
    const receipt = buildDecisionReceipt({
      identity,
      verdict,
      decisionProposal: {
        action: "BUY_YES",
        confidence: 0.9,
        price: 0.7,
        rationale: "Attempting to trade on mixed evidence.",
      },
    });

    expect(receipt.state).toBe("REFUSED");
    expect(receipt.decision.action).toBe("REFUSE");
    expect(receipt.input.rejectedCount).toBe(1);

    const verification = verifyDecisionReceipt(receipt);
    expect(verification.isValid).toBe(true);
  });

  it("detects tampering with receipt contents", () => {
    const evidenceList: EvidenceRef[] = [
      {
        id: "fill-1",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        timestamp: 1789047200,
        source: "fills",
        sourceId: "fill-1",
        data: { price: 0.65 },
      },
    ];

    const verdict = ScopeGate.evaluate(identity, evidenceList);
    const receipt = buildDecisionReceipt({
      identity,
      verdict,
      decisionProposal: {
        action: "BUY_YES",
        confidence: 0.85,
        price: 0.65,
        rationale: "Clean signal",
      },
    });

    // Tamper with decision price
    const tampered = {
      ...receipt,
      decision: {
        ...receipt.decision,
        price: 0.99, // Tampered!
      },
    };

    const verification = verifyDecisionReceipt(tampered);
    expect(verification.isValid).toBe(false);
    expect(verification.reasons.some((r) => r.includes("Receipt hash mismatch"))).toBe(true);
  });
});
