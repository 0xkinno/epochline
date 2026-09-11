import { keccak256, stringToHex, type Hex } from "viem";
import type { DecisionReceipt } from "./decisionReceipt";

export type ExecutionState = "SEALED" | "SIGNED" | "SUBMITTED" | "CONFIRMED" | "REJECTED" | "EXPIRED";

export interface ExecutionIntent {
  receiptHash: Hex;
  marketId: Hex;
  poolAddress: `0x${string}`;
  signer: `0x${string}`;
  side: "YES" | "NO" | "BUY_YES" | "BUY_NO";
  amount: number;
  price: number;
  orderExpiry: number;
  nonce: number;
  createdAt: number;
}

export interface ExecutionSeal {
  protocol: "EPOCHLINE";
  version: "1.0.0";
  state: ExecutionState;
  intent: ExecutionIntent;
  intentHash: Hex;
  signature?: Hex;
  txHash?: Hex;
  blockNumber?: number;
  confirmedAt?: number;
  rejectionReason?: string;
}

export function computeIntentHash(intent: ExecutionIntent): Hex {
  const payload = JSON.stringify({
    receiptHash: intent.receiptHash.toLowerCase(),
    marketId: intent.marketId.toLowerCase(),
    poolAddress: intent.poolAddress.toLowerCase(),
    signer: intent.signer.toLowerCase(),
    side: intent.side,
    amount: intent.amount,
    price: intent.price,
    orderExpiry: intent.orderExpiry,
    nonce: intent.nonce,
    createdAt: intent.createdAt,
  });

  return keccak256(stringToHex(payload));
}

export function createExecutionSeal(params: {
  receipt: DecisionReceipt;
  signer: `0x${string}`;
  side: "YES" | "NO" | "BUY_YES" | "BUY_NO";
  amount: number;
  price: number;
  orderExpiry: number;
  nonce?: number;
}): ExecutionSeal {
  const { receipt, signer, side, amount, price, orderExpiry, nonce = 1 } = params;

  if (receipt.state !== "VALID") {
    throw new Error(`Cannot create ExecutionSeal: DecisionReceipt state is '${receipt.state}' (must be VALID).`);
  }

  if (amount <= 0) {
    throw new Error(`Invalid execution amount: ${amount} (must be > 0).`);
  }

  if (price <= 0 || price >= 1) {
    throw new Error(`Invalid probability price: ${price} (must be in open interval (0, 1)).`);
  }

  const marketExpiry = Number(receipt.market.expiry);
  if (orderExpiry > marketExpiry) {
    throw new Error(`Order expiry (${orderExpiry}) exceeds market expiry (${marketExpiry}).`);
  }

  const intent: ExecutionIntent = {
    receiptHash: receipt.proof.receiptHash,
    marketId: receipt.market.marketId,
    poolAddress: receipt.market.pool,
    signer: signer.toLowerCase() as `0x${string}`,
    side,
    amount,
    price,
    orderExpiry,
    nonce,
    createdAt: Math.floor(Date.now() / 1000),
  };

  const intentHash = computeIntentHash(intent);

  return {
    protocol: "EPOCHLINE",
    version: "1.0.0",
    state: "SEALED",
    intent,
    intentHash,
  };
}

export function verifyExecutionSeal(
  seal: ExecutionSeal,
  receipt: DecisionReceipt
): { isValid: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Invariant: Seal receiptHash must match receipt.proof.receiptHash
  if (seal.intent.receiptHash.toLowerCase() !== receipt.proof.receiptHash.toLowerCase()) {
    reasons.push(
      `Receipt hash mismatch: seal has ${seal.intent.receiptHash}, receipt has ${receipt.proof.receiptHash}`
    );
  }

  // 2. Invariant: Market ID must match exactly
  if (seal.intent.marketId.toLowerCase() !== receipt.market.marketId.toLowerCase()) {
    reasons.push(
      `Market ID mismatch: seal targets ${seal.intent.marketId}, receipt targets ${receipt.market.marketId}`
    );
  }

  // 3. Invariant: Pool must match exactly
  if (seal.intent.poolAddress.toLowerCase() !== receipt.market.pool.toLowerCase()) {
    reasons.push(
      `Pool address mismatch: seal pool ${seal.intent.poolAddress}, receipt pool ${receipt.market.pool}`
    );
  }

  // 4. Invariant: Intent hash must be authentic
  const expectedIntentHash = computeIntentHash(seal.intent);
  if (seal.intentHash !== expectedIntentHash) {
    reasons.push(`Intent hash mismatch: computed ${expectedIntentHash}, seal has ${seal.intentHash}`);
  }

  // 5. Invariant: Order expiry must not exceed market expiry
  if (seal.intent.orderExpiry > Number(receipt.market.expiry)) {
    reasons.push(
      `Order expiry (${seal.intent.orderExpiry}) exceeds market expiry (${receipt.market.expiry})`
    );
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
}
