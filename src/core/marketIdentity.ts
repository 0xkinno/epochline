import { keccak256, toHex, stringToHex, type Hex } from "viem";

export type MarketStatus = 0 | 1 | 2 | 3 | 4 | 5;

export const MARKET_STATUS_LABELS: Record<MarketStatus, string> = {
  0: "Listed",
  1: "Trading",
  2: "Locked",
  3: "Settling",
  4: "Resolved",
  5: "Voided",
};

export interface MarketIdentity {
  marketId: Hex;
  symbol: string;
  venueId: Hex;
  asset: string;
  intervalSec: number;
  tradingStart: bigint;
  expiry: bigint;
  marketAddress: `0x${string}`;
  poolAddress: `0x${string}`;
  outcomeToken: `0x${string}`;
  yesId: bigint;
  noId: bigint;
  oracleQuestionId?: string;
  capturedAtBlock: bigint;
}

export function createMarketIdentity(params: {
  marketId: string;
  symbol: string;
  venueId?: string;
  asset: string;
  intervalSec: number;
  tradingStart: bigint | number | string;
  expiry: bigint | number | string;
  marketAddress: string;
  poolAddress: string;
  outcomeToken?: string;
  yesId?: bigint | number | string;
  noId?: bigint | number | string;
  oracleQuestionId?: string;
  capturedAtBlock: bigint | number | string;
}): MarketIdentity {
  if (!params.marketId || !params.marketId.startsWith("0x")) {
    throw new Error(`Invalid marketId: ${params.marketId}`);
  }
  if (!params.poolAddress || !params.poolAddress.startsWith("0x") || params.poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Invalid poolAddress: ${params.poolAddress}`);
  }
  if (!params.marketAddress || !params.marketAddress.startsWith("0x")) {
    throw new Error(`Invalid marketAddress: ${params.marketAddress}`);
  }

  const start = BigInt(params.tradingStart);
  const end = BigInt(params.expiry);

  if (end <= start) {
    throw new Error(`Invalid temporal window: expiry (${end}) must be greater than tradingStart (${start})`);
  }

  return {
    marketId: params.marketId as Hex,
    symbol: params.symbol,
    venueId: (params.venueId as Hex) || ("0x0000000000000000000000000000000000000000000000000000000000000000" as Hex),
    asset: params.asset.toUpperCase(),
    intervalSec: Number(params.intervalSec),
    tradingStart: start,
    expiry: end,
    marketAddress: params.marketAddress as `0x${string}`,
    poolAddress: params.poolAddress as `0x${string}`,
    outcomeToken: (params.outcomeToken as `0x${string}`) || (params.marketAddress as `0x${string}`),
    yesId: params.yesId !== undefined ? BigInt(params.yesId) : 0n,
    noId: params.noId !== undefined ? BigInt(params.noId) : 1n,
    oracleQuestionId: params.oracleQuestionId,
    capturedAtBlock: BigInt(params.capturedAtBlock),
  };
}

export function computeMarketIdentityHash(identity: MarketIdentity): Hex {
  const canonicalString = JSON.stringify({
    marketId: identity.marketId.toLowerCase(),
    symbol: identity.symbol,
    venueId: identity.venueId.toLowerCase(),
    asset: identity.asset,
    intervalSec: identity.intervalSec,
    tradingStart: identity.tradingStart.toString(),
    expiry: identity.expiry.toString(),
    marketAddress: identity.marketAddress.toLowerCase(),
    poolAddress: identity.poolAddress.toLowerCase(),
    outcomeToken: identity.outcomeToken.toLowerCase(),
    yesId: identity.yesId.toString(),
    noId: identity.noId.toString(),
    oracleQuestionId: identity.oracleQuestionId || "",
  });

  return keccak256(stringToHex(canonicalString));
}

export function isTimestampInMarketWindow(identity: MarketIdentity, timestamp: number | bigint): boolean {
  const ts = BigInt(timestamp);
  return ts >= identity.tradingStart && ts <= identity.expiry;
}
