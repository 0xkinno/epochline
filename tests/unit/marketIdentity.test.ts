import { describe, it, expect } from "vitest";
import { createMarketIdentity, computeMarketIdentityHash, isTimestampInMarketWindow } from "../../src/core/marketIdentity.js";

describe("MarketIdentity", () => {
  it("creates a canonical market identity with valid inputs", () => {
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

    expect(identity.symbol).toBe("ETH 60s");
    expect(identity.asset).toBe("ETH");
    expect(identity.tradingStart).toBe(1789047180n);
    expect(identity.expiry).toBe(1789047240n);
    expect(identity.yesId).toBe(0n);
    expect(identity.noId).toBe(1n);
  });

  it("throws on invalid marketId, poolAddress, or temporal boundaries", () => {
    expect(() =>
      createMarketIdentity({
        marketId: "invalid-hex",
        symbol: "ETH 60s",
        asset: "ETH",
        intervalSec: 60,
        tradingStart: 1789047180,
        expiry: 1789047240,
        marketAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        capturedAtBlock: 484739551,
      })
    ).toThrow();

    expect(() =>
      createMarketIdentity({
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
        symbol: "ETH 60s",
        asset: "ETH",
        intervalSec: 60,
        tradingStart: 1789047240,
        expiry: 1789047180, // Start > Expiry!
        marketAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
        poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
        capturedAtBlock: 484739551,
      })
    ).toThrow();
  });

  it("produces deterministic keccak256 identity hash", () => {
    const identity1 = createMarketIdentity({
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

    const identity2 = createMarketIdentity({
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

    const hash1 = computeMarketIdentityHash(identity1);
    const hash2 = computeMarketIdentityHash(identity2);
    expect(hash1).toBe(hash2);
    expect(hash1.startsWith("0x")).toBe(true);
  });

  it("checks temporal validity correctly", () => {
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

    expect(isTimestampInMarketWindow(identity, 1789047180)).toBe(true);
    expect(isTimestampInMarketWindow(identity, 1789047200)).toBe(true);
    expect(isTimestampInMarketWindow(identity, 1789047240)).toBe(true);
    expect(isTimestampInMarketWindow(identity, 1789047179)).toBe(false);
    expect(isTimestampInMarketWindow(identity, 1789047241)).toBe(false);
  });
});
