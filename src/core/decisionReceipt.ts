import { keccak256, stringToHex, type Hex } from "viem";
import type { MarketIdentity } from "./marketIdentity";
import { computeMarketIdentityHash } from "./marketIdentity";
import type { EvidenceRef, OffendingEvidence, ScopeVerdict } from "./scopeGate";

export interface DecisionAction {
  action: "BUY_YES" | "BUY_NO" | "HOLD" | "REFUSE";
  confidence: number;
  price: number;
  rationale: string;
  timestamp: number;
}

export interface DecisionReceipt {
  protocol: "EPOCHLINE";
  version: "1.0.0";
  state: "VALID" | "REFUSED" | "INCOMPLETE";
  market: {
    marketId: Hex;
    symbol: string;
    pool: `0x${string}`;
    tradingStart: string;
    expiry: string;
    capturedAtBlock: string;
  };
  input: {
    acceptedCount: number;
    rejectedCount: number;
    acceptedEvidence: EvidenceRef[];
    rejectedEvidence: OffendingEvidence[];
  };
  policy: {
    ruleset: "market-instance-v1";
    policyHash: Hex;
  };
  decision: DecisionAction;
  proof: {
    evidenceHash: Hex;
    marketIdentityHash: Hex;
    receiptHash: Hex;
  };
}

export function computeEvidenceHash(evidenceList: EvidenceRef[]): Hex {
  if (!evidenceList || evidenceList.length === 0) {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }

  const sorted = [...evidenceList].sort((a, b) => (a.id > b.id ? 1 : -1));
  const payload = JSON.stringify(
    sorted.map((item) => ({
      id: item.id,
      marketId: (item.marketId || "").toLowerCase(),
      poolAddress: (item.poolAddress || "").toLowerCase(),
      source: item.source,
      sourceId: item.sourceId,
      timestamp: item.timestamp,
      data: item.data,
    }))
  );

  return keccak256(stringToHex(payload));
}

export function computePolicyHash(ruleset: string = "market-instance-v1"): Hex {
  return keccak256(stringToHex(`EPOCHLINE_POLICY_${ruleset}`));
}

export function computeReceiptHash(receipt: Omit<DecisionReceipt, "proof"> & { proof: { evidenceHash: Hex; marketIdentityHash: Hex } }): Hex {
  const payload = JSON.stringify({
    protocol: receipt.protocol,
    version: receipt.version,
    state: receipt.state,
    market: receipt.market,
    acceptedCount: receipt.input.acceptedCount,
    rejectedCount: receipt.input.rejectedCount,
    evidenceHash: receipt.proof.evidenceHash,
    marketIdentityHash: receipt.proof.marketIdentityHash,
    decision: receipt.decision,
    policy: receipt.policy,
  });

  return keccak256(stringToHex(payload));
}

export function buildDecisionReceipt(params: {
  identity: MarketIdentity;
  verdict: ScopeVerdict;
  decisionProposal?: {
    action: "BUY_YES" | "BUY_NO" | "HOLD";
    confidence: number;
    price: number;
    rationale: string;
  };
}): DecisionReceipt {
  const { identity, verdict, decisionProposal } = params;

  const marketIdentityHash = computeMarketIdentityHash(identity);
  const evidenceHash = computeEvidenceHash(verdict.accepted);
  const policyHash = computePolicyHash("market-instance-v1");

  let state: "VALID" | "REFUSED" | "INCOMPLETE";
  let finalDecision: DecisionAction;

  if (verdict.state === "REJECT") {
    state = "REFUSED";
    finalDecision = {
      action: "REFUSE",
      confidence: 0,
      price: 0,
      rationale: verdict.reason,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } else if (verdict.state === "INCOMPLETE") {
    state = "INCOMPLETE";
    finalDecision = {
      action: "REFUSE",
      confidence: 0,
      price: 0,
      rationale: verdict.reason,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } else {
    state = "VALID";
    finalDecision = {
      action: decisionProposal?.action || "HOLD",
      confidence: decisionProposal?.confidence || 0.5,
      price: decisionProposal?.price || 0.5,
      rationale: decisionProposal?.rationale || "Validated against canonical market identity with zero contamination.",
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  const receiptDraft = {
    protocol: "EPOCHLINE" as const,
    version: "1.0.0" as const,
    state,
    market: {
      marketId: identity.marketId,
      symbol: identity.symbol,
      pool: identity.poolAddress,
      tradingStart: identity.tradingStart.toString(),
      expiry: identity.expiry.toString(),
      capturedAtBlock: identity.capturedAtBlock.toString(),
    },
    input: {
      acceptedCount: verdict.accepted.length,
      rejectedCount: verdict.offending.length,
      acceptedEvidence: verdict.accepted,
      rejectedEvidence: verdict.offending,
    },
    policy: {
      ruleset: "market-instance-v1" as const,
      policyHash,
    },
    decision: finalDecision,
    proof: {
      evidenceHash,
      marketIdentityHash,
    },
  };

  const receiptHash = computeReceiptHash(receiptDraft);

  return {
    ...receiptDraft,
    proof: {
      evidenceHash,
      marketIdentityHash,
      receiptHash,
    },
  };
}

export function verifyDecisionReceipt(receipt: DecisionReceipt): {
  isValid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  const expectedPolicy = computePolicyHash(receipt.policy.ruleset);
  if (receipt.policy.policyHash !== expectedPolicy) {
    reasons.push("Policy hash mismatch");
  }

  const calculatedEvidenceHash = computeEvidenceHash(receipt.input.acceptedEvidence);
  if (receipt.proof.evidenceHash !== calculatedEvidenceHash) {
    reasons.push(`Evidence hash mismatch: calculated ${calculatedEvidenceHash} vs receipt ${receipt.proof.evidenceHash}`);
  }

  const calculatedReceiptHash = computeReceiptHash({
    protocol: receipt.protocol,
    version: receipt.version,
    state: receipt.state,
    market: receipt.market,
    input: receipt.input,
    policy: receipt.policy,
    decision: receipt.decision,
    proof: {
      evidenceHash: receipt.proof.evidenceHash,
      marketIdentityHash: receipt.proof.marketIdentityHash,
    },
  });

  if (receipt.proof.receiptHash !== calculatedReceiptHash) {
    reasons.push(`Receipt hash mismatch: calculated ${calculatedReceiptHash} vs receipt ${receipt.proof.receiptHash}`);
  }

  if (receipt.state === "VALID") {
    if (receipt.input.rejectedCount > 0) {
      reasons.push("Invariant violated: State is VALID but rejectedCount > 0");
    }
    if (receipt.input.rejectedEvidence.length > 0) {
      reasons.push("Invariant violated: State is VALID but rejectedEvidence contains items");
    }
    if (receipt.decision.action === "REFUSE") {
      reasons.push("Invariant violated: State is VALID but decision action is REFUSE");
    }
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
}
