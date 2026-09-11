import { describe, it, expect } from "vitest";
import { createMarketIdentity } from "../src/core/marketIdentity";
import { HistoryAdapter, type RawHistoryRow } from "../src/core/historyAdapter";
import { createExecutionSeal, verifyExecutionSeal, computeIntentHash } from "../src/core/executionSeal";
import { verifyDecisionReceipt } from "../src/core/decisionReceipt";

describe("Adversarial Replay & Tampering Suite", () => {
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

  const validRows: RawHistoryRow[] = [
    {
      id: "fill-1",
      marketId: identity.marketId,
      poolAddress: identity.poolAddress,
      timestamp: 1789047200,
      price: 0.65,
      size: 10,
      side: "YES",
      source: "fills",
    },
  ];

  const evalResult = HistoryAdapter.readMarketHistory(identity, validRows, {
    action: "BUY_YES",
    confidence: 0.85,
    price: 0.65,
    rationale: "Clean context",
  });

  it("Replay Attack: Rejects tampered receipt hash in execution seal", () => {
    const seal = createExecutionSeal({
      receipt: evalResult.receipt,
      signer: "0xe4B713e3cF2E550147f9cc09d751f276E7B9A64e",
      side: "BUY_YES",
      amount: 10,
      price: 0.65,
      orderExpiry: 1789047240,
    });

    const tamperedSeal = {
      ...seal,
      intent: {
        ...seal.intent,
        receiptHash: "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      },
    };

    const verification = verifyExecutionSeal(tamperedSeal, evalResult.receipt);
    expect(verification.isValid).toBe(false);
    expect(verification.reasons.some((r) => r.includes("Receipt hash mismatch"))).toBe(true);
  });

  it("Tampering Attack: Detects single byte change in receipt proof", () => {
    const rawReceipt = JSON.parse(JSON.stringify(evalResult.receipt));
    // Alter 1 character in evidenceHash
    rawReceipt.proof.evidenceHash =
      rawReceipt.proof.evidenceHash.slice(0, -1) + (rawReceipt.proof.evidenceHash.endsWith("a") ? "b" : "a");

    const v = verifyDecisionReceipt(rawReceipt);
    expect(v.isValid).toBe(false);
    expect(v.reasons.some((r) => r.includes("Evidence hash mismatch"))).toBe(true);
  });

  it("Tampering Attack: Detects altered execution intent price or amount", () => {
    const seal = createExecutionSeal({
      receipt: evalResult.receipt,
      signer: "0xe4B713e3cF2E550147f9cc09d751f276E7B9A64e",
      side: "BUY_YES",
      amount: 10,
      price: 0.65,
      orderExpiry: 1789047240,
    });

    // Attacker modifies amount from 10 to 100 without recomputing hash
    const tamperedAmount = {
      ...seal,
      intent: {
        ...seal.intent,
        amount: 100, // Tampered!
      },
    };

    const verification = verifyExecutionSeal(tamperedAmount, evalResult.receipt);
    expect(verification.isValid).toBe(false);
    expect(verification.reasons.some((r) => r.includes("Intent hash mismatch"))).toBe(true);
  });
});
