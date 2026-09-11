import { describe, it, expect } from "vitest";
import { createMarketIdentity } from "../../src/core/marketIdentity.js";
import { HistoryAdapter, type RawHistoryRow } from "../../src/core/historyAdapter.js";

describe("HistoryAdapter", () => {
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

  const mixedPoolRows: RawHistoryRow[] = [
    {
      id: "row-1",
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019262", // Target ETH 60s
      poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
      timestamp: 1789047200,
      price: 0.65,
      size: 10,
      side: "YES",
      source: "fills",
    },
    {
      id: "row-2",
      marketId: "0x000000000000000000000000000000000000000000000000000000000001925d", // Prior BTC 60s sharing pool!
      poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
      timestamp: 1789047080,
      price: 0.35,
      size: 50,
      side: "NO",
      source: "fills",
    },
    {
      id: "row-3",
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019248", // Prior ETH 300s sharing pool!
      poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
      timestamp: 1789046800,
      price: 0.52,
      size: 25,
      side: "YES",
      source: "fills",
    },
  ];

  it("Baseline readPoolHistory accepts mixed cross-market rows", () => {
    const baseline = HistoryAdapter.readPoolHistory("0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f", mixedPoolRows);
    expect(baseline.totalRows).toBe(3);
    expect(baseline.distinctMarketIds.length).toBe(3);
    expect(baseline.isContaminated).toBe(true);
  });

  it("EPOCHLINE readMarketHistory refuses mixed rows and produces a REFUSED receipt", () => {
    const result = HistoryAdapter.readMarketHistory(identity, mixedPoolRows);
    expect(result.verdict.state).toBe("REJECT");
    expect(result.receipt.state).toBe("REFUSED");
    expect(result.acceptedRows.length).toBe(1);
    expect(result.rejectedRows.length).toBe(2);
  });
});
