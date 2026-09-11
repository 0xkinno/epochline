import type { MarketIdentity } from "./marketIdentity";

export type EvidenceSource = "fills" | "candles" | "orders" | "market" | "oracle" | "onchain";

export interface EvidenceRef {
  id: string;
  marketId?: string;
  poolAddress?: string;
  blockNumber?: number;
  logIndex?: number;
  timestamp?: number;
  source: EvidenceSource;
  sourceId: string;
  data: Record<string, any>;
}

export interface OffendingEvidence {
  evidence: EvidenceRef;
  reason: string;
  code: "MARKET_MISMATCH" | "POOL_MISMATCH" | "TEMPORAL_OUT_OF_BOUNDS" | "PROVENANCE_MISSING" | "DATA_CORRUPTED";
}

export type ScopeVerdict =
  | {
      state: "ACCEPT";
      reason: string;
      accepted: EvidenceRef[];
      offending: [];
      totalEvaluated: number;
    }
  | {
      state: "REJECT";
      reason: string;
      accepted: EvidenceRef[];
      offending: OffendingEvidence[];
      totalEvaluated: number;
    }
  | {
      state: "INCOMPLETE";
      reason: string;
      accepted: [];
      offending: [];
      totalEvaluated: number;
    };

export class ScopeGate {
  public static evaluate(identity: MarketIdentity, evidenceList: EvidenceRef[]): ScopeVerdict {
    if (!evidenceList || !Array.isArray(evidenceList)) {
      return {
        state: "INCOMPLETE",
        reason: "Evidence list is empty or malformed",
        accepted: [],
        offending: [],
        totalEvaluated: 0,
      };
    }

    if (evidenceList.length === 0) {
      return {
        state: "INCOMPLETE",
        reason: "No evidence items provided to evaluate",
        accepted: [],
        offending: [],
        totalEvaluated: 0,
      };
    }

    const accepted: EvidenceRef[] = [];
    const offending: OffendingEvidence[] = [];

    const targetMarketId = identity.marketId.toLowerCase();
    const targetPool = identity.poolAddress.toLowerCase();
    const start = Number(identity.tradingStart);
    const end = Number(identity.expiry);

    for (const item of evidenceList) {
      if (!item.marketId || typeof item.marketId !== "string") {
        offending.push({
          evidence: item,
          reason: `Missing canonical marketId on evidence item ${item.id}`,
          code: "PROVENANCE_MISSING",
        });
        continue;
      }

      if (item.marketId.toLowerCase() !== targetMarketId) {
        offending.push({
          evidence: item,
          reason: `Market ID mismatch: item belongs to ${item.marketId}, expected target market ${identity.marketId}`,
          code: "MARKET_MISMATCH",
        });
        continue;
      }

      if (item.poolAddress && item.poolAddress.toLowerCase() !== targetPool) {
        offending.push({
          evidence: item,
          reason: `Pool address mismatch: item pool ${item.poolAddress} does not match target identity pool ${identity.poolAddress}`,
          code: "POOL_MISMATCH",
        });
        continue;
      }

      if (item.timestamp !== undefined && item.timestamp !== null) {
        const itemTs = Number(item.timestamp);
        if (isNaN(itemTs) || itemTs < start || itemTs > end) {
          offending.push({
            evidence: item,
            reason: `Temporal boundary violation: item timestamp (${itemTs}) outside target market window [${start}, ${end}]`,
            code: "TEMPORAL_OUT_OF_BOUNDS",
          });
          continue;
        }
      }

      accepted.push(item);
    }

    if (offending.length > 0) {
      return {
        state: "REJECT",
        reason: `REFUSED: ${offending.length} evidence item(s) failed provenance & temporal validation. Offending codes: ${Array.from(new Set(offending.map((o) => o.code))).join(", ")}`,
        accepted,
        offending,
        totalEvaluated: evidenceList.length,
      };
    }

    return {
      state: "ACCEPT",
      reason: `ACCEPTED: All ${accepted.length} evidence item(s) strictly match market ${identity.marketId} window [${start}, ${end}]`,
      accepted,
      offending: [],
      totalEvaluated: evidenceList.length,
    };
  }
}
