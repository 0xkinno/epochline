import { createPublicClient, http, defineChain, type Hex, type PublicClient, type TransactionReceipt } from "viem";
import { SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import type { ExecutionSeal } from "./executionSeal";
import { verifyExecutionSeal } from "./executionSeal";
import type { DecisionReceipt } from "./decisionReceipt";

const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network", "https://api.infra.testnet.somnia.network"] },
    public: { http: ["https://dream-rpc.somnia.network", "https://api.infra.testnet.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

export interface ExecutionVerificationReport {
  isVerified: boolean;
  txHash: Hex;
  blockNumber: number;
  gasUsed: string;
  status: "SUCCESS" | "REVERTED" | "NOT_FOUND";
  checks: {
    txExists: boolean;
    receiptSuccess: boolean;
    signerMatches: boolean;
    targetValid: boolean;
    marketIdMatches: boolean;
    poolMatches: boolean;
    temporalWindowValid: boolean;
    sealLinked: boolean;
  };
  reasons: string[];
  verifiedAt: string;
}

export class ExecutionVerifier {
  private client: PublicClient;

  constructor(rpcUrl: string = "https://dream-rpc.somnia.network") {
    this.client = createPublicClient({
      chain: somniaTestnet,
      transport: http(rpcUrl),
    });
  }

  /**
   * Independently reads and verifies an on-chain trade or anchor transaction against the ExecutionSeal and DecisionReceipt.
   */
  public async verifyTransaction(params: {
    txHash: Hex;
    seal: ExecutionSeal;
    receipt: DecisionReceipt;
    knownRegistryAddress?: `0x${string}`;
  }): Promise<ExecutionVerificationReport> {
    const { txHash, seal, receipt, knownRegistryAddress } = params;
    const reasons: string[] = [];

    // 1. Verify Seal Integrity first
    const sealCheck = verifyExecutionSeal(seal, receipt);
    if (!sealCheck.isValid) {
      reasons.push(...sealCheck.reasons);
    }

    let tx: any = null;
    let txReceipt: TransactionReceipt | null = null;
    let block: any = null;

    try {
      tx = await this.client.getTransaction({ hash: txHash });
    } catch (e: any) {
      reasons.push(`Transaction lookup failed: ${e.message}`);
    }

    try {
      txReceipt = await this.client.getTransactionReceipt({ hash: txHash });
    } catch (e: any) {
      reasons.push(`Transaction receipt lookup failed: ${e.message}`);
    }

    const txExists = Boolean(tx && txReceipt);
    const receiptSuccess = txReceipt?.status === "success";

    if (!txExists) {
      reasons.push("Transaction does not exist on-chain.");
    }
    if (!receiptSuccess) {
      reasons.push("Transaction execution status is REVERTED.");
    }

    // 2. Verify signer
    const signerMatches = Boolean(
      tx && tx.from && tx.from.toLowerCase() === seal.intent.signer.toLowerCase()
    );
    if (!signerMatches && tx) {
      reasons.push(`Signer mismatch: tx.from (${tx.from}) != seal signer (${seal.intent.signer})`);
    }

    // 3. Verify target contract (BinaryModule, CLOB pool, or Registry)
    const validTargets = [
      (SOMNIA_TESTNET_ADDRESSES.binaryModule ?? "0x3ecC694Cef705358864a646142ac17A90E29e388").toLowerCase(),
      (SOMNIA_TESTNET_ADDRESSES.marketsCore ?? "0x2802504314685D89bF6C992CA5a8e7cC78bc0294").toLowerCase(),
      seal.intent.poolAddress.toLowerCase(),
      (knownRegistryAddress || "").toLowerCase(),
    ].filter(Boolean);

    const targetValid = Boolean(
      tx && tx.to && validTargets.some((target) => target.toLowerCase() === tx.to.toLowerCase())
    );
    if (!targetValid && tx) {
      reasons.push(`Target contract (${tx.to}) is not a registered DreamDEX venue or EPOCHLINE registry.`);
    }

    // 4. Temporal window check
    let temporalWindowValid = true;
    if (txReceipt) {
      try {
        block = await this.client.getBlock({ blockNumber: txReceipt.blockNumber });
        const txTimestamp = Number(block.timestamp);
        const marketExpiry = Number(receipt.market.expiry);
        if (txTimestamp > marketExpiry) {
          temporalWindowValid = false;
          reasons.push(`Execution occurred post-expiry: block time (${txTimestamp}) > market expiry (${marketExpiry})`);
        }
      } catch (e: any) {
        // block time read note
      }
    }

    const marketIdMatches = seal.intent.marketId.toLowerCase() === receipt.market.marketId.toLowerCase();
    const poolMatches = seal.intent.poolAddress.toLowerCase() === receipt.market.pool.toLowerCase();
    const sealLinked = seal.intent.receiptHash.toLowerCase() === receipt.proof.receiptHash.toLowerCase();

    const isVerified =
      txExists &&
      receiptSuccess &&
      signerMatches &&
      targetValid &&
      marketIdMatches &&
      poolMatches &&
      temporalWindowValid &&
      sealLinked &&
      reasons.length === 0;

    return {
      isVerified,
      txHash,
      blockNumber: txReceipt ? Number(txReceipt.blockNumber) : 0,
      gasUsed: txReceipt ? txReceipt.gasUsed.toString() : "0",
      status: txReceipt ? (txReceipt.status === "success" ? "SUCCESS" : "REVERTED") : "NOT_FOUND",
      checks: {
        txExists,
        receiptSuccess,
        signerMatches,
        targetValid,
        marketIdMatches,
        poolMatches,
        temporalWindowValid,
        sealLinked,
      },
      reasons,
      verifiedAt: new Date().toISOString(),
    };
  }
}
