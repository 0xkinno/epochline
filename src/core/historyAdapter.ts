import type { MarketIdentity } from "./marketIdentity";
import { ScopeGate, type EvidenceRef, type ScopeVerdict } from "./scopeGate";
import { buildDecisionReceipt, type DecisionReceipt } from "./decisionReceipt";

export interface RawHistoryRow {
  id: string;
  marketId?: string;
  poolAddress?: string;
  timestamp: number;
  blockNumber?: number;
  price: number;
  size: number;
  side: "BUY" | "SELL" | "YES" | "NO";
  source: "fills" | "candles" | "orders";
  type?: string;
}

export interface PoolHistoryResult {
  poolAddress: string;
  totalRows: number;
  rows: RawHistoryRow[];
  distinctMarketIds: string[];
  isContaminated: boolean;
}

export interface MarketHistoryResult {
  identity: MarketIdentity;
  verdict: ScopeVerdict;
  receipt: DecisionReceipt;
  acceptedRows: RawHistoryRow[];
  rejectedRows: RawHistoryRow[];
}

export class HistoryAdapter {
  public static readPoolHistory(poolAddress: string, rows: RawHistoryRow[]): PoolHistoryResult {
    const poolRows = rows.filter((r) => !r.poolAddress || r.poolAddress.toLowerCase() === poolAddress.toLowerCase());
    const distinctMarkets = Array.from(new Set(poolRows.map((r) => r.marketId).filter(Boolean) as string[]));

    return {
      poolAddress,
      totalRows: poolRows.length,
      rows: poolRows,
      distinctMarketIds: distinctMarkets,
      isContaminated: distinctMarkets.length > 1,
    };
  }

  public static readMarketHistory(
    identity: MarketIdentity,
    rows: RawHistoryRow[],
    decisionProposal?: {
      action: "BUY_YES" | "BUY_NO" | "HOLD";
      confidence: number;
      price: number;
      rationale: string;
    }
  ): MarketHistoryResult {
    const evidenceList: EvidenceRef[] = rows.map((r) => ({
      id: r.id,
      marketId: r.marketId,
      poolAddress: r.poolAddress || identity.poolAddress,
      blockNumber: r.blockNumber || Number(identity.capturedAtBlock),
      timestamp: r.timestamp,
      source: r.source,
      sourceId: r.id,
      data: {
        price: r.price,
        size: r.size,
        side: r.side,
      },
    }));

    const verdict = ScopeGate.evaluate(identity, evidenceList);

    const receipt = buildDecisionReceipt({
      identity,
      verdict,
      decisionProposal,
    });

    const acceptedIds = new Set(verdict.accepted.map((a) => a.id));
    const acceptedRows = rows.filter((r) => acceptedIds.has(r.id));
    const rejectedRows = rows.filter((r) => !acceptedIds.has(r.id));

    return {
      identity,
      verdict,
      receipt,
      acceptedRows,
      rejectedRows,
    };
  }
}
